import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/** 대전 기록 조회 API **/
router.get("/records", authMiddleware, async (req, res, next) => {
  //유저 정보
  const { userId } = req.user;

  //사용자의 대전 기록
  const records1 = await prisma.matchresult.findMany({
    where: { OR: [{ userId1: userId }, { userId2: userId }] },
  });
  //   //or 같은 연산자로 동시에 묶는 방법은?
  //   const records2 = await prisma.matchresult.findMany({
  //     where: {
  //       userId2: userId,
  //     },
  //   });

  return res.status(200).json({
    message: `전적
    ${records1}`,
  });
});

export default router;
