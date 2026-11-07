import "dotenv/config";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(import.meta.dirname, "public")));

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;
const hostname = externalUrl ? "0.0.0.0" : "localhost";

const cities = [
  "Zagreb",
  "Split",
  "Rijeka",
  "Osijek",
  "Zadar",
  "Pula",
  "Dubrovnik",
];

app.get("/", async (req, res) => {
  const xssEnabled = req.cookies?.xssEnabled === "true";
  res.cookie("session", crypto.randomUUID());
  res.render("index", { xssEnabled: xssEnabled });
});

app.get("/search", async (req, res) => {
  const xssEnabled = req.cookies?.xssEnabled === "true";

  const query = req.query.input;
  if (typeof query !== "string") {
    res.sendStatus(400);
    return;
  }

  const results = cities.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase()),
  );

  res.render("index", {
    xssEnabled: xssEnabled,
    query: query,
    results: results,
  });
});

app.post("/xss", async (req, res) => {
  const xssEnabled: unknown = req.body?.xssEnabled;
  res.cookie("xssEnabled", xssEnabled === "on");

  res.redirect("/");
});

app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
