package hope.it.works.ct;

public interface GraphInput {

	int getMaxDegree();
	int getVertexCount();
	MyIntList getStar(int v);
	float[] getFnVertices();
	boolean isIgnored(int v);
}
