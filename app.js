const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const expressSession = require("express-session");
const router = require("./routes/routes");
const passport = require("passport");
const express = require("express");
const path = require("node:path");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT;

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "cats",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);
app.use(passport.session());

require("./config/passportConfig");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(router);

app.use((err, req, res, next) => {
  // next(createError(404));
  res.render("pages/error", {
    message: err.message || null,
    user: req.user || null,
  });
  console.log(err.message);
});

app.listen(PORT, () => console.log(`App listening on Post: ${PORT}`));
