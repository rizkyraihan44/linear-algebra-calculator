
import MatrixOperations from "./MatrixOperations";
import LinearSystemSolver from "./LinearSystemSolver";
import VectorOperations from "./VectorOperations";
import TwoMatrixOperations from "./TwoMatrixOperations";
function App() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-center">Linear Algebra Calculator</h1>
      <TwoMatrixOperations />
      <MatrixOperations />
      <LinearSystemSolver />
      <VectorOperations />
    </div>
  );
}

export default App;
