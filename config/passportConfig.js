const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function verifyCallback(username, password, done) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return done(null, false, { message: "Username Not Found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect Password" });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

passport.use(new LocalStrategy(verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // const user = await db.getUserFromId(id);
    const user = await prisma.user.findUnique({ where: { id } });

    done(null, user);
  } catch (error) {
    done(error);
  }
});
