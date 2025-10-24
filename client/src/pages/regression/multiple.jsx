import React, { useState } from "react";
import Plot from "react-plotly.js";
import { det } from "mathjs"; 

function MultipleRegression() {
    const [numPoints, setNumPoints] = useState(4);
    const [numVars, setNumVars] = useState(2);
    const [data, setData] = useState([]);
    const [coef, setCoef] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [MA, setMA] = useState([]);
    const [MB, setMB] = useState([]);
    const [problems, setProblems] = useState([]);

    const generateInputs = () => {
        const newData = Array.from({ length: numPoints }, () => ({
            x: Array(numVars).fill(0),
            y: 0,
        }));
        setData(newData);
        setCoef([]);
        setShowTable(true);
        setMA([]);
        setMB([]);
    };

    const handleChange = (i, j, val) => {
        const newData = [...data];
        if (j === "y") newData[i].y = parseFloat(val);
        else newData[i].x[j] = parseFloat(val);
        setData(newData);
    };

    const calculateRegression = () => {
        if (data.length === 0) return;
        const n = data.length;
        const m = numVars;

        // เตรียม summations
        const sumX = Array(m).fill(0);
        const sumXX = Array.from({ length: m }, () => Array(m).fill(0));
        const sumXY = Array(m).fill(0);
        let sumY = 0;

        data.forEach((row) => {
            sumY += row.y;
            for (let i = 0; i < m; i++) {
                sumX[i] += row.x[i];
                sumXY[i] += row.x[i] * row.y;
                for (let j = 0; j < m; j++) {
                    sumXX[i][j] += row.x[i] * row.x[j];
                }
            }
        });

        const A = Array.from({ length: m + 1 }, () => Array(m + 1).fill(0));
        const B = Array(m + 1).fill(0);

        A[0][0] = n;
        for (let i = 1; i <= m; i++) {
            A[0][i] = sumX[i - 1];
            A[i][0] = sumX[i - 1];
        }
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= m; j++) {
                A[i][j] = sumXX[i - 1][j - 1];
            }
        }
        B[0] = sumY;
        for (let i = 1; i <= m; i++) B[i] = sumXY[i - 1];

        const D = det(A); 
        const coeff = [];

        for (let i = 0; i <= m; i++) {
            const Ai = A.map((row) => [...row]);
            for (let j = 0; j <= m; j++) {
                Ai[j][i] = B[j]; // แทน column ที่ i ด้วย B
            }
            const Di = det(Ai);
            coeff.push(Di / D);
        }

        setCoef(coeff);
        setMA(A);
        setMB(B);
    };

    const saveProblem = async () => {
        const problem = {
            category: "regression",
            method: "multiple",
            input: {
                numPoints,
                numVars,
                data,
            },
        };

        const res = await fetch("http://localhost:3001/problems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(problem),
        });

        const dataRes = await res.json();
        alert("โจทย์ถูกบันทึกแล้ว! ID = " + dataRes.id);
    };


    const loadProblems = async () => {
        const res = await fetch(
            "http://localhost:3001/problems?category=regression&method=multiple"
        );
        const problems = await res.json();
        setProblems(problems);
    };


    const loadProblemToForm = (problem) => {
        const { numPoints, numVars, data } = problem.input;
        setNumPoints(numPoints);
        setNumVars(numVars);
        setData(data);
        setShowTable(true);
        setCoef([]);
        setMA([]);
        setMB([]);
    };

    const plotData = () => {
        if (coef.length === 0) return [];

        const traces = [];
        const ys = data.map((row) => row.y);

        const avgX = Array(numVars).fill(0);
        if (data.length > 0) {
            for (let i = 0; i < numVars; i++) {
                avgX[i] = data.reduce((sum, row) => sum + row.x[i], 0) / data.length;
            }
        }

        for (let j = 0; j < numVars; j++) {
            const xs_j = data.map((row) => row.x[j]); 

            traces.push({
                x: xs_j,
                y: ys,
                mode: "markers",
                name: `Data x${j + 1}`,
                type: 'scatter',
                marker: { size: 8 }
            });

        
            const x_j_min = Math.min(...xs_j);
            const x_j_max = Math.max(...xs_j);

            const plot_x_values = [x_j_min, x_j_max];
            const plot_y_values = [];

            plot_x_values.forEach(x_val_for_j => {
                let y_predicted_point = coef[0]; 

                for (let k = 0; k < numVars; k++) {
                    if (k === j) {
                        y_predicted_point += coef[k + 1] * x_val_for_j;
                    } else {
                        y_predicted_point += coef[k + 1] * avgX[k];
                    }
                }
                plot_y_values.push(y_predicted_point);
            });

            traces.push({
                x: plot_x_values,
                y: plot_y_values,
                mode: "lines",
                name: `Fit line x${j + 1}`,
                line: { width: 2 },
                type: 'scatter'
            });
        }
        return traces;
    };

    return (
        <div className="bg-green-300 min-w-screen min-h-screen flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold mb-4">
                Multiple Regression
            </h2>

            <div className="flex space-x-4 mb-4">
                <div>
                    <label>จำนวนจุดข้อมูล (n): </label>
                    <input
                        type="number"
                        min="2"
                        value={numPoints}
                        onChange={(e) => setNumPoints(Number(e.target.value))}
                        className="border px-2"
                    />
                </div>
                <div>
                    <label>จำนวนตัวแปร x: </label>
                    <input
                        type="number"
                        min="1"
                        value={numVars}
                        onChange={(e) => setNumVars(Number(e.target.value))}
                        className="border px-2"
                    />
                </div>
                <button
                    onClick={generateInputs}
                    className="bg-blue-500 px-4 py-2 rounded"
                >
                    สร้างตาราง
                </button>
                <button onClick={saveProblem}>Save</button>
                <button onClick={loadProblems}>Load</button>
            </div>

            {problems.length > 0 && (
                <div className="mt-4">
                    <h2>เลือกโจทย์ที่บันทึกไว้:</h2>
                    <ul>
                        {problems.map((p) => (
                            <li key={p.id}>
                                <button onClick={() => loadProblemToForm(p)}>
                                    ID {p.id} ({p.input.numPoints} จุด)
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showTable && (
                <table className="border-collapse border w-full mb-4 text-center">
                    <thead>
                        <tr>
                            {Array.from({ length: numVars }, (_, i) => (
                                <th key={i} className="border px-2">
                                    x{i + 1}
                                </th>
                            ))}
                            <th className="border px-2">y</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {row.x.map((val, j) => (
                                    <td key={j} className="border">
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handleChange(i, j, e.target.value)}
                                            className="w-20 border-none text-center"
                                        />
                                    </td>
                                ))}
                                <td className="border">
                                    <input
                                        type="number"
                                        value={row.y}
                                        onChange={(e) => handleChange(i, "y", e.target.value)}
                                        className="w-20 border-none text-center"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showTable && (
                <button
                    onClick={calculateRegression}
                    className="bg-green-600 px-4 py-2 rounded mb-4"
                >
                    คำนวณ Regression
                </button>
            )}

            {MA.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Matrix A</h2>
                    <table className="border border-collapse text-center">
                        <tbody>
                            {MA.map((row, i) => (
                                <tr key={i}>
                                    {row.map((val, j) => (
                                        <td key={j} className="border px-3 py-1">
                                            {val.toFixed(4)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2 className="text-xl font-semibold mt-4 mb-2">Matrix B</h2>
                    <table className="border border-collapse text-center">
                        <tbody>
                            <tr>
                                {MB.map((val, i) => (
                                    <td key={i} className="border px-3 py-1">
                                        {val.toFixed(4)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {coef.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">ผลลัพธ์สมการ:</h3>
                    <p>
                        y = {coef[0].toFixed(4)}{" "}
                        {coef.slice(1).map((c, i) => (
                            <span key={i}>
                                {c >= 0 ? "+" : ""}
                                {c.toFixed(4)}x{i + 1}{" "}
                            </span>
                        ))}
                    </p>
                </div>
            )}

            {coef.length > 0 && (
                <Plot
                    data={plotData()}
                    layout={{
                        title: "Multiple Regression Fit Lines for Each X Variable",
                        xaxis: {
                            title: "X values (each X variable plotted independently)",
                            autorange: true, 
                            rangemode: 'tozero' 
                        },
                        yaxis: {
                            title: "Y values",
                            autorange: true, 
                            rangemode: 'tozero'
                        },
                        hovermode: 'closest', 
                        height: 500, 
                        width: 700,  
                        legend: { x: 1, xanchor: 'right', y: 1 } 
                    }}
                />
            )}
        </div>
    );
}

export default MultipleRegression;
