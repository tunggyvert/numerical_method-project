import { useState } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function onepoint() {

  const [equation, setEquation] = useState("(x+7/x)/2");
  const [x0, setX0] = useState("1");
  const [tolIn, setTol] = useState("0.000001");
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems, setProblems] = useState([]);

  const CheckErr = (oldVal, newVal) =>
    Math.abs((newVal - oldVal) / newVal) * 100;

  const CalOnePoint = () => {
    let xOld = parseFloat(x0);
    const tol = parseFloat(tolIn);
    let xNew = 0;
    let error = 100;
    let iter = 0;
    const maxIter = 50;
    const results = [];
    const pts = [];

    while (error > tol) {
      xNew = evaluate(equation, { x: xOld });
      error = CheckErr(xOld, xNew);
      iter++;

      results.push({ iteration: iter, xOld, xNew, error })

      pts.push({ x: xOld, y: xNew });

      xOld = xNew;

      if (iter > maxIter) break;
    }

    setData(results);
    setPoints(pts);
  };
  const saveProblem = async () => {
    const problem = {
      category: "root",
      method: "onepoint",
      input: {
        equation,
        x0: parseFloat(x0),
        tolerance: parseFloat(tolIn),
      }
    }

    const res = await fetch("http://localhost:3001/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problem),
    });

    const data = await res.json();
    alert("saved!");
  }
  const loadProblems = async () => {
    const res = await fetch("http://localhost:3001/problems?category=root&method=onepoint");
    const problems = await res.json();
    setProblems(problems);
  }

  const loadProblemToForm = (problem) => {
    const { equation, x0, tolerance } = problem.input;
    setEquation(equation);
    setX0(x0);
    setTol(tolerance);
  }
  return (
    <div className="bg-yellow-100 min-h-screen min-w-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">One-point iteration method</h1>

      {/* Input form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-lg">
        <div className="mb-2">
          <label className="text-black">Function f(x): </label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label className="text-black">X0: </label>
          <input
            type="number"
            value={x0}
            onChange={(e) => setX0(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-4">
          <label className="text-black">Error tolerance: </label>
          <input
            type="number"
            step="0.0001"
            value={tolIn}
            onChange={(e) => setTol(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={CalOnePoint}
            className="bg-blue-500 text-yellow-300 px-4 py-2 rounded hover:bg-blue-600"
          >
            Calculate
          </button>

          <button
            onClick={saveProblem}
            className="bg-blue-500 text-yellow-300 px-4 py-2 rounded hover:bg-amber-300">
            Save Problems
          </button>

          <div className="flex gap-4">
            <button
              onClick={loadProblems}
              className=" bg-blue-500 text-yellow-300 px-4 py-2 rounded hover:bg-amber-300">
              Load Problems
            </button>
          </div>
        </div>
      </div>

      {/* list */}
      {problems.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-2">Saved Problems</h2>
          <ul className="list-disc ml-5">
            {problems.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => loadProblemToForm(p)}
                  className="text-blue-600 hover:underline"
                >
                  {p.input.equation} (X0={p.input.x0}, Tol={p.input.tolerance})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table  */}
      {data.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Iterations</h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Iteration</th>
                <th className="border px-2 py-1">Xold</th>
                <th className="border px-2 py-1">Xnew</th>
                <th className="border px-2 py-1">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.iteration}</td>
                  <td className="border px-2 py-1">{row.xOld.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.xNew.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.error.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Graph (Plotly) */}
      {points.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Graph</h2>
          <Plot
            data={[
              {
                x: points.map((p) => p.x),
                y: points.map((p) => p.y),
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "red" },
                line: { color: "green" },
                name: "f(xm)",
              },
              {
                x: [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))],
                y: [0, 0],
                type: "scatter",
                mode: "lines",
                line: { color: "black" },
                name: "x-axis",
              },
            ]}
            layout={{
              width: 600,
              height: 400,
              xaxis: { title: "x" },
              yaxis: { title: "f(x)" },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default onepoint;