import { Router } from 'express';
import { seedData, updateMachine, dropTables, createTables, createCycle, getMachine, saveUser, cancelCycle, updateCycle } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Server is working and connected to database" AS message');
    res.json(result[0]);
});

router.post("/seed", seedData);
router.post("/drop", dropTables);
router.post("/create", createTables);
router.post("/user", saveUser);
router.put("/washroom/machine/:id", updateMachine);
router.post("/washroom/machine/:id/cycle", createCycle);
router.put("/washroom/machine/:id/cycle", updateCycle);
router.post("/washroom/cycle", cancelCycle);
router.get("/washroom/machine/:id", getMachine);

export default router;