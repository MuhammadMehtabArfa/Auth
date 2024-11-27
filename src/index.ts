import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
dotenv.config();
import router from "./routes/user_routes";

const app = express();


app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});


const PORT = process.env.PORT || 5000;


connectDB();
app.use("/", router);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  })
