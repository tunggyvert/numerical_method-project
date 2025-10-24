import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

function Lagrange() {
  const [points, setPoints] = useState([{ x: "", y: "" }]);
  const [calcX, setCalcX] = useState("");
  const [result, setResult] = useState(null);
  const [termResults, setTermResults] = useState([]);
  const [formula, setFormula] = useState("");
  const [polyType, setPolyType] = useState("Linear");
  const [problems, setProblems] = useState([]);

  // --- Form Handling ---
  const addPoint = () => setPoints([...points, { x: "", y: "" }]);
  const removePoint = (i) => setPoints(points.filter((_, index) => index !== i));
  const handlePointChange = (i, axis, value) => {
    const newPoints = points.map((p, index) =>
      index === i ? { ...p, [axis]: value } : p
    );
    setPoints(newPoints);
  };

  const interpolate = () => {
    const n = points.length;
    const xVals = points.map((p) => Number(p.x));
    const yVals = points.map((p) => Number(p.y));
    const x = Number(calcX);

    if (xVals.some(isNaN) || yVals.some(isNaN) || isNaN(x)) {
      alert("กรุณากรอกค่าตัวเลขให้ครบทุกจุด และค่า x");
      return;
    }

    if (n === 2) setPolyType("Linear");
    else if (n === 3) setPolyType("Quadratic");
    else setPolyType("Polynomial");

    // Lagrange term
    let formulaStr = "";
    const termValues = [];
    let fx = 0;

    for (let i = 0; i < n; i++) {
      let Li = 1;
      for (let j = 0; j < n; j++) if (i !== j) Li *= (x - xVals[j]) / (xVals[i] - xVals[j]);
      const termValue = Li * yVals[i];
      termValues.push({ Li: Li.toFixed(6), y: yVals[i].toFixed(6), termValue: termValue.toFixed(6) });
      fx += termValue;
      formulaStr += (i === 0 ? "" : " + ") + `L${i}*${yVals[i].toFixed(6)}`;
    }

    setFormula(`f(x) = ${formulaStr}`);
    setTermResults(termValues);
    setResult({ x, fx: fx.toFixed(6), xVals, yVals });
  };

  const saveProblem = async () => {
    const problem = {
      category: "interpolation",
      method: "lagrange",
      input: { points, calcX },
    };
    const res = await fetch("http://localhost:3001/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problem),
    });
    const data = await res.json();
    alert("โจทย์ถูกบันทึกแล้ว! ID = " + data.id);
    loadProblems();
  };

  const loadProblems = async () => {
    const res = await fetch("http://localhost:3001/problems?category=interpolation&method=lagrange");
    const problems = await res.json();
    setProblems(problems);
  };

  const loadProblemToForm = (problem) => {
    const { points, calcX } = problem.input;
    setPoints(points);
    setCalcX(calcX);
    setResult(null);
  };

  useEffect(() => {
    loadProblems();
  }, []);

  let plotX = [];
  let plotY = [];
  if (result) {
    const { xVals, yVals } = result;
    const minX = Math.min(...xVals) - 1;
    const maxX = Math.max(...xVals) + 1;
    const step = (maxX - minX) / 200;

    for (let xx = minX; xx <= maxX; xx += step) {
      let yy = 0;
      for (let i = 0; i < xVals.length; i++) {
        let term = yVals[i];
        for (let j = 0; j < xVals.length; j++) if (i !== j) term *= (xx - xVals[j]) / (xVals[i] - xVals[j]);
        yy += term;
      }
      plotX.push(xx);
      plotY.push(yy);
    }
  }

  return (
    <div className="bg-yellow-100 min-w-screen min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Lagrange Interpolation</h1>

      {/* Load problem */}
      <div className="mb-4 flex gap-2 items-center">
        <select
          onChange={(e) => {
            const selected = problems.find((p) => p.id === parseInt(e.target.value));
            if (selected) loadProblemToForm(selected);
          }}
          className="border rounded px-2 py-1"
        >
          <option>-- โหลดโจทย์ --</option>
          {problems.map((p) => (
            <option key={p.id} value={p.id}>
              ID {p.id} (points={p.input.points.length})
            </option>
          ))}
        </select>
      </div>

      {/* Input Points */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Input Points</h2>
        {points.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder={`x${i}`}
              value={p.x}
              onChange={(e) => handlePointChange(i, "x", e.target.value)}
              className="border px-2 py-1 w-20 rounded text-center"
            />
            <input
              type="text"
              placeholder={`y${i}`}
              value={p.y}
              onChange={(e) => handlePointChange(i, "y", e.target.value)}
              className="border px-2 py-1 w-20 rounded text-center"
            />
            {points.length > 1 && (
              <button
                onClick={() => removePoint(i)}
                className="bg-red-400 px-2 py-1 rounded text-black hover:bg-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPoint}
          className="bg-green-400 px-3 py-1 rounded hover:bg-green-500 text-black"
        >
          + Add Point
        </button>

        {/* Input x */}
        <div className="mt-4">
          <label className="mr-2 font-semibold">คำนวณที่ x = </label>
          <input
            type="text"
            value={calcX}
            onChange={(e) => setCalcX(e.target.value)}
            className="border px-2 py-1 w-32 rounded text-center"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={interpolate}
          className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Calculate
        </button>
        <button
          onClick={saveProblem}
          className="bg-green-400 text-black px-3 py-1 rounded hover:bg-green-500"
        >
          💾 Save
        </button>
      </div>

      {/* Formula */}
      {formula && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 w-full max-w-3xl">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Lagrange Polynomial Formula:</h2>
          <p className="wrap-break-words">{formula}</p>

          <h3 className="mt-2 font-semibold text-blue-700">Terms:</h3>
          {termResults.map((t, i) => (
            <p key={i}>
              L{i} = {t.Li}, f(x{i}) = {t.y} → L{i}*f(x{i}) = {t.termValue}
            </p>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-lg text-center">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Result</h2>
          <p>f({result.x}) = {result.fx}</p>
        </div>
      )}

      {/* Graph */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-3 text-center text-green-700">Graph</h2>
          <Plot
            data={[
              {
                x: plotX,
                y: plotY,
                type: "scatter",
                mode: "lines",
                line: { color: "green" },
                name: "Lagrange Polynomial",
              },
              {
                x: points.map((p) => Number(p.x)),
                y: points.map((p) => Number(p.y)),
                type: "scatter",
                mode: "markers",
                marker: { color: "red", size: 8 },
                name: "Data Points",
              },
              {
                x: [Number(calcX)],
                y: [Number(result.fx)],
                type: "scatter",
                mode: "markers",
                marker: { color: "orange", size: 10 },
                name: `x = ${calcX}`,
              },
            ]}
            layout={{ width: 700, height: 400, xaxis: { title: "x" }, yaxis: { title: "f(x)" } }}
          />
        </div>
      )}
    </div>
  );
}

export default Lagrange;
