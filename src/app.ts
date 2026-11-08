import * as auth from "./auth-middleware.ts";
import "dotenv/config";
import path from "path";
import express from "express";
import { cities } from "./cities.ts";
import { users } from "./users.ts";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "pug");

auth.initCookieAuth(app);

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;
const hostname = externalUrl ? "0.0.0.0" : "localhost";

app.get("/", (req, res) => {
  res.cookie("session", crypto.randomUUID());
  const xssEnabled = req.cookies?.xssEnabled === "true";
  const bacEnabled = req.cookies?.bacEnabled === "true";

  const user = users.find((u) => u.username === req.user?.username);
  const otherUser = users.find((u) => u.username !== req.user?.username);

  res.render("index", {
    xssEnabled: xssEnabled,
    bacEnabled: bacEnabled,
    user: user,
    otherUser: otherUser,
  });
});

app.get("/search", (req, res) => {
  const xssEnabled = req.cookies?.xssEnabled === "true";
  const bacEnabled = req.cookies?.bacEnabled === "true";

  const query = req.query.input;
  if (typeof query !== "string") {
    res.sendStatus(400);
    return;
  }

  const results = cities.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase()),
  );

  const user = users.find((u) => u.username === req.user?.username);
  const otherUser = users.find((u) => u.username !== req.user?.username);

  res.render("index", {
    xssEnabled: xssEnabled,
    bacEnabled: bacEnabled,
    query: query,
    results: results,
    user: user,
    otherUser: otherUser,
  });
});

app.post("/xss", (req, res) => {
  res.cookie("xssEnabled", req.body?.xssEnabled === "on");

  res.redirect("/");
});

app.post("/bac", (req, res) => {
  res.cookie("bacEnabled", req.body?.bacEnabled === "on");

  res.redirect("/");
});

app.get<{ id: string }>(
  "/profile/:id",
  auth.requiresAuthentication,
  (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find((u) => u.id === userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    const bacEnabled = req.cookies?.bacEnabled === "true";
    if (!bacEnabled && req.user?.username !== user.username) {
      res.sendStatus(403);
      return;
    }
    res.render("profile", { user });
  },
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) {
    res.render("login");
  } else {
    auth.signInUser(res, username);
    res.redirect("/");
  }
});

app.post("/logout", (req, res) => {
  auth.signOutUser(res);
  res.redirect("/");
});

app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
