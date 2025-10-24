const express = require("express");
const router = express.Router();

module.exports = (db) => {
    
    router.post("/", (req, res) => {
        const { method, category, input } = req.body;
        const sql = "INSERT INTO problems (method, category, input) VALUES (?, ?, ?)";
        db.query(sql, [method, category, JSON.stringify(input)], (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Problem saved", id: result.insertId });
        });
    });

    router.get("/", (req, res) => {
        const { method, category } = req.query;
        let sql = "SELECT * FROM problems";
        const params = [];

        if (method && category) {
            sql += " WHERE method = ? AND category = ?";
            params.push(method, category);
        } else if (method) {
            sql += " WHERE method = ?";
            params.push(method);
        } else if (category) {
            sql += " WHERE category = ?";
            params.push(category);
        }

        db.query(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            const formatted = rows.map((r) => ({
                ...r,
                input: typeof r.input === "string" ? JSON.parse(r.input) : r.input,
            }));
            res.json(formatted);
        });
    });

    return router;
};
