/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function VectorOperations() {
  const [vectorA, setVectorA] = useState([1, 2, 0]);
  const [vectorB, setVectorB] = useState([3, 1, 0]);
  const [dim, setDim] = useState(2);
  const [result, setResult] = useState("");

  const handleVectorChange = (setter, index, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setter((prev) => {
      const copy = [...prev];
      copy[index] = num;
      return copy;
    });
  };

  const to3D = (v) => {
    if (dim === 2) return [v[0], v[1], 0];
    return v;
  };

  const dotProduct = (a, b) => {
    let sum = 0;
    for (let i = 0; i < dim; i++) sum += a[i] * b[i];
    return sum;
  };

  const crossProduct = (a, b) => {
    if (dim !== 3) return null;
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  };

  const norm = (v) => Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));

  const normalize = (v) => {
    const n = norm(v);
    return n === 0 ? v : v.map((x) => x / n);
  };

  const projection = (a, b) => {
    const bNormSq = b.reduce((sum, x) => sum + x * x, 0);
    if (bNormSq === 0) return b;
    const scale = dotProduct(a, b) / bNormSq;
    return b.map((x) => x * scale);
  };

  const handleOperation = (op) => {
    if (dim === 2) {
      if (vectorA.length !== 2 || vectorB.length !== 2) {
        setResult("Vectors must have 2 elements.");
        return;
      }
    } else {
      if (vectorA.length !== 3 || vectorB.length !== 3) {
        setResult("Vectors must have 3 elements.");
        return;
      }
    }

    if (op === "dot") {
      setResult(`Dot Product: ${dotProduct(vectorA, vectorB).toFixed(4)}`);
    } else if (op === "cross") {
      if (dim !== 3) {
        setResult("Cross product only valid for 3D vectors.");
        return;
      }
      const c = crossProduct(vectorA, vectorB);
      setResult(`Cross Product: [${c.map((x) => x.toFixed(4)).join(", ")}]`);
    } else if (op === "proj") {
      const p = projection(vectorA, vectorB);
      setResult(`Projection of A onto B: [${p.map((x) => x.toFixed(4)).join(", ")}]`);
    } else if (op === "normA") {
      setResult(`|A| (norm): ${norm(vectorA).toFixed(4)}`);
    } else if (op === "normB") {
      setResult(`|B| (norm): ${norm(vectorB).toFixed(4)}`);
    } else if (op === "normalizeA") {
      const n = normalize(vectorA);
      setResult(`Normalized A: [${n.map((x) => x.toFixed(4)).join(", ")}]`);
    } else if (op === "normalizeB") {
      const n = normalize(vectorB);
      setResult(`Normalized B: [${n.map((x) => x.toFixed(4)).join(", ")}]`);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4">Vector Operations (Dim: {dim}D)</h2>

      <div className="mb-4">
        <label>
          Dimension:
          <select
            className="ml-2 border rounded p-1"
            value={dim}
            onChange={(e) => {
              const newDim = parseInt(e.target.value);
              setDim(newDim);
              setVectorA(Array(newDim).fill(0));
              setVectorB(Array(newDim).fill(0));
              setResult("");
            }}
          >
            <option value={2}>2D</option>
            <option value={3}>3D</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {["A", "B"].map((label, idx) => {
          const vec = idx === 0 ? vectorA : vectorB;
          const setter = idx === 0 ? setVectorA : setVectorB;
          return (
            <div key={label}>
              <h3 className="text-lg font-semibold mb-2">Vector {label}</h3>
              <div className="flex space-x-2">
                {Array(dim)
                  .fill(0)
                  .map((_, i) => (
                    <input
                      key={i}
                      type="number"
                      value={vec[i]}
                      onChange={(e) => handleVectorChange(setter, i, e.target.value)}
                      className="border rounded p-1 w-16 text-center"
                      placeholder={`v${i + 1}`}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-x-2 mb-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleOperation("dot")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Dot Product
        </button>
        <button
          onClick={() => handleOperation("cross")}
          disabled={dim !== 3}
          className={`px-3 py-1 rounded text-white ${dim === 3 ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Cross Product
        </button>
        <button
          onClick={() => handleOperation("proj")}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Projection (A on B)
        </button>
        <button
          onClick={() => handleOperation("normA")}
          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Norm A
        </button>
        <button
          onClick={() => handleOperation("normB")}
          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Norm B
        </button>
        <button
          onClick={() => handleOperation("normalizeA")}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Normalize A
        </button>
        <button
          onClick={() => handleOperation("normalizeB")}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Normalize B
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded font-mono whitespace-pre-wrap min-h-[80px]">
        {result || "Result will appear here"}
      </div>

      <h3 className="text-xl font-bold mb-3">Vector Visualization</h3>
      <div className="h-64 border rounded overflow-hidden">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />

          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 3, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="red" />
          </line>

          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 3, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="green" />
          </line>

          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 0, 3])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="blue" />
          </line>

          {/* Vector A */}
          <mesh position={to3D(vectorA)}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, ...to3D(vectorA)])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="orange" linewidth={2} />
          </line>

          <mesh position={to3D(vectorB)}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="purple" />
          </mesh>
          <line>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, ...to3D(vectorB)])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="purple" linewidth={2} />
          </line>
        </Canvas>
      </div>
    </div>
  );
}

export default VectorOperations;
