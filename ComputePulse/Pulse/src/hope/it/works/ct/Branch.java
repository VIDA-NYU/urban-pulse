package hope.it.works.ct;

public class Branch {
	public int from;
	public int to;
	
	public MyIntList arcs = new MyIntList(2);
	
	public int parent;
	public MyIntList children = new MyIntList(2);
	
	@Override
	public String toString() {
		return from + " " + to;
	}
}
