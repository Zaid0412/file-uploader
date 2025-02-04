const indexControllers = require("../controllers/indexControllers");
const router = require("express").Router();

router.get("/", indexControllers.home);

module.exports = router;
