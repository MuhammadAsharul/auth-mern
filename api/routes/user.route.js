import express from "express";
import { SignUp } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", SignUp);

export default router;
