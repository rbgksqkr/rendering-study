const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use("/browser", express.static(path.join(__dirname, "../browser"))); // 정적 파일 경로 설정

app.get("/", (_, res) => {
  const filePath = path.join(__dirname, "../index.html");
  res.sendFile(filePath);
});

app.use((_, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
