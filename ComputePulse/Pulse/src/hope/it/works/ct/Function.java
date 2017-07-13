package hope.it.works.ct;

public interface Function {
	
	public void init(float [] fn, Branch [] br);
	public void update(Branch [] br, int brNo);
	public void branchRemoved(Branch [] br, int brNo, boolean[] invalid);
}
