import express from "express";
import route from "./api/routes";

const app = express();

app.use("/api/v1", route);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
