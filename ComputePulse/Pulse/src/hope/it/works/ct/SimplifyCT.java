package hope.it.works.ct;

import hope.it.works.utils.Utilities;

import java.util.NoSuchElementException;

public class SimplifyCT {
	public class Node {
		public MyIntList prev = new MyIntList(2);
		public MyIntList next = new MyIntList(2);
	}
	
	public ReebGraphData data;
	
	public void setInput(String rgFile) {
		data = new ReebGraphData(rgFile);
		order = new MyIntList(data.noArcs/2 + 5);
	}
	public void setInput(ReebGraphData rgdata) {
		data = rgdata;
		order = new MyIntList(data.noArcs/2 + 5);
	}
	
	public Branch [] branches;
	public Node [] nodes;
	
	public float [] fn;
	public float [] vol;
	public float [] fnv;
	public boolean [] invalid;
	public boolean [] removed;
	public boolean [] inq;
	Function simFn;
	PriorityQueue queue;
	
	public MyIntList order;
	
	public void simplify(Function simFn) {
		initSimplification(simFn);
		while(queue.size() > 0) {
			int ano = queue.remove();
			inq[ano] = false;
			if(!removed[ano]) {
				if(invalid[ano]) {
					simFn.update(branches, ano);
					invalid[ano] = false;
					addToQueue(ano);
				} else {
					if(isCandidate(branches[ano])) {
						removeArc(ano);
						order.add(ano);
					}
				}
			}
		}
		int root = 0;
		for(int i = 0;i < removed.length;i ++) {
			if(!removed[i]) {
				if(root > 0) {
					Utilities.er("More than one root!!!!!");
				}
				order.add(i);
				root ++;
			}
		}
	}
	
	public void simplify(Function simFn, int noBranches, int featuresToRemain) {
		initSimplification(simFn);
		int ct = noBranches;
		while(queue.size() > 0 && ct > featuresToRemain) {
			int ano = queue.remove();
			inq[ano] = false;
			if(!removed[ano]) {
				if(invalid[ano]) {
					simFn.update(branches, ano);
					invalid[ano] = false;
					addToQueue(ano);
				} else {
					if(isCandidate(branches[ano])) {
						removeArc(ano);
						order.add(ano);
						ct --;
					}
				}
			}
		}
	}
	
	private void initSimplification(Function f) {
		if(vol == null) {
			vol = new float[data.arcs.length];
		}
		branches = new Branch[data.arcs.length];
		nodes = new Node[data.noNodes];
		for(int i = 0;i < nodes.length;i ++) {
			nodes[i] = new Node();
		}
		for(int i = 0;i < branches.length;i ++) {
			branches[i] = new Branch();
			branches[i].from = data.arcs[i].from;
			branches[i].to = data.arcs[i].to;
			branches[i].parent = -1;
			branches[i].arcs.add(i);
			
			nodes[branches[i].from].next.add(i);
			nodes[branches[i].to].prev.add(i);
		}
		
		fn = new float[branches.length];
		removed = new boolean[branches.length];
		invalid = new boolean[branches.length];
		inq = new boolean[branches.length];
		
		vArray = new MyIntList[nodes.length];
		
		simFn = f;
		simFn.init(fn, branches);
		queue = new PriorityQueue(fn.length);
		
		for(int i = 0;i < branches.length;i ++) {
			addToQueue(i);
		}
	}

	private void addToQueue(int ano) {
		if(isCandidate(branches[ano])) {
			queue.add(ano);
			inq[ano] = true;
		}
	}

	private boolean isCandidate(Branch br) {
		int from = br.from;
		int to = br.to;
		if(nodes[from].prev.size() == 0) {
			// minimum
			if(nodes[to].prev.size() > 1) {
				return true;
			} else {
				return false;
			}
		}
		if(nodes[to].next.size() == 0) {
			// maximum
			if(nodes[from].next.size() > 1) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	MyIntList [] vArray;
	private void removeArc(int ano) {
		Branch br = branches[ano];
		int from = br.from;
		int to = br.to;
		int mergedVertex = -1;
		if(nodes[from].prev.length == 0) {
			// minimum
			mergedVertex = to;
		}
		if(nodes[to].next.length == 0) {
			// maximum
			mergedVertex = from;
		}
		nodes[from].next.remove(ano);
		nodes[to].prev.remove(ano);
		removed[ano] = true;
		
		if(vArray[mergedVertex] == null) {
			vArray[mergedVertex] = new MyIntList();
		}
		vArray[mergedVertex].add(ano);
		if(nodes[mergedVertex].prev.length == 1 && nodes[mergedVertex].next.length == 1) {
			mergeVertex(mergedVertex);
		}
		simFn.branchRemoved(branches, ano, invalid);
	}
	
	private void mergeVertex(int v) {
		int prev = nodes[v].prev.get(0);
		int next = nodes[v].next.get(0);
		int a = -1;
		int rem = -1;
		if(inq[prev]) {
			invalid[prev] = true;
			removed[next] = true;
			branches[prev].to = branches[next].to;
			a = prev;
			rem = next;
			
			for(int i = 0;i < nodes[branches[prev].to].prev.length;i ++) {
				if(nodes[branches[prev].to].prev.array[i] == next) {
					nodes[branches[prev].to].prev.array[i] = prev;
				}
			}
		} else {
			invalid[next] = true;
			removed[prev] = true;
			branches[next].from = branches[prev].from;
			a = next;
			rem = prev;
			
			for(int i = 0;i < nodes[branches[next].from].next.length;i ++) {
				if(nodes[branches[next].from].next.array[i] == prev) {
					nodes[branches[next].from].next.array[i] = next;
				}
			}
			if(!inq[next]) {
				addToQueue(next);
			}
		}
		for(int i = 0;i < branches[rem].children.length;i ++) {
			int ch = branches[rem].children.get(i);
			branches[a].children.add(ch);
			if(branches[ch].parent != rem) {
				Utilities.er("parent is inconsistent");
			}
			branches[ch].parent = a;
		}
		branches[a].arcs.addAll(branches[rem].arcs);
		for(int i = 0;i < vArray[v].length;i ++) {
			int aa = vArray[v].get(i);
			branches[a].children.add(aa);
			branches[aa].parent = a;
		}
		branches[rem].parent = -2;
	}

	public int compare(int b1, int b2) {
		if(fn[b1] < fn[b2]) {
			return -1;
		}
		if(fn[b1] > fn[b2]) {
			return 1;
		}
		float p1 = data.nodes[branches[b1].to].fn - data.nodes[branches[b1].from].fn;
		float p2 = data.nodes[branches[b2].to].fn - data.nodes[branches[b2].from].fn;
		if(p1 < p2) {
			return -1;
		}
		if(p1 > p2) {
			return 1;
		}
		int diff1 = branches[b1].to - branches[b1].from;
		int diff2 = branches[b2].to - branches[b2].from;
		if(diff1 < diff2) {
			return -1;
		}
		if(diff1 > diff2) {
			return 1;
		}
		return branches[b2].from - branches[b1].from;
	}
		
	/**
	 * PriorityQueue class implemented via the binary heap.
	 */
	public class PriorityQueue {

		private int currentSize; // Number of elements in heap
		private int[] array; // The heap array

		/**
		 * Construct an empty PriorityQueue.
		 */
		public PriorityQueue(int size) {
			array = new int[size];
		}

		/**
		 * Adds an item to this PriorityQueue.
		 * 
		 * @param x
		 *            any object.
		 * @return true.
		 */
		public boolean add(int x) {
			if (currentSize + 1 == array.length) {
				Utilities.er("size not enough!!");
			}

			// Percolate up
			int hole = ++currentSize;
			array[0] = x;

			for (; compare(x, array[hole / 2]) < 0; hole /= 2)
				array[hole] = array[hole / 2];
			array[hole] = x;

			return true;
		}

		/**
		 * Returns the number of items in this PriorityQueue.
		 * 
		 * @return the number of items in this PriorityQueue.
		 */
		public int size() {
			return currentSize;
		}

		/**
		 * Make this PriorityQueue empty.
		 */
		public void clear() {
			currentSize = 0;
		}

		/**
		 * Returns the smallest item in the priority queue.
		 * 
		 * @return the smallest item.
		 * @throws NoSuchElementException
		 *             if empty.
		 */
		public int element() {
			if (isEmpty())
				throw new NoSuchElementException();
			return array[1];
		}

		private boolean isEmpty() {
			return (currentSize == 0);
		}

		/**
		 * Removes the smallest item in the priority queue.
		 * 
		 * @return the smallest item.
		 * @throws NoSuchElementException
		 *             if empty.
		 */
		public int remove() {
			int minItem = element();
			array[1] = array[currentSize--];
			percolateDown(1);

			return minItem;
		}

		/**
		 * Establish heap order property from an arbitrary arrangement of items.
		 * Runs in linear time.
		 */
		void buildHeap() {
			for (int i = currentSize / 2; i > 0; i--)
				percolateDown(i);
		}

		/**
		 * Internal method to percolate down in the heap.
		 * 
		 * @param hole
		 *            the index at which the percolate begins.
		 */
		private void percolateDown(int hole) {
			int child;
			int tmp = array[hole];

			for (; hole * 2 <= currentSize; hole = child) {
				child = hole * 2;
				if (child != currentSize && compare(array[child + 1], array[child]) < 0)
					child++;
				if (compare(array[child], tmp) < 0)
					array[hole] = array[child];
				else
					break;
			}
			array[hole] = tmp;
		}
	}

}
