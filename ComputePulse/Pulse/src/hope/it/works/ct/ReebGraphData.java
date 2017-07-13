package hope.it.works.ct;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;

import static hope.it.works.utils.Utilities.splitString;

public class ReebGraphData {
	public static final byte REGULAR = 0;
	public static final byte MINIMUM = 1;
	public static final byte SADDLE = 2;
	public static final byte MAXIMUM = 3;
	
	public static final String MINIMUM_STRING = "MINIMA";
	public static final String SADDLE_STRING = "SADDLE";
	public static final String MAXIMUM_STRING = "MAXIMA";
	
	public class Node {
		public int v;
		public float fn;
		public byte type;
		
		public ArrayList<Integer> prev = new ArrayList<Integer>();
		public ArrayList<Integer> next = new ArrayList<Integer>();
	}
	
	public class Arc {
		public int from;
		public int to;
		public int id;
		
		@Override
		public String toString() {
			String s = from + " " + to;
			return s;
		}
	}
	
	public int noNodes;
	public int noArcs;
	
	public Node [] nodes;
	public Arc [] arcs;
	public HashMap<Integer, Integer> nodeMap = new HashMap<Integer, Integer>();
	
	public ReebGraphData() {
		
	}
	
	public ReebGraphData(String file) {
		readReebGraph(file);
	}
	
	public void readReebGraph(String file) {
		try {
			BufferedReader f = new BufferedReader(new FileReader(file));
			String s = f.readLine();
			String [] r = splitString(s);
			noNodes = Integer.parseInt(r[0].trim());
			noArcs = Integer.parseInt(r[1].trim());
			
			nodes = new Node[noNodes];
			arcs = new Arc[noArcs];
			
			
			for(int i = 0;i < noNodes;i ++) {
				s = f.readLine();
				r = splitString(s);
				nodes[i] = new Node();
				nodes[i].v = Integer.parseInt(r[0].trim());
				nodeMap.put(nodes[i].v, i);
				nodes[i].fn = Float.parseFloat(r[1].trim());
				nodes[i].type = getType(r[2].trim());
			}
			
			for(int i = 0;i < noArcs;i ++) {
				s = f.readLine();
				r = splitString(s);
				arcs[i] = new Arc();
				int v1 = Integer.parseInt(r[0].trim());
				int v2 = Integer.parseInt(r[1].trim());
				arcs[i].id = i;
				arcs[i].from = nodeMap.get(v1);
				arcs[i].to = nodeMap.get(v2);
				nodes[arcs[i].from].next.add(i);
				nodes[arcs[i].to].prev.add(i);
			}
			f.close();
		} catch(Exception e) {
			System.err.println("Error : Invalid file format");
			System.err.println(e.getMessage());
		}
	}

	byte getType(String type) {
		if(MINIMUM_STRING.equalsIgnoreCase(type)) {
			return MINIMUM;
		}
		if(MAXIMUM_STRING.equalsIgnoreCase(type)) {
			return MAXIMUM;
		}
		if(SADDLE_STRING.equalsIgnoreCase(type)) {
			return SADDLE;
		}
		return REGULAR;
	}
}
