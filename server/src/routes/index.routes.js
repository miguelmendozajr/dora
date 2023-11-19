import { Router } from 'express';
import { getMachine, seedData, setWashingTrue, setWashingFalse, setOnUseFalse, updateMachine } from "../controllers/index.controller.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [result] = await pool.query('SELECT "Demo" AS result');
    res.json(result[0]);
});

router.post("/seed", seedData);
router.put("/washroom/machine/:id", updateMachine);
router.get("/washroom/:id", getMachine);
router.post("/washroom/:id", setWashingTrue);
router.patch("/washroom/:id", setWashingFalse);
router.put("/washroom/:id", setOnUseFalse);

export default router;