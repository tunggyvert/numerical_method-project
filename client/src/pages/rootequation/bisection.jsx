import { useState } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";


function Bisection() {
  const [equation, setEquation] = useState("x^4-13");
  const [xlIn, setXl] = useState(1.5);
  const [xrIn, setXr] = useState(2.0);
  const [tolIn, setTol] = useState(0.0001);
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems, setProblems] = useState([]);

  const checkErr = (oldVal, newVal) =>
    Math.abs((newVal - oldVal) / newVal) * 100;

  const CalBisec = () => {
    let iter = 0;
    let xm, error;
    let xl = parseFloat(xlIn);
    let xr = parseFloat(xrIn);
    let tol = parseFloat(tolIn);
    const maxIter = 50;
    const results = [];
    const pts = [];

    do {
      xm = (xl + xr) / 2;
      const fxr = evaluate(equation, { x: xr });
      const fxm = evaluate(equation, { x: xm });
      iter++;

      if (fxm * fxr > 0) {
        error = checkErr(xr, xm);
        results.push({ iteration: iter, xl: xl, xr: xr, xm, fxm, error });
        xr = xm;
      } else {
        error = checkErr(xl, xm);
        results.push({ iteration: iter, xl: xl, xr: xr, xm, fxm, error });
        xl = xm;
      }

      pts.push({ x: xm, y: fxm });
    } while (error > tol && iter < maxIter);

    setData(results);
    setPoints(pts);//ต้องเก็บ error ไว้ไปคำนวณตอน plotgraph
  };
  const API_URL = import.meta.env.VITE_API_URL;
  const saveProblem = async () => {
    const problem = {
      category: "root",
      method: "bisection",
      input: {
        equation,
        xl: parseFloat(xlIn),
        xr: parseFloat(xrIn),
        tolerance: parseFloat(tolIn),
      },
    };

    const res = await fetch("http://localhost:3001/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problem),
    });

    const data = await res.json();
    alert("โจทย์ถูกบันทึกแล้ว! ID = " + data.id);
  };

  const loadProblems = async () => {
    const res = await fetch("http://localhost:3001/problems?category=root&method=bisection");
    const problems = await res.json();
    setProblems(problems);
  };

  const loadProblemToForm = (problem) => {
    const { equation, xl, xr, tolerance } = problem.input;
    setEquation(equation);
    setXl(xl);
    setXr(xr);
    setTol(tolerance);
  };

  return (
    <div className="bg-yellow-100 min-h-screen min-w-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Bisection Method</h1>

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
          <label className="text-black">XL: </label>
          <input
            type="number"
            value={xlIn}
            onChange={(e) => setXl(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label className="text-black">XR: </label>
          <input
            type="number"
            value={xrIn}
            onChange={(e) => setXr(e.target.value)}
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
            onClick={CalBisec}
            className="bg-blue-500 text-yellow-300 px-4 py-2 rounded hover:bg-blue-600"
          >
            Calculate
          </button>

          <button
            onClick={saveProblem}
            className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
          >
            Save Problem
          </button>

          <button
            onClick={loadProblems}
            className="bg-purple-500 text-black px-4 py-2 rounded hover:bg-purple-600"
          >
            Load Problems
          </button>
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
                  {p.input.equation} (XL={p.input.xl}, XR={p.input.xr}, Tol={p.input.tolerance})
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
                <th className="border px-2 py-1">XL</th>
                <th className="border px-2 py-1">XR</th>
                <th className="border px-2 py-1">XM</th>
                <th className="border px-2 py-1">f(XM)</th>
                <th className="border px-2 py-1">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.iteration}</td>
                  <td className="border px-2 py-1">{row.xl.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.xr.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.xm.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.fxm.toFixed(6)}</td>
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

export default Bisection;
