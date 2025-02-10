const indexControllers = require("../controllers/indexControllers");
const userControllers = require("../controllers/userControllers");
const fileControllers = require("../controllers/fileControllers");
const { registerValidation } = require("../middlewares/validation");
const upload = require("../middlewares/multer");
const router = require("express").Router();

// POST ROUTES
router.post("/login", userControllers.login.post);
router.post("/register", registerValidation, userControllers.register.post);
router.post("/upload", upload.single("image"), fileControllers.upload.post);
router.post("/newFolder", fileControllers.createFolder.post);

// GET ROUTES
router.get("/", indexControllers.home);
router.get("/login", userControllers.login.get);
router.get("/register", userControllers.register.get);
router.get("/logout", userControllers.logout);
router.get("/library", indexControllers.library);
router.get("/folder/delete/:id", fileControllers.deleteFile.get);

module.exports = router;
