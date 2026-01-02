import express from "express"
import { register } from "../controller/auth.controller.js"
import { validate } from "../middlewares/validate.middleware.js"
import { registerUserValidator } from "../validators/auth.validator.js"

const router = express.Router();

router.post("/register", registerUserValidator, validate, register);
// router.post("/login", loginUser);

export default router;