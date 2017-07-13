package hope.it.works.pulse;

import hope.it.works.ct.MyIntList;

public class Pulse {
	
	public Pulse(int length) {
		vals = new double[length];
		scalars = new double[length];
		maxTime = new int[length];
		sigMaxTime = new int[length];
	}
	
	public float x,y;
	public double [] vals;
	public double [] scalars;
	public int[] maxTime;
	public int[] sigMaxTime;
	public int maxct, sigct;
	public MyIntList vertices;
}