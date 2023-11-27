import express from "express";
import indexRoutes from "./routes/index.routes.js";
import cors from 'cors'; 
const app = express();

app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: "*",
}));

app.use(express.json());

app.use(indexRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

export default app;