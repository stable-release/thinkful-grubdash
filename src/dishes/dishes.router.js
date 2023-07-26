const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// routes for /dishes/:dishId
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);

// routes for /dishes
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;
