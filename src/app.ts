import cors from "cors";
import express, { type Express } from "express";
import router from "./routes";
import vehiclesRouter from "./routes/vehicles";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(vehiclesRouter);
app.use("/api", router);

export default app;
