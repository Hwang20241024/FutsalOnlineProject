import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/** 대전 기록 조회 API **/
router.get("/records", authMiddleware, async (req, res, next) => {
  //유저 정보
  const userId = req.user;

  //사용자의 대전 기록
  const records1 = await prisma.matchResult.findMany({
    where: { OR: [{ userId1: userId }, { userId2: userId }] },
  });

  try {
    return res.status(200).json(records1);
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
