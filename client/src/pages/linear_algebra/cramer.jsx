import React, { useState, useEffect } from "react";
import { det, matrix } from "mathjs";

function Cramer() {
    function createMatrix(size) {
        return Array.from({ length: size }, () => Array(size).fill(0));
    }

    const [n, setN] = useState("3"); 
    const [A, setA] = useState(createMatrix(3));
    const [B, setB] = useState(Array(3).fill(0));
    const [result, setResult] = useState([]);
    const [problems, setProblems] = useState([]);

    const handleSizeChange = (e) => {
        const value = e.target.value;
        setN(value);

        const newSize = parseInt(value);
        if (!isNaN(newSize) && newSize >= 2) {
            setA(createMatrix(newSize));
            setB(Array(newSize).fill(0));
        } else {
            setA([]);
            setB([]);
        }
        setResult([]);
    };

    const handleMatrixChange = (i, j, value) => {
        const newA = A.map((row) => [...row]);
        newA[i][j] = value;
        setA(newA);
    };

    const handleVectorChange = (i, value) => {
        const newB = [...B];
        newB[i] = value;
        setB(newB);
    };

    const replaceColumn = (matrixA, vectorB, col) =>
        matrixA.map((row, i) =>
            row.map((val, j) => (j === col ? vectorB[i] : val))
        );

    const calculateCramer = () => {
        const size = parseInt(n);
        if (isNaN(size) || size < 2) {
            alert("กรุณาใส่ขนาดเมทริกซ์ที่ถูกต้อง (>= 2)");
            return;
        }

        try {
            const numericA = A.map((row) => row.map((val) => Number(val)));
            const numericB = B.map((val) => Number(val));

            const detA = det(matrix(numericA));
            if (Math.abs(detA) < 1e-12) {
                alert("ดีเทอร์มิแนนต์ของเมทริกซ์เป็นศูนย์ — ไม่มีคำตอบแน่นอน");
                return;
            }

            const results = [];
            for (let i = 0; i < size; i++) {
                const Ai = replaceColumn(numericA, numericB, i);
                const detAi = det(matrix(Ai));
                results.push(detAi / detA);
            }

            setResult(results);
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการคำนวณ: " + err.message);
        }
    };

    const handleClear = () => {
        const size = parseInt(n);
        if (!isNaN(size) && size >= 2) {
            setA(createMatrix(size));
            setB(Array(size).fill(0));
        } else {
            setA([]);
            setB([]);
        }
        setResult([]);
    };

    //API
    const saveProblem = async () => {
        const size = parseInt(n);
        if (isNaN(size) || size < 2) {
            alert("กรุณาใส่ขนาดเมทริกซ์ที่ถูกต้องก่อนบันทึก");
            return;
        }

        const problem = {
            category: "linear",
            method: "cramer",
            input: {
                n: size,
                A,
                B,
            },
        };

        try {
            const res = await fetch("http://localhost:3001/problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(problem),
            });
            const data = await res.json();
            alert("โจทย์ถูกบันทึกแล้ว! ID = " + data.id);
            loadProblems(); 
        } catch (err) {
            alert("ไม่สามารถบันทึกโจทย์ได้: " + err.message);
        }
    };

    const loadProblems = async () => {
        try {
            const res = await fetch(
                "http://localhost:3001/problems?category=linear&method=cramer"
            );
            const problems = await res.json();
            setProblems(problems);
        } catch (err) {
            alert("ไม่สามารถโหลดโจทย์ได้: " + err.message);
        }
    };

    const loadProblemToForm = (problem) => {
        const { n, A, B } = problem.input;
        setN(n.toString());
        setA(A);
        setB(B);
        setResult([]);
    };

    useEffect(() => {
        loadProblems();
    }, []);

    return (
        <div className="bg-yellow-100 min-w-screen min-h-screen flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
                Cramer's Rule Method
            </h1>

            {/* โหลดโจทย์ */}
            <div className="mb-4 flex gap-2 items-center">
                <select
                    onChange={(e) => {
                        const selected = problems.find(
                            (p) => p.id === parseInt(e.target.value)
                        );
                        if (selected) loadProblemToForm(selected);
                    }}
                    className="border rounded px-2 py-1"
                >
                    <option>-- โหลดโจทย์ --</option>
                    {problems.map((p) => (
                        <option key={p.id} value={p.id}>
                            ID {p.id} (n={p.input.n})
                        </option>
                    ))}
                </select>
            </div>

            {/* ขนาดเมทริกซ์ */}
            <div className="mb-4 text-center">
                <label className="text-black font-medium">ขนาดเมทริกซ์ (n × n):</label>
                <input
                    type="text"
                    value={n}
                    onChange={handleSizeChange}
                    className="border px-2 py-1 ml-2 w-20 text-center rounded"
                />
            </div>

            {/* ตาราง A + B แสดงเฉพาะ n >= 2 */}
            {parseInt(n) >= 2 && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6 w-full max-w-fit">
                    <p className="font-semibold mb-3 text-center">
                        กรอกค่าของเมทริกซ์ A และเวกเตอร์ B:
                    </p>
                    <table className="mx-auto border-collapse">
                        <tbody>
                            {A.map((row, i) => (
                                <tr key={i}>
                                    {row.map((val, j) => (
                                        <td key={j} className="p-1">
                                            <input
                                                type="text"
                                                value={val}
                                                onChange={(e) =>
                                                    handleMatrixChange(i, j, e.target.value)
                                                }
                                                className="border w-16 text-center rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-1 font-bold text-lg">|</td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            value={B[i]}
                                            onChange={(e) => handleVectorChange(i, e.target.value)}
                                            className="border w-16 text-center rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            onClick={calculateCramer}
                            className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Calculate
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-red-400 text-black px-4 py-2 rounded-lg hover:bg-red-500 transition"
                        >
                            Clear
                        </button>
                        <button
                            onClick={saveProblem}
                            className="bg-green-400 text-black px-3 py-1 rounded hover:bg-green-500"
                        >
                            💾 Save
                        </button>
                    </div>
                </div>
            )}

            {/* Output */}
            {result.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
                    <h2 className="text-xl font-semibold mb-3 text-green-700">ผลลัพธ์:</h2>
                    {result.map((x, i) => (
                        <p key={i} className="text-lg">
                            x<sub>{i + 1}</sub> = {x.toFixed(6)}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Cramer;
