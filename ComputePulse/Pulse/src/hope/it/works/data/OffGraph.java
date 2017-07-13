package hope.it.works.data;

import hope.it.works.ct.GraphInput;
import hope.it.works.ct.MyIntList;
import hope.it.works.utils.Utilities;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashSet;
import java.util.Iterator;

public class OffGraph implements GraphInput {
	
	public class Node {
		public HashSet<Integer> adjacencies = new HashSet<Integer>();
		public double x,y;
	}
	
	public float [] fnVertices;
	public int nv;
	public Node [] nodes;
	public boolean[] ignore;
	
	public void loadData(String offFile) {
		try {
			
			BufferedReader reader = new BufferedReader(new FileReader(offFile));
			String l = reader.readLine().trim();
			if(l.equalsIgnoreCase("OFF")) {
				l = reader.readLine().trim();
			}
			String [] s = Utilities.splitString(l);
			nv = Integer.parseInt(s[0].trim());
			
			nodes = new Node[nv];
			System.out.println("No. of vertices: " + nv);
			fnVertices = new float[nv];
			int nt = Integer.parseInt(s[1].trim());
			
			for(int i = 0;i < nv;i ++) {
				// Ignoring coordinates. not required
				s = Utilities.splitString(reader.readLine().trim());
				nodes[i] = new Node();
				nodes[i].x = Double.parseDouble(s[0]);
				nodes[i].y = Double.parseDouble(s[1]);
				fnVertices[i] = Float.parseFloat(s[3]);
			}
			for(int i = 0;i < nt;i ++) {
				s = Utilities.splitString(reader.readLine().trim());
				int in = 0;
				if(s[0].equalsIgnoreCase("3")){
					in = 1;
				}
				int v1 = Integer.parseInt(s[in + 0].trim());
				int v2 = Integer.parseInt(s[in + 1].trim());
				int v3 = Integer.parseInt(s[in + 2].trim());
				nodes[v1].adjacencies.add(v2);
				nodes[v1].adjacencies.add(v3);
				
				nodes[v2].adjacencies.add(v1);
				nodes[v2].adjacencies.add(v3);
				
				nodes[v3].adjacencies.add(v1);
				nodes[v3].adjacencies.add(v2);
			}
			reader.close();
			init();
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void loadData(int xres, int yres, float [] fnValues) {
		try {
			nv = xres * yres;
			
			nodes = new Node[nv];
			System.out.println("No. of vertices: " + nv);
			fnVertices = new float[nv];
			
			for(int i = 0;i < nv;i ++) {
				// Ignoring coordinates. not required
				nodes[i] = new Node();
				nodes[i].x = i % xres;
				nodes[i].y = i / xres;
				fnVertices[i] = fnValues[i];
			}
			for(int y = 0;y < yres - 1;y ++) {
				for(int x = 0;x < xres - 1;x ++) {
					int v = y * xres + x;
					int v1 = v;
					int v2 = v + 1;
					int v3 = v + 1 + xres;
					int v4 = v3 - 1;
					
					addTriangle(v1,v2,v3);
					addTriangle(v1,v3,v4);
				}
			}
			init();
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

	public void initMesh(int xres, int yres) {
		try {
			nv = xres * yres;
			
			nodes = new Node[nv];
			System.out.println("No. of vertices: " + nv);
			fnVertices = new float[nv];
			
			for(int i = 0;i < nv;i ++) {
				// Ignoring coordinates. not required
				nodes[i] = new Node();
				nodes[i].x = i % xres;
				nodes[i].y = i / xres;
			}
			for(int y = 0;y < yres - 1;y ++) {
				for(int x = 0;x < xres - 1;x ++) {
					int v = y * xres + x;
					int v1 = v;
					int v2 = v + 1;
					int v3 = v + 1 + xres;
					int v4 = v3 - 1;
					
					addTriangle(v1,v2,v3);
					addTriangle(v1,v3,v4);
				}
			}
			init();
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

	public boolean updateNewfunction(float [] fnValues) {
		if(fnValues.length != fnVertices.length) {
			return false;
		}
//		for(int i = 0;i < fnValues.length;i ++) {
//			fnVertices[i] = fnValues[i];
//		}
		fnVertices = fnValues;
		return true;
	}
	
	void addTriangle(int v1, int v2, int v3) {
		nodes[v1].adjacencies.add(v2);
		nodes[v1].adjacencies.add(v3);
		
		nodes[v2].adjacencies.add(v1);
		nodes[v2].adjacencies.add(v3);
		
		nodes[v3].adjacencies.add(v1);
		nodes[v3].adjacencies.add(v2);
	}
	
	int maxDegree;
	private void init() {
		maxDegree = -1;
		for(int i = 0;i < nodes.length;i ++) {
			maxDegree = Math.max(maxDegree, nodes[i].adjacencies.size());
		}
	}

	@Override
	public int getMaxDegree() {
		return maxDegree;
	}

	@Override
	public int getVertexCount() {
		return fnVertices.length;
	}

	MyIntList list = new MyIntList();
	@Override
	public MyIntList getStar(int v) {
		int time = v / nv;
		int vv = v % nv;
		MyIntList list = new MyIntList();
		
		for(Iterator<Integer> it = nodes[vv].adjacencies.iterator();it.hasNext();) {
			int av = it.next();
			int tv = nv * time + av;
			list.add(tv);
		}
		return list;
	}

	@Override
	public float[] getFnVertices() {
		return fnVertices;
	}

	@Override
	public boolean isIgnored(int v) {
		return false;
	}

}
