import { Router } from 'express';
import { getMachine, updateMachine, seedData } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Demo" AS result');
    res.json(result[0]);
});

router.get("/seed", seedData);
router.get("/washroom/:id", getMachine);
router.patch("/washroom/:id", updateMachine);

export default router;