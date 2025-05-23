import { useState } from "react";
import { create, all } from "mathjs";

const math = create(all);

// Fungsi rank manual
function matrixRank(matrix) {
  const m = matrix.map(row => [...row]);
  const rows = m.length;
  const cols = m[0].length;
  let rank = 0;

  for (let r = 0, c = 0; r < rows && c < cols; c++) {
    let pivotRow = r;
    while (pivotRow < rows && m[pivotRow][c] === 0) pivotRow++;
    if (pivotRow === rows) continue;

    [m[r], m[pivotRow]] = [m[pivotRow], m[r]];
    const pivot = m[r][c];
    for (let j = 0; j < cols; j++) m[r][j] /= pivot;

    for (let i = 0; i < rows; i++) {
      if (i !== r) {
        const factor = m[i][c];
        for (let j = 0; j < cols; j++) {
          m[i][j] -= factor * m[r][j];
        }
      }
    }

    rank++;
    r++;
  }

  return rank;
}

function MatrixOperations() {
  const [size, setSize] = useState(2);
  const [matrix, setMatrix] = useState(Array(2).fill(0).map(() => Array(2).fill(0)));
  const [scalar, setScalar] = useState(1);
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);

  const changeSize = (newSize) => {
    setSize(newSize);
    setMatrix(Array(newSize).fill(0).map(() => Array(newSize).fill(0)));
    setResult(null);
    setSteps([]);
  };

  const handleMatrixChange = (row, col, val) => {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    setMatrix(prev => {
      const copy = prev.map(r => [...r]);
      copy[row][col] = v;
      return copy;
    });
  };

  const detSteps = (m) => {
    if (size === 2) {
      const [a, b] = m[0];
      const [c, d] = m[1];
      return [
        "det(A) = ad - bc",
        `= ${a}*${d} - ${b}*${c}`,
        `= ${a * d} - ${b * c}`,
        `= ${a * d - b * c}`,
      ];
    }
    if (size === 3) {
      const [a, b, c] = m[0];
      const [d, e, f] = m[1];
      const [g, h, i] = m[2];
      return [
        "det(A) = a(ei − fh) − b(di − fg) + c(dh − eg)",
        `= ${a}(${e}*${i} - ${f}*${h}) - ${b}(${d}*${i} - ${f}*${g}) + ${c}(${d}*${h} - ${e}*${g})`,
        `= ${a}(${e * i - f * h}) - ${b}(${d * i - f * g}) + ${c}(${d * h - e * g})`,
        `= ${a * (e * i - f * h)} - ${b * (d * i - f * g)} + ${c * (d * h - e * g)}`,
        `= ${a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)}`,
      ];
    }
    return ["Step-by-step for determinant only implemented for 2x2 and 3x3"];
  };

  const performOperation = (op) => {
    try {
      const M = math.matrix(matrix);
      let res;
      let stepList = [];

      switch (op) {
        case "add":
          res = math.add(M, math.multiply(math.ones(size, size), scalar));
          stepList.push(`Adding scalar ${scalar} to each element.`);
          break;
        case "multiply":
          res = math.multiply(M, scalar);
          stepList.push(`Multiply matrix by scalar ${scalar}.`);
          break;
        case "det":
          {
            const det = math.det(M);
            stepList = detSteps(matrix);
            setResult(det.toString());
            setSteps(stepList);
            return;
          }
        case "inv":
          res = math.inv(M);
          stepList.push("Calculate inverse using mathjs.");
          break;
        case "transpose":
          res = math.transpose(M);
          stepList.push("Transpose the matrix.");
          break;
        case "rank":
          res = matrixRank(matrix);
          stepList.push("Calculate rank using custom Gauss-Jordan elimination.");
          setResult(res.toString());
          setSteps(stepList);
          return;
        case "eigen":
          {
            if (size !== 2 && size !== 3) {
              setResult("Eigenvalues/vectors only supported for 2x2 or 3x3 matrices.");
              setSteps([]);
              return;
            }

            const E = math.eigs(M);
            stepList.push("Calculate eigenvalues and eigenvectors using mathjs.");

            const rawValues = Array.isArray(E.values) ? E.values : E.values?.toArray?.() || [];
            const eigenvalues = rawValues.map(v => {
              if (typeof v === "number") return v.toFixed(4);
              if (math.isComplex(v)) {
                const real = v.re.toFixed(4);
                const imag = Math.abs(v.im).toFixed(4);
                return `${real}${v.im >= 0 ? '+' : '-'}${imag}i`;
              }
              return v.toString();
            });

            const eigenvectorMatrix = E.eigenvectors;
            const transposed = math.transpose(eigenvectorMatrix);

            const eigenvectors = (Array.isArray(transposed) ? transposed : []).map(col => {
              const values = math.isMatrix(col) ? col.toArray() : Array.isArray(col) ? col : [col];
              return values.map(v => math.format(v, { precision: 4 }));
            });

            setResult(
              `Eigenvalues:\n${eigenvalues.join(", ")}\n\nEigenvectors (column vectors):\n` +
              eigenvectors.map(vec => vec.join(", ")).join("\n")
            );
            setSteps(stepList);
            return;
          }
        default:
          setResult("Operation not supported");
          setSteps([]);
          return;
      }

      if (res._data) {
        setResult(res._data.map(row => row.join("\t")).join("\n"));
      } else {
        setResult(res.toString());
      }
      setSteps(stepList);
    } catch (e) {
      setResult("Error: " + e.message);
      setSteps([]);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4">Matrix Operations</h2>

      <div className="mb-4">
        <label>
          Matrix size:
          <select
            value={size}
            onChange={e => changeSize(parseInt(e.target.value))}
            className="ml-2 border rounded p-1"
          >
            {[2, 3].map(n => (
              <option key={n} value={n}>{n} x {n}</option>
            ))}
          </select>
        </label>
      </div>

      <table className="mb-4 border-collapse border border-gray-300">
        <tbody>
          {matrix.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((val, cIdx) => (
                <td key={cIdx} className="border border-gray-300 p-1">
                  <input
                    type="number"
                    value={val}
                    onChange={e => handleMatrixChange(rIdx, cIdx, e.target.value)}
                    className="w-16 p-1 text-center"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-4">
        <label>
          Scalar (for add/multiply scalar):
          <input
            type="number"
            value={scalar}
            onChange={e => setScalar(parseFloat(e.target.value))}
            className="ml-2 border rounded p-1 w-20"
          />
        </label>
      </div>

      <div className="space-x-2 mb-4">
        {["add", "multiply", "det", "inv", "transpose", "rank", "eigen"].map(op => (
          <button
            key={op}
            onClick={() => performOperation(op)}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {op.charAt(0).toUpperCase() + op.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-100 p-4 rounded min-h-[100px] whitespace-pre-wrap font-mono">
        {result || "Result will appear here"}
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

export default MatrixOperations;
