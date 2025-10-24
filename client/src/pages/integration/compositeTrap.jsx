import { useState } from "react";
import Plot from "react-plotly.js";
import { evaluate, abs } from "mathjs";
import Algebrite from "algebrite";

const CompositeTrapezoidal = () => {
  const [fx, setFx] = useState("4x^5-3x^4+x^3-6x+2");
  const [a, setA] = useState(2);
  const [b, setB] = useState(8);
  const [n, setN] = useState(4);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const fa = parseFloat(a);
    const fb = parseFloat(b);
    const fn = parseInt(n);

    // --- Step 1: เตรียมจุดและคำนวณค่า f(x)
    const h = (fb - fa) / fn;
    const xValues = Array.from({ length: fn + 1 }, (_, i) => fa + i * h);
    const yValues = xValues.map((x) => evaluate(fx, { x }));

    let sum = yValues[0] + yValues[fn];
    for (let i = 1; i < fn; i++) sum += 2 * yValues[i];
    const approx = (h / 2) * sum;

    const integralExpr = Algebrite.integral(fx).toString(); 
    const exactValue =
    evaluate(integralExpr, { x: fb }) - evaluate(integralExpr, { x: fa });

    const error = abs((exactValue - approx) / exactValue);

    setResult({
        approx,
        exactValue,
        error,
        xValues,
        yValues,
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Composite Trapezoidal Rule</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>f(x): </label>
        <input value={fx} onChange={(e) => setFx(e.target.value)} />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>a: </label>
        <input type="number" value={a} onChange={(e) => setA(e.target.value)} />
        <label style={{ marginLeft: "10px" }}>b: </label>
        <input type="number" value={b} onChange={(e) => setB(e.target.value)} />
        <label style={{ marginLeft: "10px" }}>n: </label>
        <input type="number" value={n} onChange={(e) => setN(e.target.value)} />
      </div>

      <button onClick={handleCalculate}>คำนวณ</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <p>Approximate = {result.approx.toFixed(6)}</p>
          <p>Exact = {result.exactValue.toFixed(6)}</p>
          <p>Error = {result.error.toExponential(6)}</p>

          <Plot
            data={[
              // --- ฟังก์ชันจริง (เส้นสีน้ำเงิน)
              {
                x: Array.from(
                  { length: 300 },
                  (_, i) => parseFloat(a) + (i * (b - a)) / 300
                ),
                y: Array.from({ length: 300 }, (_, i) =>
                  evaluate(fx, {
                    x: parseFloat(a) + (i * (b - a)) / 300,
                  })
                ),
                type: "scatter",
                mode: "lines",
                name: "f(x)",
                line: { color: "blue", width: 2 },
              },
              // --- เส้นตั้งลงแกน x
              ...result.xValues.map((x, i) => ({
                x: [x, x],
                y: [0, result.yValues[i]],
                type: "scatter",
                mode: "lines",
                line: { color: "gray", width: 1, dash: "dot" },
                showlegend: false,
              })),
              // --- ช่อง trapezoid แต่ละช่วง (สีแตกต่าง)
              ...result.xValues.slice(0, -1).map((x, i) => {
                const x1 = x;
                const x2 = result.xValues[i + 1];
                const y1 = result.yValues[i];
                const y2 = result.yValues[i + 1];
                const colorPalette = [
                  "rgba(255,0,0,0.3)",
                  "rgba(0,200,255,0.3)",
                  "rgba(0,255,0,0.3)",
                  "rgba(255,200,0,0.3)",
                  "rgba(200,0,255,0.3)",
                ];
                return {
                  x: [x1, x2, x2, x1],
                  y: [0, 0, y2, y1],
                  type: "scatter",
                  fill: "toself",
                  fillcolor: colorPalette[i % colorPalette.length],
                  line: { color: "rgba(0,0,0,0)" },
                  showlegend: false,
                };
              }),
              // --- เส้นเชื่อม trapezoid (สีแดง)
              {
                x: result.xValues,
                y: result.yValues,
                type: "scatter",
                mode: "lines+markers",
                name: "Trapezoids",
                line: { color: "red", width: 2 },
                marker: { color: "red", size: 6 },
              },
            ]}
            layout={{
              width: 750,
              height: 450,
              title: "Composite Trapezoidal Visualization",
              xaxis: { title: "x", zeroline: true },
              yaxis: { title: "f(x)", zeroline: true },
              plot_bgcolor: "white",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CompositeTrapezoidal;
