import express from "express";

import { recommendMovie } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.post("/recommend", recommendMovie);

export default router;
