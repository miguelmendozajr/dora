import { pool } from "../db.js";

export const getMachine = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM machine WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { onUse, washing } = req.body;
        await pool.query('UPDATE machine SET onUse = ?, washing = ? WHERE id = ?', [onUse, washing, id]);
        res.json('Updated');
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}