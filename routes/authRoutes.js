const { Router } = require("express");
const { check } = require("express-validator");
const { login, googleSignin } = require("../controllers/authController");
const { validationFields } = require("../middlewares/validation-fields");

const router = Router();

router.post("/login", [
    check("email", "The email is invalid").isEmail(),
    check("password", "The password is required").not().isEmpty(),
    validationFields,
], login);

module.exports = router;