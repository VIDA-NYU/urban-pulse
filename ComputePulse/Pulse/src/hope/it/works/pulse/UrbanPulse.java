package hope.it.works.pulse;

import hope.it.works.ct.Function;
import hope.it.works.ct.MergeTrees;
import hope.it.works.ct.MyIntList;
import hope.it.works.ct.Persistence;
import hope.it.works.ct.ReebGraphData;
import hope.it.works.ct.SimplifyFeatures;
import hope.it.works.ct.SimplifyFeatures.Feature;
import hope.it.works.data.OffGraph;
import hope.it.works.utils.DisjointSets;
import hope.it.works.utils.Utilities;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.PrintStream;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

public class UrbanPulse {

	public class Location {
		public int x, y;
		public MyIntList timeSteps = new MyIntList();

		@Override
		public boolean equals(Object obj) {
			Location l = (Location) obj;
			return (x == l.x && y == l.y);
		}
	}

	OffGraph input;
	float[][] fnVals;
	float[][] scalars;
	int xres, yres;
	double lbx, lby, rtx, rty;
	Location[] sigLocs;
	DisjointSets dj;
	MyIntList[] locs;
	ArrayList<Pulse> pulse = new ArrayList<>();
	HashMap<Integer, Location> allLocs;

	/**
	 * 
	 * @param fileNames
	 *            scalar functions in increasing order of time
	 */
	public void computePulse(String[] fileNames, int radius) {
		readInput(fileNames);
		normalizeInput();
		getSignificantLocations(-1);
		getSignificantLocations(10);
		getDistinctLocations(radius);
		getTimeSeries();
	}

	private void getTimeSeries() {
		try {
			pulse.clear();
			for (int i = 0; i < locs.length; i++) {
				float x = 0;
				float y = 0;
				MyIntList list = new MyIntList();
				Pulse ts = new Pulse(fnVals.length);
				ts.maxct = 0;
				ts.sigct = 0;
				for (int j = 0; j < locs[i].length; j++) {
					int lin = locs[i].get(j);
					x += sigLocs[lin].x;
					y += sigLocs[lin].y;
	
					int v = sigLocs[lin].x + sigLocs[lin].y * xres;
					list.add(v);
	
					Location loc = allLocs.get(v);
					for (int k = 0; k < loc.timeSteps.length; k++) {
						ts.maxTime[loc.timeSteps.get(k)] = 1;
					}
	
					for (int k = 0; k < sigLocs[lin].timeSteps.length; k++) {
						ts.sigMaxTime[sigLocs[lin].timeSteps.get(k)] = 1;
					}
				}
				
				x /= locs[i].length;
				y /= locs[i].length;
	
				ts.x = x;
				ts.y = y;
	
				for (int j = 0; j < fnVals.length; j++) {
					ts.maxct += ts.maxTime[j];
					ts.sigct += ts.sigMaxTime[j];
					float val = 0;
					float sval = 0;
					for (int k = 0; k < list.length; k++) {
						val = Math.max(val, fnVals[j][list.get(k)]);
						sval = Math.max(sval, scalars[j][list.get(k)]);
					}
					ts.vals[j] = val;// / list.length;
					ts.scalars[j] = sval;
				}
				ts.vertices = list;
				pulse.add(ts);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * locs has the set of distinct locations of extrema
	 */
	private void getDistinctLocations(int radius) {
		dj = new DisjointSets();
		HashMap<Integer, Integer> locMap = new HashMap<>();

		for (int i = 0; i < sigLocs.length; i++) {
			Location loc = sigLocs[i];
			int v = loc.x + xres * loc.y;
			if (locMap.containsKey(v)) {
				int comp = locMap.get(v);
				dj.union(dj.find(comp), dj.find(i));
			}
			locMap.put(v, i);

			for (int x = loc.x - radius; x <= loc.x + radius; x++) {
				if (x < 0 || x >= xres) {
					continue;
				}
				for (int y = loc.y - 1; y <= loc.y + 1; y++) {
					if (y < 0 || y >= yres) {
						continue;
					}
					int vv = x + xres * y;
					if (locMap.containsKey(vv)) {
						int comp = locMap.get(vv);
						dj.union(dj.find(comp), dj.find(i));
					}
				}
			}
		}

		HashSet<Integer> set = new HashSet<>();
		for (int i = 0; i < sigLocs.length; i++) {
			set.add(dj.find(i));
		}
		Integer[] comps = set.toArray(new Integer[0]);
		System.out.println("No. of locations: " + sigLocs.length);
		System.out.println("No. of unique locations: " + comps.length);
		locs = new MyIntList[comps.length];
		HashMap<Integer, Integer> compMap = new HashMap<>();
		for (int i = 0; i < comps.length; i++) {
			compMap.put(comps[i], i);
			locs[i] = new MyIntList();
		}
		for (int i = 0; i < sigLocs.length; i++) {
			int pos = compMap.get(dj.find(i));
			locs[pos].add(i);
		}
	}

	/**
	 * 
	 * @param k
	 *            top K significant locations to consider per time step.
	 */
	private void getSignificantLocations(int k) {
		try {
			HashMap<Integer, Location> locations = new HashMap<>();
			boolean all = false;
			for (int i = 0; i < fnVals.length; i++) {
				input.updateNewfunction(fnVals[i]);

				MergeTrees ct = new MergeTrees();
				MergeTrees.TreeType tree = MergeTrees.TreeType.SplitTree;
				ct.computeTree(input, tree);
				ReebGraphData rgData = ct.output(MergeTrees.TreeType.SplitTree);
				Function fn = new Persistence(rgData);
				SimplifyFeatures sim = new SimplifyFeatures();
				sim.simplify(rgData, null, fn, 0.01f, true);
				if (k == -1) {
					k = sim.brFeatures.length;
					all = true;
				}
				k = Math.min(k, sim.brFeatures.length);
				for (int j = 0; j < k; j++) {
					Feature f = sim.brFeatures[j];
					if (!locations.containsKey(f.v)) {
						Location loc = new Location();
						loc.x = f.v % xres;
						loc.y = f.v / xres;
						locations.put(f.v, loc);
					}
					Location loc = locations.get(f.v);
					loc.timeSteps.add(i);
				}
			}
			sigLocs = locations.values().toArray(new Location[0]);
			if (all) {
				allLocs = locations;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	float[] max;
	int[] resMap;

	void normalizeInput() {
		for (int i = 0; i < max.length; i++) {
			if (max[i] == 0) {
				max[i] = 1;
			}
		}
		scalars = new float[fnVals.length][];
		for (int i = 0; i < fnVals.length; i++) {
			scalars[i] = new float[fnVals[i].length];
			for (int j = 0; j < fnVals[0].length; j++) {
				scalars[i][j] = fnVals[i][j];
				fnVals[i][j] /= max[resMap[i]];
			}
		}
	}

	private void readInput(String[] fileNames) {
		try {
			int nv = 0;
			int curRes = 0;
			int resct = 0;
			max = new float[resolution.length];
			for (int i = 0; i < max.length; i++) {
				max[i] = -Float.MAX_VALUE;
			}
			resMap = new int[fileNames.length];
			for (int i = 0; i < fileNames.length; i++) {
				if (resct == ct[curRes]) {
					curRes++;
					resct = 0;
				}
				resMap[i] = curRes;
				BufferedReader reader = new BufferedReader(new FileReader(
						fileNames[i]));
				String[] line = Utilities.getLine(reader, ",");
				if (i == 0) {
					// setup grid
					xres = Integer.parseInt(line[0].trim());
					yres = Integer.parseInt(line[1].trim());
					nv = xres * yres;
					fnVals = new float[fileNames.length][nv];
					input = new OffGraph();
					input.initMesh(xres, yres);
				}
				// bounding box;
				line = Utilities.getLine(reader, ",");
				lby = Double.parseDouble(line[0]);
				lbx = Double.parseDouble(line[1]);
				rty = Double.parseDouble(line[2]);
				rtx = Double.parseDouble(line[3]);
				// ignore next line
				reader.readLine();

				for (int j = 0; j < nv; j++) {
					fnVals[i][j] = Float.parseFloat(reader.readLine().trim());
					max[curRes] = Math.max(fnVals[i][j], max[curRes]);
				}
				reader.close();
				resct++;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	void printLocations() {
		String file = "/home/harishd/Desktop/Projects/3D-GIS/code/urbane/data/nyc/pulse/locs.txt";
		try {
			PrintStream pr = new PrintStream(file);
			pr.println(sigLocs.length);
			for (int i = 0; i < sigLocs.length; i++) {
				pr.println(sigLocs[i].x + "," + sigLocs[i].y + ","
						+ sigLocs[i].timeSteps.length);
			}
			pr.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	void printDistinctLocations() {
		String file = "/home/harishd/Desktop/Projects/3D-GIS/code/urbane/data/nyc/pulse/dlocs.txt";
		try {
			PrintStream pr = new PrintStream(file);
			pr.println(locs.length);
			for (int i = 0; i < locs.length; i++) {
				int x = 0;
				int y = 0;
				int ct = 0;
				for (int j = 0; j < locs[i].length; j++) {
					x += sigLocs[locs[i].get(j)].x;
					y += sigLocs[locs[i].get(j)].y;
					ct += sigLocs[locs[i].get(j)].timeSteps.length;
				}
				x /= locs[i].length;
				y /= locs[i].length;
				pr.println(x + "," + y + "," + ct);

			}
			pr.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	void printTimeSeries(String prefix, int st, int end) {
		ArrayList<Pulse> localPulses = new ArrayList<>();

		boolean restrictResolution = false;
		if (restrictResolution) {
			// Store only if pulse is present at given resolution
			for (Pulse ts : pulse) {
				boolean present = false;
				for (int i = st; i < end; i++) {
					if (ts.maxTime[i] != 0) {
						present = true;
						break;
					}
				}
				if (present) {
					localPulses.add(ts);
				}
			}
		} else {
			// Store pulse are every resolution irrespective of whether it is
			// present or not in that resolution
			localPulses.addAll(pulse);
		}

		String file = dataFolder + "ts-" + dataName + "-" + prefix + ".txt";
		try {
			PrintStream pr = new PrintStream(file);
			int pulseSize = end - st;
			pr.println(localPulses.size() + "," + pulseSize);
			DecimalFormat dec = new DecimalFormat("#0.000000000");
			pr.println(xres + "," + yres);
			pr.println(dec.format(lbx) + "," + dec.format(lby) + "," + dec.format(rtx) + "," + dec.format(rty));
			for (Pulse ts : localPulses) {
				pr.println(ts.x + "," + ts.y + "," + ts.maxct + "," + ts.sigct);
				for (int i = 0; i < ts.vertices.length; i++) {
					if (i == 0) {
						pr.print(ts.vertices.array[i]);
					} else {
						pr.print("," + ts.vertices.array[i]);
					}
				}
				pr.println();
				for (int i = st; i < end; i++) {
					if (i == st) {
						pr.print(ts.maxTime[i]);
					} else {
						pr.print("," + ts.maxTime[i]);
					}
				}
				pr.println();
				for (int i = st; i < end; i++) {
					if (i == st) {
						pr.print(ts.sigMaxTime[i]);
					} else {
						pr.print("," + ts.sigMaxTime[i]);
					}
				}
				pr.println();
				for (int i = st; i < end; i++) {
					if (i == st) {
						pr.print(dec.format(ts.vals[i]));
					} else {
						pr.print("," + dec.format(ts.vals[i]));
					}
				}
				pr.println();
				for (int i = st; i < end; i++) {
					if (i == st) {
						pr.print(dec.format(ts.scalars[i]));
					} else {
						pr.print("," + dec.format(ts.scalars[i]));
					}
				}
				pr.println();
			}
			pr.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	static String dataFolder;
	static String[] resolution;
	static int[] st;
	static int[] ct;
	static String dataName;

	public boolean test() {
		return true;
	}

	public boolean computePulses(String[] resolution, int[] st, int[] ct,String dataFolder, String dName, String filter, int radius) {
		UrbanPulse.resolution = resolution;
		UrbanPulse.st = st;
		UrbanPulse.ct = ct;
		UrbanPulse.dataName = dName;
		UrbanPulse.dataFolder = dataFolder;

		ArrayList<String> allFiles = new ArrayList<>();
		ArrayList<Integer> index = new ArrayList<>();
		System.out.println(new File(dataFolder).getAbsolutePath());
		for (int res = 0; res < resolution.length; res++) {
			index.add(allFiles.size());
			for (int t = st[res]; t < st[res] + ct[res]; t++) {
				String file = dataFolder + dataName + "_" + resolution[res] + "_" + t + filter + ".scalars";
				allFiles.add(file);
			}
		}
		index.add(allFiles.size());

		UrbanPulse pulse = new UrbanPulse();
		String[] files = allFiles.toArray(new String[0]);
		pulse.computePulse(files, radius);
		System.out.println("finished computing pulse");
		for (int res = 0; res < resolution.length; res++) {
			pulse.printTimeSeries(resolution[res] + filter, index.get(res), index.get(res + 1));
		}

		return true;
	}
}
