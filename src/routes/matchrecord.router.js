import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/** 대전 기록 조회 API **/
router.get("/records", authMiddleware, async (req, res, next) => {
  //유저 정보
  const userId = req.user;

  try {
    //사용자의 대전 기록
    // const records = await prisma.matchResult.findMany({
    //   where: { OR: [{ userId1: userId }, { userId2: userId }] },
    //   orderBy: {
    //     matchId: "desc",
    //   },
    //   take: 30,
    // });

    // matchResult 조회
    const records = await prisma.matchResult.findMany({
      where: { OR: [{ userId1: userId }, { userId2: userId }] },
      include: {
        user1: { select: { userId: true, id: true } },
        user2: { select: { userId: true, id: true } },
      },
      orderBy: {
        matchId: "desc",
      },
      take: 30,
    });

    // matchResult 검증
    if (!records) {
      throw new CustomError("records가 없습니다.", 500);
    }

    // 변수
    let gameRecords = []; // 게임 결과를 담을 배열.
    let gameRecordCount = 1; // 번호 매기는 용도.

    for (let value of records) {
      let result = "";

      // 1번네임
      // let name = await prisma.users.findFirst({
      //   where: {
      //     userId: value.userId1,
      //   },
      //   select: {
      //     userId: true,
      //     id: true,
      //   },
      // });

      // 1번네임 검증
      // if (!name) {
      //   throw new CustomError("1번 유저를 찾을수 업습니다.", 500);
      // }

      // 2번네임
      // let name2 = await prisma.users.findFirst({
      //   where: {
      //     userId: value.userId2,
      //   },
      //   select: {
      //     userId: true,
      //     id: true,
      //   },
      // });

      // 2번네임 검증
      // if (!name2) {
      //   throw new CustomError("2번 유저를 찾을수 업습니다.", 500);
      // }

      // 상대방이 본인과 싸웠을때 경우.
      if (value.user2.userId === userId) {
        result = determineMatchOutcome(value.score2, value.score1);
      } else {
        // 아니면 무조건 1번이 본인임..
        result = determineMatchOutcome(value.score1, value.score2);
      }

      // user1이름 (3) vs user2이름  (4) - 패배
      gameRecords.push(
        `${gameRecordCount++}. ${value.user1.id} (${value.score1}) vs ${value.user2.id} (${value.score2}) - ${result}`,
      );
    }
    return res.status(200).json(gameRecords);
  } catch (error) {
    return next(error);
  }
});

// 경기 결과 결정 함수 - 기준은 첫번째 매게변수.
function determineMatchOutcome(score1, score2) {
  let str = "";
  // 스코어 계산
  if (score1 === score2) {
    str = "무승부";
  } else if (score1 < score2) {
    str = "패배";
  } else if (score1 > score2) {
    str = "승리";
  }

  return str;
}

export default router;
