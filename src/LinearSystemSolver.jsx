import { useState } from "react";
import { create, all } from "mathjs";

const math = create(all);

function LinearSystemSolver() {
  const [size, setSize] = useState(2);
  const [coefficients, setCoefficients] = useState(
    Array(size).fill(0).map(() => Array(size).fill(0))
  );
  const [constants, setConstants] = useState(Array(size).fill(0));
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);

  const changeSize = (newSize) => {
    setSize(newSize);
    setCoefficients(Array(newSize).fill(0).map(() => Array(newSize).fill(0)));
    setConstants(Array(newSize).fill(0));
    setResult(null);
    setSteps([]);
  };

  const handleCoeffChange = (row, col, val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    setCoefficients(prev => {
      const copy = prev.map(r => [...r]);
      copy[row][col] = v;
      return copy;
    });
  };

  const handleConstChange = (row, val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    setConstants(prev => {
      const copy = [...prev];
      copy[row] = v;
      return copy;
    });
  };

  const gaussianElimination = (A, b) => {
    const n = A.length;
    const M = A.map(row => [...row]);
    const B = [...b];
    const stepList = [];

    for (let k = 0; k < n; k++) {
      let max = Math.abs(M[k][k]);
      let maxRow = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(M[i][k]) > max) {
          max = Math.abs(M[i][k]);
          maxRow = i;
        }
      }

      if (maxRow !== k) {
        [M[k], M[maxRow]] = [M[maxRow], M[k]];
        [B[k], B[maxRow]] = [B[maxRow], B[k]];
        stepList.push(`Swap row ${k + 1} with row ${maxRow + 1}`);
      }

      if (M[k][k] === 0) {
        stepList.push("No unique solution (zero pivot)");
        return { solution: null, steps: stepList };
      }

      for (let i = k + 1; i < n; i++) {
        const factor = M[i][k] / M[k][k];
        stepList.push(`Eliminate row ${i + 1} using row ${k + 1}, factor: ${factor.toFixed(3)}`);
        for (let j = k; j < n; j++) {
          M[i][j] -= factor * M[k][j];
        }
        B[i] -= factor * B[k];
      }
    }

    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += M[i][j] * x[j];
      }
      x[i] = (B[i] - sum) / M[i][i];
      stepList.push(`Solve x${i + 1} = ${(x[i]).toFixed(3)}`);
    }

    return { solution: x, steps: stepList };
  };

  const solveByInverse = (A, b) => {
    try {
      const M = math.matrix(A);
      const inv = math.inv(M);
      const res = math.multiply(inv, b);
      return res._data;
    } catch {
      return null;
    }
  };

  const solveSystem = (method) => {
    setResult(null);
    setSteps([]);
    const A = coefficients;
    const b = constants;

    if (method === "gaussian") {
      const { solution, steps } = gaussianElimination(A, b);
      if (!solution) {
        setResult("No unique solution found.");
        setSteps(steps);
      } else {
        setResult(solution.map((v, i) => `x${i + 1} = ${v.toFixed(4)}`).join("\n"));
        setSteps(steps);
      }
    } else if (method === "inverse") {
      const sol = solveByInverse(A, b);
      if (!sol) {
        setResult("Matrix not invertible or no unique solution.");
        setSteps([]);
      } else {
        setResult(sol.map((v, i) => `x${i + 1} = ${v.toFixed(4)}`).join("\n"));
        setSteps(["Solved by matrix inversion."]);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4">Linear System Solver</h2>

      <div className="mb-4">
        <label>
          Number of variables:
          <select
            value={size}
            onChange={e => changeSize(parseInt(e.target.value))}
            className="ml-2 border rounded p-1"
          >
            {[2, 3].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <table className="border-collapse border border-gray-300 mb-4">
          <thead>
            <tr>
              {Array(size).fill(0).map((_, i) => (
                <th key={i} className="border border-gray-300 p-1">x{i + 1}</th>
              ))}
              <th className="border border-gray-300 p-1">=</th>
              <th className="border border-gray-300 p-1">b</th>
            </tr>
          </thead>
          <tbody>
            {coefficients.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="border border-gray-300 p-1">
                    <input
                      type="number"
                      value={val}
                      onChange={e => handleCoeffChange(rIdx, cIdx, e.target.value)}
                      className="w-16 p-1 text-center"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-1 text-center">=</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="number"
                    value={constants[rIdx]}
                    onChange={e => handleConstChange(rIdx, e.target.value)}
                    className="w-16 p-1 text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-x-2 mb-4">
        <button
          onClick={() => solveSystem("gaussian")}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Solve by Gaussian Elimination
        </button>
        <button
          onClick={() => solveSystem("inverse")}
          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Solve by Matrix Inverse
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded min-h-[100px] whitespace-pre-wrap font-mono">
        {result || "Solution will appear here"}
      </div>

      {steps.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
          <b>Steps:</b>
          <ol className="list-decimal pl-6">
            {steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export default LinearSystemSolver;
