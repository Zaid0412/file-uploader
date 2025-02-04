const indexControllers = {
  home: (req, res, next) => {
    try {
      res.render("pages/index");
    } catch (error) {
      next(error);
    }
  },
};

module.exports = indexControllers;
