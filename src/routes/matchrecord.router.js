import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/** 대전 기록 조회 API **/
router.get("/records", async (req, res, next) => {
  const user = await prisma.users.findFirst({ where: { userId } });
});

export default router;
