import express from "express"
import { login, register } from "../controller/auth.controller.js"
import { validate } from "../middlewares/validation/validate.middleware.js"
import { registerUserValidator } from "../validators/auth.validator.js"

const router = express.Router();

router.post("/register", registerUserValidator, validate, register);
router.post("/login", login);

export default router;