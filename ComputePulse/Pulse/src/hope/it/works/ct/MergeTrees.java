package hope.it.works.ct;

import hope.it.works.utils.DisjointSets;
import hope.it.works.utils.Utilities;

import java.io.IOException;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;

public class MergeTrees {
	public static enum TreeType {ContourTree, SplitTree, JoinTree};	
	GraphInput data;
	
	int [] cpMap;
	DisjointSets nodes;
	MyArrays myArrays = new MyArrays();
	
	public void computeTree(GraphInput data, TreeType type) throws IOException {
		this.data = data;
		long ct = System.nanoTime();
		setupData();
		orderVertices();
		switch(type) {
		case ContourTree:
			Utilities.er("Not supported");
			break;
			
		case SplitTree:
			computeSplitTree();
			break;
			
		case JoinTree:
			computeJoinTree();
			break;
			
		default:
			Utilities.er("Invalid tree type");	
		}
		
		long en = System.nanoTime();
		ct = (en - ct) / 1000000;
		
//		System.out.println("Time taken to compute tree : " + ct + " ms");
	}
	
	private void computeSplitTree() {
		findSplitTree();
	}
	
	int noVertices;
	float [] fnVertices;
	int [] prev;
	int [] next;
	void setupData() {		
		maxStar = data.getMaxDegree();
		noVertices = data.getVertexCount();
		fnVertices = data.getFnVertices();
		
		criticalPts = new byte[noVertices];
		
		sv = new int[noVertices];
		prev = new int[noVertices];
		next = new int[noVertices];
		for(int i = 0;i < noVertices;i ++) {
			sv[i] = i;
			prev[i] = -1;
			next[i] = -1;
		}
		
		cpMap = new int[noVertices + 1];
		nodes = new DisjointSets();
	}

	public void output(String op, String part, TreeType tree) {
		try {
			PrintStream p = new PrintStream(op);
			int [] arcMap;
			if(newVertex) {
				arcMap = new int[noVertices + 1];
			} else {
				arcMap = new int[noVertices];
			}
			Arrays.fill(arcMap,-1);
			int noArcs = 0;
			int noNodes = 0;
			for(int i = 0;i < noVertices;i ++) {
				if(criticalPts[i] != REGULAR) {
					noNodes ++;
				}
			}
			if(newVertex) {
				noNodes ++;
			}
			noArcs = noNodes - 1;
			p.println(noNodes + " " + noArcs);
			
			if(newVertex) {
				if(tree == TreeType.SplitTree){
					p.println(noVertices + " " + fnVertices[sv[0]] + " " + string[MINIMUM]);	
				}
			}
			for(int i = 0;i < noVertices;i ++) {
				if(criticalPts[sv[i]] != REGULAR) {
					p.println(sv[i] + " " + fnVertices[sv[i]] + " " + string[criticalPts[sv[i]]]);
				}
			}
			if(newVertex) {
				if(tree != TreeType.SplitTree){
					p.println(noVertices + " " + fnVertices[sv[noVertices - 1]] + " " + string[MAXIMUM]);
				}
			}
			
			ArrayList<Integer> arcFrom = new ArrayList<>();
			ArrayList<Integer> arcTo = new ArrayList<>();
			ArrayList<Integer> arcNos  = new ArrayList<>();
			if(tree == TreeType.SplitTree) {
				int arcNo = 0;
				for(int i = 0;i < noVertices;i ++) {
					if((criticalPts[i] == MAXIMUM || criticalPts[i] == SADDLE) && i != sv[0]) {
						arcMap[i] = arcNo;
						
						int to = i;
						int from = prev[to];
						
						while(criticalPts[from] == REGULAR) {
							arcMap[from] = arcNo;
							from = prev[from];
						}
						arcMap[from] = arcNo;
						
						p.println(from + " " + to);
						
						if(criticalPts[i] == SADDLE) {
							arcFrom.add(from);
							arcTo.add(to);
							arcNos.add(arcNo);
						}
						arcNo ++;
					}
				}
				if(newVertex) {
					int to = sv[0];
					int from = noVertices;
					arcMap[to] = arcMap[from] = arcNo ++;
					p.println(from + " " + to);
				}
				if(arcNo != noArcs) {
					Utilities.er("!!!!!!!!!!!!!!!");
				}
			} else {
				int arcNo = 0;
				for(int i = 0;i < noVertices;i ++) {
					if((criticalPts[i] == MINIMUM || criticalPts[i] == SADDLE) && i != sv[sv.length - 1]) {
						arcMap[i] = arcNo;
						
						int from = i;
						int to = next[from];
						
						while(criticalPts[to] == REGULAR) {
							arcMap[to] = arcNo;
							to = next[to];
						}
						arcMap[to] = arcNo;
						
						p.println(from + " " + to);
						if(criticalPts[i] == SADDLE) {
							arcFrom.add(from);
							arcTo.add(to);
							arcNos.add(arcNo);
						}
						arcNo ++;
					}
				}
				if(newVertex) {
					int from = sv[sv.length - 1];
					int to = noVertices;
					arcMap[to] = arcMap[from] = arcNo ++;
					p.println(from + " " + to);
				}
				if(arcNo != noArcs) {
					Utilities.er("!!!!!!!!!!!!!!!");
				}
			}
			p.close();
			
			if(part == null) {
				return;
			}
			for(int i = 0;i < arcFrom.size();i ++) {
				int from = arcFrom.get(i);
				int to = arcTo.get(i);
				arcMap[from] = arcMap[to] = arcNos.get(i);
			}
			PrintStream pt = new PrintStream(part);
			pt.println(arcMap.length);
			int ct = 0;
			for(int i = 0;i < arcMap.length;i ++) {
				pt.println(arcMap[i]);
				if(arcMap[i] == -1) {
					if(!data.isIgnored(i)) {
						ct ++;
						System.out.println("Missed: " + i);
					}
//					Utilities.er("!!!!!!!!!!!!!!! again");
				}
			}			
			pt.close();
			System.out.println("no. of nodes not in partition: " + ct);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	
	public ReebGraphData output(TreeType tree) {
		try {
			ReebGraphData rg = new ReebGraphData();
			int [] arcMap;
			if(newVertex) {
				arcMap = new int[noVertices + 1];
			} else {
				arcMap = new int[noVertices];
			}
			Arrays.fill(arcMap,-1);
			int noArcs = 0;
			int noNodes = 0;
			for(int i = 0;i < noVertices;i ++) {
				if(criticalPts[i] != REGULAR) {
					noNodes ++;
				}
			}
			if(newVertex) {
				noNodes ++;
			}
			noArcs = noNodes - 1;
			rg.noNodes = noNodes;
			rg.noArcs = noArcs;
			
			rg.nodes = new ReebGraphData.Node[noNodes];
			rg.arcs = new ReebGraphData.Arc[noArcs];

			int in = 0;
			if(newVertex) {
				if(tree == TreeType.SplitTree){
					rg.nodes[in] = rg.new Node();
					rg.nodes[in].v = noVertices;
					rg.nodeMap.put(rg.nodes[in].v, in);
					rg.nodes[in].fn = (float) fnVertices[sv[0]];
					rg.nodes[in].type = rg.getType(string[MINIMUM].trim());
					in ++;
				}
			}
			for(int i = 0;i < noVertices;i ++) {
				if(criticalPts[sv[i]] != REGULAR) {
					rg.nodes[in] = rg.new Node();
					rg.nodes[in].v = sv[i];
					rg.nodeMap.put(rg.nodes[in].v, in);
					rg.nodes[in].fn = (float) fnVertices[sv[i]];
					rg.nodes[in].type = rg.getType(string[criticalPts[sv[i]]].trim());
					in ++;
				}
			}
			if(newVertex) {
				if(tree != TreeType.SplitTree){
					rg.nodes[in] = rg.new Node();
					rg.nodes[in].v = noVertices;
					rg.nodeMap.put(rg.nodes[in].v, in);
					rg.nodes[in].fn = (float) fnVertices[sv[noVertices - 1]];
					rg.nodes[in].type = rg.getType(string[MAXIMUM].trim());
					in ++;
				}
			}
			
			ArrayList<Integer> arcFrom = new ArrayList<>();
			ArrayList<Integer> arcTo = new ArrayList<>();
			ArrayList<Integer> arcNos  = new ArrayList<>();
			if(tree == TreeType.SplitTree) {
				int arcNo = 0;
				int globalMin = -1;
				for(int i = 0;i < noVertices;i ++) {
					if(!data.isIgnored(sv[i])) {
						globalMin = sv[i];
						break;
					}
				}
				for(int i = 0;i < noVertices;i ++) {
					if((criticalPts[i] == MAXIMUM || criticalPts[i] == SADDLE) && i != globalMin) {
						arcMap[i] = arcNo;
						
						int to = i;
						int from = prev[to];
						
						while(criticalPts[from] == REGULAR) {
							arcMap[from] = arcNo;
							from = prev[from];
						}
						arcMap[from] = arcNo;
						
						if(criticalPts[i] == SADDLE) {
							arcFrom.add(from);
							arcTo.add(to);
							arcNos.add(arcNo);
						}
						
						rg.arcs[arcNo] = rg.new Arc();
						int v1 = from;
						int v2 = to;
						rg.arcs[arcNo].id = arcNo;
						rg.arcs[arcNo].from = rg.nodeMap.get(v1);
						rg.arcs[arcNo].to = rg.nodeMap.get(v2);
						rg.nodes[rg.arcs[arcNo].from].next.add(arcNo);
						rg.nodes[rg.arcs[arcNo].to].prev.add(arcNo);
						
						arcNo ++;
					}
				}
				if(newVertex) {
					int to = globalMin;//sv[0];
					int from = noVertices;
					arcMap[to] = arcMap[from] = arcNo;
					
					rg.arcs[arcNo] = rg.new Arc();
					int v1 = from;
					int v2 = to;
					rg.arcs[arcNo].id = arcNo;
					rg.arcs[arcNo].from = rg.nodeMap.get(v1);
					rg.arcs[arcNo].to = rg.nodeMap.get(v2);
					rg.nodes[rg.arcs[arcNo].from].next.add(arcNo);
					rg.nodes[rg.arcs[arcNo].to].prev.add(arcNo);
					arcNo ++;
				}
				if(arcNo != noArcs) {
					Utilities.er("!!!!!!!!!!!!!!!");
				}
			} else {
				int arcNo = 0;
				int globalMax=-1;
				for(int i = noVertices - 1;i >= 0;i --) {
					if(!data.isIgnored(sv[i])) {
						globalMax = sv[i];
						break;
					}
				}
				for(int i = 0;i < noVertices;i ++) {
					if((criticalPts[i] == MINIMUM || criticalPts[i] == SADDLE) && i != globalMax) {
						arcMap[i] = arcNo;
						
						int from = i;
						int to = next[from];
						
						while(criticalPts[to] == REGULAR) {
							arcMap[to] = arcNo;
							to = next[to];
						}
						arcMap[to] = arcNo;
						
//						p.println(from + " " + to);
						if(criticalPts[i] == SADDLE) {
							arcFrom.add(from);
							arcTo.add(to);
							arcNos.add(arcNo);
						}
						rg.arcs[arcNo] = rg.new Arc();
						int v1 = from;
						int v2 = to;
						rg.arcs[arcNo].id = arcNo;
						rg.arcs[arcNo].from = rg.nodeMap.get(v1);
						rg.arcs[arcNo].to = rg.nodeMap.get(v2);
						rg.nodes[rg.arcs[arcNo].from].next.add(arcNo);
						rg.nodes[rg.arcs[arcNo].to].prev.add(arcNo);
						
						arcNo ++;
					}
				}
				if(newVertex) {
					int from = globalMax;//sv[sv.length - 1];
					int to = noVertices;
					arcMap[to] = arcMap[from] = arcNo;
					
					rg.arcs[arcNo] = rg.new Arc();
					int v1 = from;
					int v2 = to;
					rg.arcs[arcNo].id = arcNo;
					rg.arcs[arcNo].from = rg.nodeMap.get(v1);
					rg.arcs[arcNo].to = rg.nodeMap.get(v2);
					rg.nodes[rg.arcs[arcNo].from].next.add(arcNo);
					rg.nodes[rg.arcs[arcNo].to].prev.add(arcNo);
					
					arcNo ++;
				}
				if(arcNo != noArcs) {
					Utilities.er("!!!!!!!!!!!!!!!");
				}
			}
			return rg;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	
	int [] sv;
	int maxStar = 0;

	private void orderVertices() {
		myArrays.sort(sv);
	}

	public static final byte REGULAR = 0;
	public static final byte MINIMUM = 1;
	public static final byte SADDLE = 4;
	public static final byte MAXIMUM = 2;
	
	public static String []string;
	// ugly hack
	static {
		string = new String [10];
		string[MINIMUM] = "MINIMA";
		string[MAXIMUM] = "MAXIMA";
		string[SADDLE] = "SADDLE";
		string[REGULAR] = "REGULAR";
	}
	byte [] criticalPts;
	boolean newVertex = false;
	
	int newRoot = 0;
	
	/* Split Tree */
	public void findSplitTree() {
		for(int i = noVertices - 1;i >= 0; i --) {
			int v = sv[i];
			if(data.isIgnored(v)) {
				continue;
			}
			criticalPts[v] = REGULAR;
			processVertex(v);
		}
		int in = 0;
		while(data.isIgnored(sv[in])) {
			in ++;
		}
		if(criticalPts[sv[in]] == SADDLE) {
			// add a new vertex
			newVertex = true;
		} else {
			criticalPts[sv[in]] = MINIMUM;
		}
		newRoot = in;
	}
	
	HashSet<Integer> set = new HashSet<Integer>();
	
	void processVertex(int v) {
		MyIntList star = data.getStar(v);
		if(star.length == 0) {
			return;
		}
		set.clear();
		for(int x = 0;x < star.length; x++) {
			int tin = star.array[x];
			if(compare(v,tin) < 0) {
				// upperLink
				int comp = nodes.find(tin);
				set.add(comp);
			}
		}
		if(set.size() == 0) {
			// Maximum
			int comp = nodes.find(v);
			cpMap[comp] = v;
			criticalPts[v] = MAXIMUM;
		} else {
			if(set.size() > 1) {
				criticalPts[v] = SADDLE;
			}
			for(Iterator<Integer> it = set.iterator();it.hasNext();) {
				int comp = it.next();
				int to = cpMap[comp];
				int from = v;
				prev[to] = from;
				nodes.union(nodes.find(comp), nodes.find(v));
			}
			int comp = nodes.find(v);
			cpMap[comp] = v;
		}
	}
	
	
	private void computeJoinTree() {
		findJoinTree();
	}

	public void findJoinTree() {
		for(int i = 0;i < noVertices; i ++) {
			int v = sv[i];
			if(data.isIgnored(v)) {
				continue;
			}
			criticalPts[v] = REGULAR;
			processVertexJ(v);
		}
		int in = sv.length - 1;
		while(data.isIgnored(sv[in])) {
			in --;
		}
		if(criticalPts[sv[in]] == SADDLE) {
			// add a new vertex
			newVertex = true;
		} else {
			criticalPts[sv[in]] = MAXIMUM;
		}
		newRoot = in;
	}
	
	
	void processVertexJ(int v) {
		MyIntList star = data.getStar(v);
		if(star.length == 0) {
			return;
		}
		set.clear();
		for(int x = 0;x < star.length; x++) {
			int tin = star.array[x];
			if(compare(v,tin) > 0) {
				// lowerLink
				int comp = nodes.find(tin);
				set.add(comp);
			}
		}
		if(set.size() == 0) {
			// Minimum
			int comp = nodes.find(v);
			cpMap[comp] = v;
			criticalPts[v] = MINIMUM;
		} else {
			if(set.size() > 1) {
				criticalPts[v] = SADDLE;
			}
			for(Iterator<Integer> it = set.iterator();it.hasNext();) {
				int comp = it.next();
				int from = cpMap[comp];
				int to = v;
				next[from] = to;
				nodes.union(nodes.find(comp), nodes.find(v));
			}
			int comp = nodes.find(v);
			cpMap[comp] = v;
		}
	}
	
	
	public class MyArrays {

		private static final int INSERTIONSORT_THRESHOLD = 7;

		public void sort(int [] a) {
			int [] aux = clone(a);
			mergeSort(aux, a, 0, a.length, 0);
		}
		
		private int [] clone(int [] a) {
			int[] aux = new int[a.length];
			for(int i = 0;i < a.length;i ++) {
				aux[i] = a[i];
			}
			return aux;
		}
		private void mergeSort(int[] src, int[] dest, int low, int high, int off) {
			int length = high - low;

			// Insertion sort on smallest arrays
			if (length < INSERTIONSORT_THRESHOLD) {
				for (int i = low; i < high; i++)
					for (int j = i; j > low && compare(dest[j - 1], dest[j]) > 0; j--)
						swap(dest, j, j - 1);
				return;
			}

			// Recursively sort halves of dest into src
			int destLow = low;
			int destHigh = high;
			low += off;
			high += off;
			int mid = (low + high) >>> 1;
			mergeSort(dest, src, low, mid, -off);
			mergeSort(dest, src, mid, high, -off);

			// If list is already sorted, just copy from src to dest. This is an
			// optimization that results in faster sorts for nearly ordered lists.
			if (compare(src[mid - 1], src[mid]) <= 0) {
				System.arraycopy(src, low, dest, destLow, length);
				return;
			}

			// Merge sorted halves (now in src) into dest
			for (int i = destLow, p = low, q = mid; i < destHigh; i++) {
				if (q >= high || p < mid && compare(src[p], src[q]) <= 0)
					dest[i] = src[p++];
				else
					dest[i] = src[q++];
			}
		}

		private void swap(int[] x, int a, int b) {
			int t = x[a];
			x[a] = x[b];
			x[b] = t;
		}
	}

	public int compare(int o1, int o2) {
		if(fnVertices[o1] < fnVertices[o2] || (fnVertices[o1] == fnVertices[o2] && o1 < o2)) {
			return -1;
		}
		return 1;
	}
}
