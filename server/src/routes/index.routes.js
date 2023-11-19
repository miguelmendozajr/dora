import { Router } from 'express';
import { getMachine, seedData, updateMachine } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Server is working and connected to database" AS message');
    res.json(result[0]);
});

router.post("/seed", seedData);
router.put("/washroom/machine/:id", updateMachine);
router.get("/washroom/machine/:id", getMachine);

export default router;