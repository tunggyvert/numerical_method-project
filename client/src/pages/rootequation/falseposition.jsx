import {useState} from "react";
import { evaluate } from "mathjs";
import Plot  from "react-plotly.js";

function FalsePo() {
  const [equation, setEquation] = useState("x^4-13");
  const [xlIn, setXl] = useState(1.5);
  const [xrIn, setXr] = useState(2.0);
  const [tolIn, setTol] = useState(0.000001);
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [problems,setProblems] = useState([]);

  const checkErr = (xold, xnew) => {
    return Math.abs((xnew - xold) / xnew) * 100;
  };

  const calFalse = () =>{
    let iter = 0;
    let x1,error;
    let xl = parseFloat(xlIn);
    let xr= parseFloat(xrIn);
    let tol= parseFloat(tolIn);
    const maxIter = 50;
    const results = [];
    const pts = [];
    
    do {
      x1 = (xl * evaluate(equation, { x: xr }) - xr * evaluate(equation, { x: xl })) / (evaluate(equation, { x: xr }) - evaluate(equation, { x: xl }));
      const fxr = evaluate(equation, { x: xr });
      const fx1 = evaluate(equation, { x: x1 });
      iter++;

      if(fx1 * fxr > 0){
        error = checkErr(xr,x1);
        results.push({iteration: iter,xl:xl,xr:xr,x1,fx1,error});
        xr = x1;
      }else{
        error = checkErr(xl,x1);
        results.push({iteration:iter,xl:xl,xr:xr,x1,fx1,error});
        xl = x1;
      }
      pts.push({x: x1,y: fx1});
  }while (error > tol && iter < maxIter);

  setData(results);
  setPoints(pts);
  }
  const saveProblem = async () => {
    const problem = {
      category: "root",
      method: "False",
      input:{
        xl: parseFloat(xlIn),
        xr: parseFloat(xrIn),
        tolerance: parseFloat(tolIn),
      },
    }
  const res = await fetch("http://localhost:3001/problems", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(problem),
    })
    const data = await res.json();
    alert("saved!")
  }
  
  const loadProblems = async () => {
    const res = await fetch("http://localhost:3001/problems?category=root&method=False");
    const problems = await res.json();
    setProblems(problems);
  };

  const loadProblemsToForm = (problem) => {
    const {equation,xl,xr,tolerance} = problem.input;
    setEquation(equation);
    setXl(xl);
    setXr(xr),
    setTol(tolerance);
  }
  return (
    <div className="bg-yellow-100 min-h-screen min-w-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">False Position Method</h1>

      {/* Input form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
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
        <div className="mb-2">
          <label className="text-black">Tolerance: </label>
          <input
            type="number"
            value={tolIn}
            onChange={(e) => setTol(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>

        <div className="flex gap-4">
        <button
          onClick={calFalse}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Calculate
        </button>
        <button
          onClick={saveProblem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Save Problem
        </button>
        <button
          onClick={loadProblems}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Load Problem
        </button>
      </div>
    </div>
      {problems.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-2">Saved Problems</h2>
          <ul className="list-disc ml-5">
            {problems.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => loadProblemsToForm(p)}
                  className="text-blue-600 hover:underline"
                >
                  {p.input.equation} (XL={p.input.xl}, XR={p.input.xr}, Tol={p.input.tolerance})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

     
      {/* Results table */}
      {data.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-black">Results</h2>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Iteration</th>
                <th className="border border-gray-300 px-4 py-2">XL</th>
                <th className="border border-gray-300 px-4 py-2">XR</th>
                <th className="border border-gray-300 px-4 py-2">X1</th>
                <th className="border border-gray-300 px-4 py-2">f(X1)</th>
                <th className="border border-gray-300 px-4 py-2">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{row.iteration}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.xl.toFixed(6)}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.xr.toFixed(6)}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.x1.toFixed(6)}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.fx1.toFixed(6)}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.error.toFixed(6)}</td>
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
                      name: "f(x1)",
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

export default FalsePo;