import cors from "cors";
import express, { type Express } from "express";
import router from "./routes";

const app: Express = express();

const configuredOrigins = process.env["CORS_ORIGIN"]
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
