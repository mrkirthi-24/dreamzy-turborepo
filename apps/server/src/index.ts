import express from "express";
import mongoose from "mongoose";
import adminRoute from "./routes/admin";
import userRoute from "./routes/user";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// const corsOptions = {
//   origin: ["http://localhost:5173", "https://modern-ecomm-app.vercel.app", "https://user-ecomm-app-v1.vercel.app"],
//   optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };

app.use(cors());

//Routes
app.use("/admin", adminRoute);
app.use("/user", userRoute);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL variable is not defined.");
}

mongoose.connect(process.env.DATABASE_URL, {
  dbName: "Ecommerce_App",
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.listen(PORT, () => {
  try {
    console.log("Server Running on PORT: " + PORT);
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error starting server:", error.message);
    }
  }
});
