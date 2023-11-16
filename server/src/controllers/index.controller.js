import { pool } from "../db.js";

export const seedData = async (req, res) => {
    try {
        await pool.query("INSERT INTO machine VALUES (1, 'Lavadora', 0, 0), (2, 'Secadora', 0, 0)");
        res.json('ok');
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
};

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

export const setWashingTrue = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE machine SET onUse = 1, washing = 1 WHERE id = ?', [id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}

export const setWashingFalse = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE machine SET washing = 0 WHERE id = ?', [id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}

export const setOnUseFalse = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE machine SET onUse = 0 WHERE id = ?', [id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { onUse, washing } = req.body;
        console.log(req);
        console.log(onUse, washing);
        await pool.query('UPDATE machine SET onUse = ?, washing = ? WHERE id = ?', [parseInt(onUse), parseInt(washing), id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}