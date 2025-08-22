const express = require("express");
const { registerUser, loginUser } = require("../controllers/UserController");

const router = express.Router();

/**
 * SIGNUP ROUTE
 * - Frontend should POST JSON with { name, email, password, role }
 */
router.post("/signup", registerUser);

/**
 * LOGIN ROUTE
 */
router.post("/login", loginUser);

module.exports = router;