import { Router } from 'express';
import { getWaitList, seedData, updateMachine, dropTables, createTables, createCycle } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Server is working and connected to database" AS message');
    res.json(result[0]);
});

router.post("/seed", seedData);
router.post("/drop", dropTables);
router.post("/create", createTables);
router.put("/washroom/machine/:id", updateMachine);
router.post("/washroom/machine/:id/cycle", createCycle);
router.get("/washroom/machine/:id/waitlist", getWaitList);

export default router;