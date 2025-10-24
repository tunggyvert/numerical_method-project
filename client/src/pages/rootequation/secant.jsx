import { useState } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function Secant() {
  const [equation, setEquation] = useState("x^3-x-2");
  const [x0, setX0] = useState(1);
  const [x1, setX1] = useState(2);
  const [tolIn, setTol] = useState(0.000001);
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems, setProblems] = useState([]);

  const CheckErr = (oldVal, newVal) =>
    Math.abs((newVal - oldVal) / newVal) * 100;

  const safeEval = (eq, x) => {
    try {
      return evaluate(eq, { x: parseFloat(x) });
    } catch {
      return NaN;
    }
  };

  const calSecant = () => {

    let xi_1 = parseFloat(x0);
    let xi = parseFloat(x1);
    let tol = parseFloat(tolIn);
    let iter = 0;
    let error = 9999;

    const results = [];
    const pts = [];

    while (error > tol && iter < 50) {
      const fxi = safeEval(equation, xi);
      const fxi_1 = safeEval(equation, xi_1);

      const x_next = xi - (fxi * (xi - xi_1)) / (fxi - fxi_1);
      iter++;
      error = CheckErr(xi_1, x_next);

      results.push({ iteration: iter, xi_1, xi, x_next, error });
      pts.push({ x: xi, y: fxi });

      xi_1 = xi;
      xi = x_next;
    }

    pts.push({ x: xi, y: safeEval(equation, xi) });
    setData(results);
    setPoints(pts);
  };

  // เตรียมค่า plot
  const xValues = [];
  const yValues = [];
  for (let x = -10; x <= 10; x += 0.1) {
    const y = safeEval(equation, x);
    if (!isNaN(y)) {
      xValues.push(x);
      yValues.push(y);
    }
  }

  const saveProblem = async () => {
    const problem = {
      category: "root",
      method: "secant",
      input: {
        equation,
        x0: parseFloat(x0),
        x1: parseFloat(x1),
        tolerance: parseFloat(tolIn),
      },
    };
    const res = await fetch("http://localhost:3001/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problem),
    });
    await res.json();
    alert("Saved");
  };

  const loadProblems = async () => {
    const res = await fetch("http://localhost:3001/problems?category=root&method=secant");
    const problems = await res.json();
    setProblems(problems);
  };

  const loadProblemsToForm = (problem) => {
    const { equation, x0, x1, tolerance } = problem.input;
    setEquation(equation);
    setX0(x0);
    setX1(x1);
    setTol(tolerance);
  };

  return (
    <div className="p-6 bg-yellow-100 min-w-screen min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Secant Method</h1>

      {/* Input */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-4 w-full max-w-lg">
        <div className="mb-2">
          <label>f(x): </label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label>x₀: </label>
          <input
            type="number"
            value={x0}
            onChange={(e) => setX0(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label>x₁: </label>
          <input
            type="number"
            value={x1}
            onChange={(e) => setX1(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label>Tolerance: </label>
          <input
            type="number"
            step="any"
            value={tolIn}
            onChange={(e) => setTol(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={calSecant} className="text-black px-4 py-2 rounded bg-blue-200">
            Calculate
          </button>
          <button onClick={saveProblem} className="text-black px-4 py-2 rounded bg-green-200">
            Save Problem
          </button>
          <button onClick={loadProblems} className="text-black px-4 py-2 rounded bg-yellow-200">
            Load Problems
          </button>
        </div>
      </div>

      {/* problem list */}
      {problems.length > 0 && (
        <div className="bg-white p-4 w-full max-w-lg mb-6">
          <h2 className="text-black">Problems List</h2>
          <ul className="list-disc ml-5">
            {problems.map((p) => (
              <li key={p.id}>
                <button onClick={() => loadProblemsToForm(p)} className="text-black hover:underline">
                  {p.input.equation} (X0={p.input.x0}, X1={p.input.x1}, Tol={p.input.tolerance})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ตารางผลลัพธ์ */}
      {data.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Iterations</h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Iteration</th>
                <th className="border px-2 py-1">X0</th>
                <th className="border px-2 py-1">X1</th>
                <th className="border px-2 py-1">X2</th>
                <th className="border px-2 py-1">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.iteration}</td>
                  <td className="border px-2 py-1">{row.xi_1.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.xi.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.x_next.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.error.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* กราฟ */}
      {points.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 w-full max-w-4xl">
          <Plot
            data={[
              { x: xValues, y: yValues, type: "scatter", mode: "lines", name: "f(x)", line: { color: "blue" } },
              {
                x: points.map((p) => p.x),
                y: points.map((p) => p.y),
                type: "scatter",
                mode: "markers+lines",
                name: "Secant Points",
                marker: { color: "red", size: 8 },
                line: { dash: "dot", color: "orange" },
              },
            ]}
            layout={{ title: "Secant Method Graph", xaxis: { title: "x" }, yaxis: { title: "f(x)" }, height: 500 }}
          />
        </div>
      )}
    </div>
  );
}

export default Secant;
