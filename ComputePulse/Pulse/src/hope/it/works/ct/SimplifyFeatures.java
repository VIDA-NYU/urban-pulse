package hope.it.works.ct;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import hope.it.works.utils.Utilities;

public class SimplifyFeatures {
	
	public class Feature {
		public int v;
		public int br;
		public MyIntList arcs = new MyIntList();
		public float wt;
		public float exFn;
		public float avgFn;
		public float sadFn;
		
		public byte type;
	}
	
	public Feature [] brFeatures;
	private SimplifyCT sim;
	
	private HashSet<Integer> featureSet = new HashSet<Integer>();
	private HashMap<Integer, Integer> cps;
	
	public void simplify(ReebGraphData rgData, String simrg, Function fn, float th, boolean max) {
		sim = new SimplifyCT();
		sim.setInput(rgData);
		sim.simplify(fn);
		System.out.println("Finished simplification");

		int totalFeatures = sim.order.length;
		int noFeatures = countFeatures(th, max);
		noFeatures = Math.min(noFeatures, totalFeatures);
		brFeatures = new Feature[noFeatures];
		
		initFeatures();
		
		sim = new SimplifyCT();
		sim.setInput(rgData);
		sim.simplify(fn,totalFeatures, noFeatures);
				
		getFeatures();
		
		for(int i = 0;i < brFeatures.length;i ++) {
			populateFeature(i);
		}
		
		System.out.println("Updated features");
	}
	
	private void getFeatures() {
		for(int i = 0;i < sim.branches.length;i ++) {
			if(sim.removed[i]) {
				continue;
			}
			Branch br = sim.branches[i];
			int fno = -1;
			if(cps.get(br.to) != null) {
				fno = cps.get(br.to);
			} 
			if(cps.get(br.from) != null) {
				fno = cps.get(br.from);
			}
			if(fno == -1) {
				continue;
			}
			brFeatures[fno].br = i;
			featureSet.add(i);
		}
	}
	
	private int countFeatures(float th, boolean max) {
		ReebGraphData data = sim.data;
		int no = 0;
		
		for(int i = 0;i < sim.order.length;i ++) {
			Branch br = sim.branches[sim.order.array[i]];
			float fn = data.nodes[br.to].fn - data.nodes[br.from].fn;
			if(data.nodes[br.to].type == ReebGraphData.MAXIMUM && max) {
				if(fn >= th) {
					no ++;
				}
			} 
			if(data.nodes[br.from].type == ReebGraphData.MINIMUM && !max) {
				if(fn >= th) {
					no ++;
				}
			}
		}
		if(no == 0) {
			no = 1;
		}
		return no;
	}
	
	private void initFeatures() {
		featureSet.clear();
		int nf = brFeatures.length;
		if(nf > sim.order.length) {
			nf = sim.order.length;
			brFeatures = new Feature[nf];
		}
		int pos = sim.order.length - 1;
		ReebGraphData data = sim.data;
		cps = new HashMap<>();
		int root = 0;
		int no = 0;
		while(no < nf) {
			int bno = sim.order.get(pos); 
			Branch br = sim.branches[bno];

			if(data.nodes[br.to].type == ReebGraphData.MAXIMUM) {
				featureSet.add(bno);
				cps.put(br.to, no);
				brFeatures[no] = new Feature();
				brFeatures[no].v = data.nodes[br.to].v;
				brFeatures[no].exFn = data.nodes[br.to].fn;
				brFeatures[no].wt = data.nodes[br.to].fn - data.nodes[br.from].fn;
				brFeatures[no].sadFn = data.nodes[br.from].fn;
				brFeatures[no].type = MergeTrees.MAXIMUM;
				if(data.nodes[br.from].type == ReebGraphData.MINIMUM) {
					brFeatures[no].type |= MergeTrees.MINIMUM;
					root ++;
				}
				brFeatures[no].br = bno;
				no ++;
			} else if(data.nodes[br.from].type == ReebGraphData.MINIMUM) {
				featureSet.add(bno);
				cps.put(br.from, no);
				brFeatures[no] = new Feature();
				brFeatures[no].v = data.nodes[br.from].v;
				brFeatures[no].exFn = data.nodes[br.from].fn;
				brFeatures[no].wt = data.nodes[br.to].fn - data.nodes[br.from].fn;
				brFeatures[no].sadFn = data.nodes[br.to].fn;
				brFeatures[no].br = bno;
				brFeatures[no].type = MergeTrees.MINIMUM;
				no ++;
			}
			pos --;
		}
		if(root != 1) {
			if(root > 1) {
				Utilities.er("Can there be more than one root???");
			} else {
				Utilities.er("Where has the root gone missing");
			}
		}
	}

	private void populateFeature(int f) {
		int bno = brFeatures[f].br;
		ArrayList<Integer> queue = new ArrayList<Integer>();
		queue.add(bno);
		while(queue.size() > 0) {
			int b = queue.remove(0);
			if(b!= bno && featureSet.contains(b)) {
				continue;
			}
			Branch br = sim.branches[b];
			brFeatures[f].arcs.addAll(br.arcs);
			for(int i = 0;i < br.children.length;i ++) {
				int bc = br.children.get(i);
				queue.add(bc);
			}
		}
	}
}

