import "dotenv/config";
import path from "path";
import express from "express";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(import.meta.dirname, "public")));

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;
const hostname = externalUrl ? "0.0.0.0" : "localhost";

app.get("/", async (req, res) => {
  res.render("index", {});
});

app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
