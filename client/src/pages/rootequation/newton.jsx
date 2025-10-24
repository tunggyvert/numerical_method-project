import { useState } from "react";
import { derivative, evaluate } from "mathjs";
import Plot from "react-plotly.js";

function Newton() {
  const [equation, setEquation] = useState("x^2 - 7");
  const [xInit, setXinit] = useState(2);
  const [tol, setTol] = useState(0.000001);
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems, setProblems] = useState([]);

  const safeEvaluate = (expr, scope = {}) => {
    try {
      return evaluate(expr, scope);
    } catch (e) {
      return NaN; 
    }
  };

  const checkErr = (oldVal, newVal) => {
    return Math.abs((newVal - oldVal) / newVal) * 100;
  };

  const calNewton = () => {
    // ตรวจเบื้องต้นก่อนคำนวณจริง
    if (!equation || equation.trim() === "") {
      alert("กรุณาใส่สมการก่อนคำนวณ");
      return;
    }
    //ดัก
    const test = safeEvaluate(equation, { x: 1 });
    if (Number.isNaN(test)) {
      alert("สมการมี syntax ผิด — กรุณาตรวจสอบสมการ (เช่น 'x^2 - 7')");
      return;
    }
    let derivExpr;
    try {
      derivExpr = derivative(equation, "x").toString();
    } catch (e) {
      alert("ไม่สามารถหาอนุพันธ์ได้ (syntax ของสมการอาจผิด): " + e.message);
      return;
    }

    let iter = 0;
    const maxIter = 50;
    let error = 100;
    let xi = parseFloat(xInit);
    const tolIn = parseFloat(tol);
    const results = [];
    const pts = [];

    do {
      const fx = safeEvaluate(equation, { x: xi });
      const fprime = safeEvaluate(derivExpr, { x: xi });

      if (Number.isNaN(fx) || Number.isNaN(fprime)) {
        alert("คำนวณค่า f(x) หรือ f'(x) ไม่ได้ที่ x = " + xi);
        break;
      }

      if (fprime === 0) {
        alert("หยุดการคำนวณ");
        break;
      }

      const newx = xi - fx / fprime;
      error = checkErr(xi, newx);
      iter++;

      results.push({
        iteration: iter,
        x: xi,
        newx,
        fx,
        fprime,
        error,
      });

      pts.push({ x: xi, y: fx });

      xi = newx;
    } while (error > tolIn && iter < maxIter);

    setData(results);
    setPoints(pts);
  };

  const xValues = [];
  const yValues = [];
  for (let x = -10; x <= 10; x += 0.1) {
    xValues.push(Number(x.toFixed(4)));
    const y = safeEvaluate(equation, { x });
    yValues.push(Number.isNaN(y) ? null : y);
  }

  const saveProblem = async () => {
    const Problem = {
      category: "root",
      method: "newton",
      input: {
        equation,
        x: parseFloat(xInit),
        tolerance: parseFloat(tol),
      },
    };
    try {
      const res = await fetch("http://localhost:3001/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Problem),
      });
      const data = await res.json();
      alert("Saved successfully! id=" + (data.id ?? ""));
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  };

  const loadProblems = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/problems?category=root&method=newton"
      );
      const problems = await res.json();
      setProblems(problems);
    } catch (e) {
      alert("Load failed: " + e.message);
    }
  };

  const loadProblemsToForm = (problem) => {
    //problem.input = { equation, x, tolerance }
    const { equation: eq, x, tolerance } = problem.input;
    setEquation(eq);
    setXinit(Number(x));
    setTol(Number(tolerance));
  };

  return (
    <div className="bg-yellow-200 min-h-screen w-screen flex flex-col items-center">
      <h1 className="text-black text-2xl font-bold mt-4">
        Newton Raphson Method
      </h1>

      {/* Input */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-lg">
        <div className="mb-2">
          <label className="text-black">Function f(x):</label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label className="text-black">X(initial):</label>
          <input
            type="number"
            value={xInit}
            onChange={(e) => setXinit(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label className="text-black">Tolerance:</label>
          <input
            type="number"
            value={tol}
            onChange={(e) => setTol(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>

        <div className="flex gap-4 mt-3">
          <button
            onClick={calNewton}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Calculate
          </button>
          <button onClick={saveProblem} className="bg-green-500 text-white px-4 py-2 rounded">
            Save Problem
          </button>
          <button onClick={loadProblems} className="bg-purple-500 text-white px-4 py-2 rounded">
            Load Problems
          </button>
        </div>
      </div>

      {/* Problems list */}
      {problems.length > 0 && (
        <div className="bg-white w-full max-w-xl mb-6 p-4 rounded">
          <h2 className="text-black">Problems List</h2>
          <ul className="list-disc ml-5">
            {problems.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => loadProblemsToForm(p)}
                  className="text-black hover:underline"
                >
                  {p.input.equation} (xInit={p.input.x}, Tol={p.input.tolerance})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      {data.length > 0 && (
        <div className="bg-white mb-6 w-full max-w-3xl rounded-lg shadow-md p-4">
          <h2 className="text-black text-lg font-semibold mb-2">
            Iterations
          </h2>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Iteration</th>
                <th className="border px-2 py-1">x(old)</th>
                <th className="border px-2 py-1">x(new)</th>
                <th className="border px-2 py-1">f(x)</th>
                <th className="border px-2 py-1">f'(x)</th>
                <th className="border px-2 py-1">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.iteration}</td>
                  <td className="border px-2 py-1">{row.x.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.newx.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.fx.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.fprime.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.error.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Graph */}
      {points.length > 0 && (
        <div className="bg-white p-6 w-full max-w-3xl">
          <h2 className="text-black">Graph</h2>
          <Plot
            data={[
              {
                x: xValues,
                y: yValues,
                type: "scatter",
                mode: "lines",
                name: "f(x)",
                line: { color: "blue" },
              },
              {
                x: points.map((p) => p.x),
                y: points.map((p) => p.y),
                type: "scatter",
                mode: "markers+lines",
                name: "Newton Points",
                marker: { color: "red" },
                line: { dash: "dot", color: "orange" },
              },
            ]}
            layout={{
              title: "Newton-Raphson Method Graph",
              xaxis: { title: "x" },
              yaxis: { title: "f(x)" },
              height: 500,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Newton;
