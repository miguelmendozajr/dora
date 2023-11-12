import { Router } from 'express';
import { getMachine, updateMachine } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Demo" AS result');
    res.json(result[0]);
});

router.get("/washroom", getMachine);
router.patch("/washroom", updateMachine);

export default router;