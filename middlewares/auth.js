module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next(new Error("User is not authenticated!"));
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/library");
    next();
  } else {
    next();
  }
};

// module.exports.isAdmin = (req, res, next) => {
//   if (req.isAuthenticated() && req.user.admin == '1') {
//     next();
//   } else {
//     next(new Error('User is not authorized!'));
//   }
// };
