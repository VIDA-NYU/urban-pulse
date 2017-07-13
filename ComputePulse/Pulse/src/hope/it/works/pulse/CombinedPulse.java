package hope.it.works.pulse;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.PrintStream;
import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;

import hope.it.works.ct.MyIntList;
import hope.it.works.utils.DisjointSets;
import hope.it.works.utils.Utilities;

public class CombinedPulse {

	public class Feature implements Comparable<Feature> {
		public boolean [] res;
		public int [] pulseId;
		public double rank;
		
		public double [] fnRank;
		public double [] maxRank;
		public double [] sigRank;
		public String city;
		CombinedPulse parent;
		
		public Feature(int length, CombinedPulse parent) {
			this.parent = parent; 
			res = new boolean[length];
			pulseId = new int[length];
			
			fnRank = new double[length];
			maxRank = new double[length];
			sigRank = new double[length];
			
			rank = -1;
		}
		
		public double getRank() {
			if(rank == -1) {
				rank = 0;
				for(int i = 0;i < res.length;i ++) {
					int pid = pulseId[i];
					Pulse p = pulse[i][pid];
					double maxImp = ((double)p.maxct) / p.maxTime.length;
					double smaxImp = ((double)p.sigct) / p.maxTime.length;
					double fnImp = -Double.MAX_VALUE;
					for(int j = 0;j < p.vals.length;j ++) {
						fnImp = Math.max(fnImp, p.vals[j]);
					}
					fnRank[i] = fnImp;
					maxRank[i] = maxImp;
					sigRank[i] = smaxImp;
					
					rank += maxImp * maxImp + fnImp * fnImp + smaxImp * smaxImp;
				}
				rank = Math.sqrt(rank);
			}
			return rank;
		}

		@Override
		public int compareTo(Feature o) {
			// descending order
			double r1 = getRank();
			double r2 = o.getRank();
			if(r1 < r2) {
				return 1;
			}
			if(r1 > r2) {
				return -1;
			}
			return 0;
		}
	}
	
	public String dataFolder;
	public String dataName;
	public Pulse [][] pulse;
	Feature [] features;
	
	public CombinedPulse(String dataFolder, String dataName) {
		this.dataFolder = dataFolder;
		this.dataName = dataName;
	}
	
	public CombinedPulse() {
		
	}

	public Pulse [] readPulse(String fileName) {
		try {
			BufferedReader reader = new BufferedReader(new FileReader(fileName));
			String [] line = Utilities.getLine(reader, ",");
			int nt = Integer.parseInt(line[0]);
			int length = Integer.parseInt(line[1]);
			
			Pulse [] pulse = new Pulse[nt];
			
			for(int i = 0;i < nt;i ++) {
				Pulse p = new Pulse(length);
				line = Utilities.getLine(reader, ",");
				p.x = Float.parseFloat(line[0]);
				p.y = Float.parseFloat(line[1]);
				
				line = Utilities.getLine(reader, ",");
				p.vertices = new MyIntList();
				for(int j = 0;j < line.length;j ++) {
					p.vertices.add(Integer.parseInt(line[j]));
				}
				
				p.maxct = 0;
				p.sigct = 0;
				line = Utilities.getLine(reader, ",");
				for(int j = 0;j < p.maxTime.length;j ++) {
					p.maxTime[j] = Integer.parseInt(line[j]);
					p.maxct += p.maxTime[j]; 
				}
				
				line = Utilities.getLine(reader, ",");
				for(int j = 0;j < p.sigMaxTime.length;j ++) {
					p.sigMaxTime[j] = Integer.parseInt(line[j]);
					p.sigct += p.sigMaxTime[j]; 
				}
				
				line = Utilities.getLine(reader, ",");
				for(int j = 0;j < p.vals.length;j ++) {
					p.vals[j] = Double.parseDouble(line[j]);
				}
				
				line = Utilities.getLine(reader, ",");
				for(int j = 0;j < p.scalars.length;j ++) {
					p.scalars[j] = Double.parseDouble(line[j]);
				}
				
				pulse[i] = p;
			}
			reader.close();
			return pulse;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	DisjointSets dj;
	void buildVertexSet(Pulse[] pulses) {
		for(int i = 0;i < pulses.length;i ++) {
			for(int j = 0;j < pulses[i].vertices.length - 1;j ++) { 
				int v1 = pulses[i].vertices.get(j);
				int v2 = pulses[i].vertices.get(j + 1);
				dj.union(dj.find(v1), dj.find(v2));
			}
		}
	}

	Integer [] uniqueLocs;
	HashMap<Integer, Integer> invMap;
	void initVertices() {
		HashSet<Integer> comps = new HashSet<>();
		for(int i = 0;i < pulse.length;i ++) {
			for(int j = 0;j < pulse[i].length;j ++) {
				comps.add(dj.find(pulse[i][j].vertices.get(0)));
			}
		}
		uniqueLocs = comps.toArray(new Integer[0]);
		invMap = new HashMap<>();
		features = new Feature[uniqueLocs.length];
		for(int i = 0;i < uniqueLocs.length;i ++) {
			invMap.put(uniqueLocs[i],i);
			features[i] = new Feature(pulse.length, this);
		}
		System.out.println("Total unique locs: " + uniqueLocs.length);

		for(int i = 0;i < pulse.length;i ++) {
			// for each resolution
			for(int j = 0;j < pulse[i].length;j ++) {
				int fid = invMap.get(dj.find(pulse[i][j].vertices.get(0)));
				boolean present = false;
				for(int k = 0;k < pulse[i][j].maxTime.length;k ++) {
					if(pulse[i][j].maxTime[k] != 0) {
						present = true;
						break;
					}
				}
				features[fid].res[i] = present;
				features[fid].pulseId[i] = j;
				// TODO remove later
				features[fid].city = "not_used";
			}
		}
		Arrays.sort(features);
	}
	
	public void readPulse(String [] resolution, String filter) {
		String folder = dataFolder;

		pulse = new Pulse[resolution.length][];
		dj = new DisjointSets();
		for(int res = 0;res < resolution.length;res ++) {
			String file = folder + "ts-" + dataName + "-" + resolution[res] + filter + ".txt";
			pulse[res] = readPulse(file);
			buildVertexSet(pulse[res]);
		}
		initVertices();
	}

	void printClusters(String file) {
		try {
			PrintStream pr = new PrintStream(dataFolder + file);
			int no = features.length;
			pr.println(no);
			for(int i = 0;i < no;i ++) {
				HashSet<Integer> set = new HashSet<>();
				for(int j = 0;j < features[i].pulseId.length;j ++) {
					int pid = features[i].pulseId[j];
					Pulse p = pulse[j][pid];
					for (int l = 0; l < p.vertices.length; l++) {
						int v = p.vertices.get(l);
						set.add(v);
					}
				}
				pr.println(set.size());
				for(int v: set) {
					pr.println(v);
				}
			}
			pr.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	void printFeatures(String file) {
		try {
			PrintStream pr = new PrintStream(file);
			int no = features.length;
			pr.println(no);
			DecimalFormat dec = new DecimalFormat("#0.000000000");
			for(int i = 0;i < no;i ++) {
				pr.println(features[i].city + "," + dec.format(features[i].rank) + "," + features[i].res.length);
				HashSet<Integer> set = new HashSet<>();
				for(int j = 0;j < features[i].pulseId.length;j ++) {
					int pid = features[i].pulseId[j];
					Pulse p = pulse[j][pid];
					for (int l = 0; l < p.vertices.length; l++) {
						int v = p.vertices.get(l);
						set.add(v);
					}
				}
				boolean first = true; 
				for(int v: set) {
					if(first) {
						pr.print(v);
						first = false;
					} else {
						pr.print("," + v);
					}
				}
				pr.println();
				for(int j = 0;j < features[i].res.length;j ++) {
					pr.println(UrbanPulse.resolution[j] + "," + features[i].res[j] + "," + dec.format(features[i].maxRank[j]) + "," + dec.format(features[i].fnRank[j]) + "," + dec.format(features[i].sigRank[j]));
					int pid = features[i].pulseId[j];
					Pulse p = pulse[j][pid];
					for(int k = 0;k < p.maxTime.length;k ++) {
						pr.print(p.maxTime[k]);
						if(k < p.maxTime.length - 1) pr.print(",");
					}
					pr.println();
					for(int k = 0;k < p.sigMaxTime.length;k ++) {
						pr.print(p.sigMaxTime[k]);
						if(k < p.sigMaxTime.length - 1) pr.print(",");
					}
					pr.println();
					for(int k = 0;k < p.vals.length;k ++) {
						pr.print(dec.format(p.vals[k]));
						if(k < p.vals.length - 1) pr.print(",");
					}
					pr.println();
					for(int k = 0;k < p.scalars.length;k ++) {
						pr.print(dec.format(p.scalars[k]));
						if(k < p.scalars.length - 1) pr.print(",");
					}
					pr.println();
				}
			}
			pr.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public boolean combinePulses(String[] resolution, String dataFolder, String dataName, String filter) {
		UrbanPulse.resolution = resolution;
		CombinedPulse com = new CombinedPulse(dataFolder, dataName);
		com.readPulse(resolution, filter);
		com.printFeatures(dataFolder + dataName + filter + "-features.txt");
		return true;
	}
}
