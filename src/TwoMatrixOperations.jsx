/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { create, all } from "mathjs";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const math = create(all);

function TwoMatrixOperations() {
  const [matrixA, setMatrixA] = useState([[1, 2], [3, 4]]);
  const [matrixB, setMatrixB] = useState([[5, 6], [7, 8]]);
  const [result, setResult] = useState(null);

  const handleMatrixChange = (matrixSetter, row, col, value) => {
    matrixSetter(prev => {
      const updated = [...prev];
      updated[row][col] = parseFloat(value);
      return updated;
    });
  };

  const performOperation = (op) => {
    try {
      const A = math.matrix(matrixA);
      const B = math.matrix(matrixB);
      let res;
      if (op === 'add') res = math.add(A, B);
      else if (op === 'multiply') res = math.multiply(A, B);
      else if (op === 'det') res = math.det(A);
      setResult(res.toString());
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
  };
  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4">Linear Algebra Calculator</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[['Matrix A', matrixA, setMatrixA], ['Matrix B', matrixB, setMatrixB]].map(([label, matrix, setter], idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <div className="grid grid-cols-2 gap-2">
              {matrix.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    type="number"
                    className="border p-1 w-full"
                    value={val}
                    onChange={e => handleMatrixChange(setter, rIdx, cIdx, e.target.value)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-x-4 mb-4">
        <button onClick={() => performOperation('add')} className="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
        <button onClick={() => performOperation('multiply')} className="px-4 py-2 bg-green-500 text-white rounded">Multiply</button>
        <button onClick={() => performOperation('det')} className="px-4 py-2 bg-purple-500 text-white rounded">Determinant A</button>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-bold">Result:</h2>
        <pre className="bg-white p-4 rounded shadow">{result}</pre>
      </div>
      <div className="h-64">
        <Canvas>
          <OrbitControls />
          <axesHelper args={[5]} />
          <mesh position={[1, 2, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <mesh position={[3, 1, 2]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="blue" />
          </mesh>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      </div>
    </div>
  );
}

export default TwoMatrixOperations;
