import { useState } from 'react' 
import { det } from 'mathjs'
import Plot from 'react-plotly.js'

const LinearP = () => {
  const [numPoints, setNumPoints] = useState(7);
  const [degree, setDegree] = useState(1);
  const [data, setData] = useState([]);
  const [coef, setCoef] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [matrixA, setMatrixA] = useState([]);
  const [vectorC, setVectorC] = useState([]);

  const numVars = 1;

  const generatesInput = () => {
    const newData = Array.from({ length: numPoints }, () => ({
      x: Array(numVars).fill(0),
      y: 0
    }))
    setData(newData);
    setCoef([]);
    setMatrixA([]);
    setVectorC([]);
    setShowTable(true);
  }

  const handleChange = (i, j, val) => {
    const newData = [...data];
    if (j === "y") newData[i].y = parseFloat(val);
    else newData[i].x[j] = parseFloat(val);
    setData(newData);
  }

  const calReg = () => {
    const p = degree + 1;
    const n = data.length;

    // 1. คำนวณผลรวมที่จำเป็น: Sum(x^k) และ Sum(y*x^k)
    const sumX = Array(2 * degree + 1).fill(0);
    const sumXY= Array(degree + 1).fill(0);

    data.forEach(row => {
      const x = row.x[0];
      const y = row.y;

      let x_power = 1;
      for (let k = 0; k < 2 * degree + 1; k++) {
        sumX[k] += x_power;
        if (k <= degree) {
          sumXY[k] += y * x_power;
        }
        x_power *= x;
      }
    });

    // 2. สร้างเมทริกซ์ของระบบสมการปกติ (Normal Equations) A และ C
    const A = Array.from({ length: p }, (_, i) =>
      Array.from({ length: p }, (_, j) => sumX[i + j])
    );
    const C = sumXY;
    setMatrixA(A);
    setVectorC(C);

    const D = det(A);
    const coeff = [];

    for (let k = 0; k < p; k++) {
      const Ak = A.map((row, i) => {
        const newRow = [...row];
        newRow[k] = C[i];
        return newRow;
      });

      const Dk = det(Ak);
      coeff.push(Dk / D);
    }

    setCoef(coeff);
  }

  const PlotDatas = () => {
    const traces = [];
    const xs = data.map((row) => row.x[0]);
    const ys = data.map((row) => row.y);

    //Plot จุดข้อมูล 
    traces.push({
      x: xs,
      y: ys,
      mode: "markers",
      name: `Data Points (x)`,
      type: 'scatter',
      marker: { size: 8, color: 'orange' }
    });

    if (coef.length > 0) {
      // 2. Plot เส้นถดถอย
      const x_min = Math.min(...xs);
      const x_max = Math.max(...xs);

      const numPointsInCurve = 100;
      const step = (x_max - x_min) / numPointsInCurve;
      const plot_x = [];
      const plot_y = [];

      for (let i = 0; i <= numPointsInCurve; i++) {
        const x_val = x_min + i * step;
        plot_x.push(x_val);

        // คำนวณ Y_hat = b0 + b1*x + b2*x^2 + ...
        let y_hat = 0;
        for (let j = 0; j < coef.length; j++) {
          y_hat += coef[j] * Math.pow(x_val, j);
        }
        plot_y.push(y_hat);
      }

      traces.push({
        x: plot_x,
        y: plot_y,
        mode: "lines",
        name: `${degree === 1 ? 'Linear' : 'Polynomial'} Regression Line (Degree ${degree})`,
        line: { width: 2, color: 'blue' },
        type: 'scatter'
      });
    }

    return traces;
  }


  return (
    <div className="p-6">
      <div>
        <div>
          <label>
            จำนวนจุดข้อมูล (n):
          </label>
          <input
            className='w-20 border border-collapse'
            type='number'
            value={numPoints}
            onChange={(e) => setNumPoints(Number(e.target.value))}
          />
        </div>
        <div>
          <label>ระดับขั้น (Degree) ของ Polynomial (1 = Linear):</label>
          <input
            className='w-20 border border-collapse'
            type='number'
            value={degree}
            min={1}
            onChange={(e) => setDegree(Number(e.target.value))}
          />
        </div>
        <div>
          <button onClick={generatesInput}>
            สร้างตาราง
          </button>
        </div>
      </div>

      {showTable && (
        <div>
          <table className="border border-collapse text-center mt-4">
            <thead>
              <tr>
                <th className="border px-2">x</th>
                <th className="border px-2">y</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="border">
                    <input
                      type="number"
                      value={row.x[0]}
                      onChange={(e) => handleChange(i, 0, e.target.value)}
                      className="w-20 text-center"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.y}
                      onChange={(e) => handleChange(i, "y", e.target.value)}
                      className="w-20 text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={calReg} className='border border-collapse mt-2 px-2 py-1'>คำนวณ Regression</button>
        </div>
      )}

      {/* **ส่วนแสดงผลเมทริกซ์ผลรวม A และเวกเตอร์ C** */}
      {matrixA.length > 0 && (
        <div className="mt-4 flex space-x-8">
          <div>
            <h2 className="font-semibold">เมทริกซ์ผลรวม A</h2>
            <table className='border border-collapse text-sm'>
              <tbody>
                {matrixA.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td key={j} className="border px-2 py-1">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className="font-semibold">เวกเตอร์ C </h2>
            <table className='border border-collapse text-sm'>
              <tbody>
                {vectorC.map((val, i) => (
                  <tr key={i}>
                    <td className='border px-2 py-1'>
                      {val.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* **จบส่วนแสดงผลเมทริกซ์** */}

      {coef.length > 0 && (
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-2">สมการผลลัพธ์</h1>
          <p className="text-lg">
            y = {coef[0].toFixed(4)}
            {coef.slice(1).map((c, i) => (
              <span key={i}>
                {c >= 0 ? " + " : " - "}
                {Math.abs(c).toFixed(4)}x{i + 1 > 1 ? `^${i + 1}` : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      {coef.length > 0 && (
        <Plot
          data={PlotDatas()}
          layout={{
            title: `Simple ${degree === 1 ? 'Linear' : 'Polynomial'} Regression (Degree ${degree})`,
            xaxis: {
              title: "X",
              zeroline: true
            },
            yaxis: {
              title: "Y",
              zeroline: true
            },
            height: 500,
            width: 700
          }}
        />
      )}
    </div>
  )
}

export default LinearP