import { useState } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function ModifiedGraphical() {
  const [equation, setEquation] = useState("43x-180");
  const [xMin, setXMin] = useState(1);
  const [xMax, setXMax] = useState(10);
  const [tol, setTol] = useState(0.000001);
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems, setProblems] = useState([]);

  const calGraphical = () => {
    const f = (x) => evaluate(equation, { x });
    const plotStep = (parseFloat(xMax) - parseFloat(xMin)) / 200;

    const pts = [];
    for (let x = parseFloat(xMin); x <= parseFloat(xMax); x += plotStep) {
      pts.push({ x, y: f(x) });
    }
    setPoints(pts);

    let iterations = [];
    let step = 1.0;
    let foundRange = null;

    for (let x = parseFloat(xMin); x <= parseFloat(xMax); x += step) {
      if (f(x) * f(x + step) < 0) {
        foundRange = [x, x + step];
        break;
      }
    }

    if (!foundRange) {
      alert("ไม่พบ root ในช่วงที่กำหนด");
      setData([]);
      return;
    }

    let [x0, x1] = foundRange;
    let iteration = 0;
    let error = Infinity;

    while (error > tol) {
      iteration++;
      let x2 = (x0 + x1) / 2; 
      error = Math.abs(f(x2));

      iterations.push({
        iteration,
        x0,
        x1,
        x2,
        error,
      });

      // เลือกช่วงใหม่
      if (f(x0) * f(x2) < 0) {
        x1 = x2;
      } else {
        x0 = x2;
      }
      if (iteration > 1000) break;
    }

    setData(iterations);
  };

  const saveProblem = async () => {
    const problem = {
      category: "root",
      method: "Graphical",
      input: { equation, xMin: parseFloat(xMin), xMax: parseFloat(xMax), tol },
    };
    const res = await fetch("http://localhost:3001/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(problem),
    });
    const data = await res.json();
    alert("บันทึกสำเร็จ! ID = " + data.id);
  };

  const loadProblems = async () => {
    const res = await fetch(
      "http://localhost:3001/problems?category=root&method=Graphical"
    );
    const data = await res.json();
    setProblems(data);
  };

  const loadProblemToForm = (problem) => {
    const { equation, xMin, xMax, tol } = problem.input;
    setEquation(equation);
    setXMin(xMin);
    setXMax(xMax);
    setTol(tol);
  };

  return (
    <div className="bg-yellow-100 min-w-screen min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Modified Graphical Method</h1>

      {/* Input */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-lg">
        <div className="mb-2">
          <label>f(x): </label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="border px-2 py-1 ml-2 w-64"
          />
        </div>
        <div className="mb-2">
          <label>X min: </label>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-2">
          <label>X max: </label>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div className="mb-4">
          <label>Tolerance: </label>
          <input
            type="number"
            step="0.0001"
            value={tol}
            onChange={(e) => setTol(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={calGraphical}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Calculate
          </button>
          <button
            onClick={saveProblem}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save Problems
          </button>
          <button
            onClick={loadProblems}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Load Problems
          </button>
        </div>
      </div>

       {/* รายการโจทย์ */}
      {problems.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md mt-4 w-full max-w-lg">
          <h2 className="font-semibold mb-2">Saved Problems</h2>
          <ul className="list-disc ml-5">
            {problems.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => loadProblemToForm(p)}
                  className="text-blue-600 hover:underline"
                >
                  {p.input.equation} ({p.input.xMin} to {p.input.xMax})
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
                <th className="border px-2 py-1">Iter</th>
                <th className="border px-2 py-1">x0</th>
                <th className="border px-2 py-1">x1</th>
                <th className="border px-2 py-1">x2</th>
                <th className="border px-2 py-1">Error</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{row.iteration}</td>
                  <td className="border px-2 py-1">{row.x0.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.x1.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.x2.toFixed(6)}</td>
                  <td className="border px-2 py-1">{row.error.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* กราฟ */}
      {points.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Graph</h2>
          <Plot
            data={[
              {
                x: points.map((p) => p.x),
                y: points.map((p) => p.y),
                type: "scatter",
                mode: "lines",
                line: { color: "green" },
                name: "f(x)",
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
              title: "Modified Graphical Method Visualization",
              xaxis: { title: "x" },
              yaxis: { title: "f(x)" },
            }}
          />
        </div>
      )}

     
    </div>
  );
}

export default ModifiedGraphical;
