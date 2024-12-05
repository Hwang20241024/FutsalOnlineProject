import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/** 대전 기록 조회 API **/
router.get("/records", authMiddleware, async (req, res, next) => {
  //유저 정보
  const userId = req.user;

  //사용자의 대전 기록
  const records = await prisma.matchResult.findMany({
    where: { OR: [{ userId1: userId }, { userId2: userId }] },
  });

  //조회 메세지
  let recordsMessage = "";
  records.forEach((record) => {
    recordsMessage += `${record.userId1}  VS  ${record.userId2}
                      ${record.score1}  :   *${record.score2}
                      ${record.score1 > record.score2 ? record.userId1 : record.userId2}  승`;
  });
  //비겼을 때는?
  //유저1 기준으로 승 혹은 패를 출력?

  try {
    return res.status(200).json({ message: recordsMessage });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
