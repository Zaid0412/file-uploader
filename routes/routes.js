const indexControllers = require("../controllers/indexControllers");
const userControllers = require("../controllers/userControllers");
const fileControllers = require("../controllers/fileControllers");
const { registerValidation } = require("../middlewares/validation");
const { isAuth, isLoggedIn } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const router = require("express").Router();

// POST ROUTES
router.post("/login", userControllers.login.post);
router.post("/register", registerValidation, userControllers.register.post);
router.post(
  "/:id/upload",
  isAuth,
  upload.single("image"),
  fileControllers.upload.post,
);
router.post("/newFolder", isAuth, fileControllers.createFolder.post);

// GET ROUTES
router.get("/", isLoggedIn, indexControllers.home);
router.get("/login", userControllers.login.get);
router.get("/register", userControllers.register.get);
router.get("/logout", userControllers.logout);
router.get("/library", isAuth, indexControllers.library);
router.get("/folder/:id", isAuth, fileControllers.folder.get);
router.get("/folder/:id/delete", isAuth, fileControllers.deleteFile.get);

module.exports = router;
