const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { error } = require("console");
const prisma = new PrismaClient();

const userControllers = {
  login: {
    get: (req, res) => {
      res.render("pages/login", { user: req.user || null });
    },
    post: passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    }),
  },
  register: {
    get: (req, res) => {
      res.render("pages/register", { user: null, errors: null });
    },
    post: async (req, res, next) => {
      try {
        const errors = validationResult(req);
        console.log(errors.array());
        if (!errors.isEmpty()) {
          res.render("pages/register", {
            user: req.user || null,
            errors: errors.array() || null,
          });
          console.log(errors);
        } else {
          const { username, password } = req.body;
          const formattedUsername = username.replaceAll(" ", "");
          const hashedPassword = await bcrypt.hash(password, 10);

          const user = await prisma.user.create({
            data: {
              username: formattedUsername,
              password: hashedPassword,
            },
          });
          res.redirect("/login");
        }
      } catch (error) {
        next(error);
      }
    },
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
};

module.exports = userControllers;
