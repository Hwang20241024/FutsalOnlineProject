// 라이브러리 import
import express from "express";

// 모듈 import
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

// 라우터 생성.
const router = express.Router();

/** 풋살온라인 - 랭킹 API → (JWT 인증 필요)  **/
router.get("/ranks", authMiddleware, async (req, res, next) => {
  // 0. 사용할 변수 선언.
  const limit = 10;

  // 1. 유저 정보를 가져온다.
  const users = await prisma.users.findMany({
    select: {
      id: true, // id 컬럼만 선택
      mmr: true, // mmr 컬럼만 선택
    },
    orderBy: [
      {
        mmr: "desc", // mmr을 내림차순으로 정렬
      },
      {
        userId: "asc", // 만약에 mmr이 똑같으면 가입 순서대로.
      },
    ],
    take: limit, // 결과를 limit로 제한.
  });

  // 2. 유저가 없을때 예외 설정.
  if (users.length === 0) {
    return next(new CustomError("유저가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 3. 순위를 추가한다. 
  const rankedUsers = users.map((user, index) => ({
    ranking: index + 1, // 인덱스가 0부터 시작, + 1을 해야한다.
    ...user,
  }));

  // 4. 출력.
  return res.status(200).json({
    message: `유저 리스트 조회 완료`,
    data: rankedUsers,
  });
});

export default router;
