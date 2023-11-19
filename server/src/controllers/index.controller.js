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

/*

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { cycle } = req.query;
        await pool.query('UPDATE machine SET cycle = ? WHERE id = ?', [cycle, id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    };
}

*/

export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { onUse, washing, cycle } = req.query;

        const updateFields = {};
        if (onUse !== undefined) {
            updateFields.onUse = parseInt(onUse);
        }
        if (washing !== undefined) {
            updateFields.washing = parseInt(washing);
        }
        if (cycle !== undefined) {
            await pool.query('UPDATE machine SET cycle = ? WHERE id = ?', [cycle, id]);
        }

        console.log(updateFields);

        if (Object.keys(updateFields).length > 0) {
            await pool.query('UPDATE machine SET ? WHERE id = ?', [updateFields, id]);
        }

        res.json({ message: 'Updated' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        });
    }
};