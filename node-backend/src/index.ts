import express from "express";
import cors from "cors";
import route from "./api/routes";

const app = express();

app.use(cors());
app.use("/api/v1", route);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
