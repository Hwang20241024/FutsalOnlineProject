// 라이브러리 import
import express from "express";
import dotenv from "dotenv";

// 모듈 import
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

// 라우터 생성.
const router = express.Router();

// dotenv 사용.
dotenv.config();

/** 풋살온라인 - 뽑기 API → (JWT 인증 필요)  **/
router.post("/cards/gacha", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~
  const { count } = req.body; // 바디에서 정보 가져오세요~

  const gachaCash = 1000; // 캐시 재화
  const gachaCeiling = 10; // 뽑기 천장.

  // 연결.
  const user = await prisma.users.findFirst({
    where: {
      userId: userId,
    },
  });

  //// 한꺼번에 적용하기 위한 변수.
  let gachaCount = user.stack; // 뽑기 카운터.
  let userCash = user.cash; // 현재 캐시.
  let cardList = []; // 내보낼 카드 목록.

  try {
    // 예외 조건 : 카운터가 무조건 정수이거나 0 이상이여야함.
    if (!Number.isInteger(count) || count === 0 || count > 10) {
      throw new CustomError(
        "뽑기를 진행하기위한 횟수를 제대로 입력하세요.",
        400,
      );
    }

    // 예외 조건 : 캐시가 없는 경우.
    if (userCash < gachaCash * count) {
      throw new CustomError(
        "뽑기를 진행하기 위한 캐시가 부족합니다. 캐시를 충전한 후 다시 시도해주세요.",
        400,
      );
    }

    // transaction
    await prisma.$transaction(async (prisma) => {
      let totalCount = count;

      while (totalCount > 0) {
        //// 1. 뽑기 등급 결정.
        const randomValue = Math.random(); // 0 이상 1 미만의 랜덤 값
        let grade = ""; // 등급

        // 1-1. 천장인지 아닌지 확인.
        if (user.stack < gachaCeiling) {
          // 1-2. 천장이 아니라면 등급 설정.
          if (randomValue <= 0.1) {
            grade = "GOLD"; // 10프로 확률
          } else if (randomValue <= 0.3) {
            grade = "SILVER"; // 30프로 확률
          } else {
            grade = "BRONZE"; // 60프로 확률
          }
        } else {
          // 1-4. 천장이라면 최고등급으로..
          grade = "GOLD";

          // 1-5. 스택 초기화.
          gachaCount = 0;
        }

        //// 2. 해당 등급 카드 개수 가져오기
        const cardCount = await prisma.cards.count({
          where: {
            grade: grade,
          },
        });

        // 예외 조건 : 카드가 없는경우.
        if (cardCount === 0) {
          throw new CustomError(
            "서버 문제로 인해 뽑기를 진행할 수 없습니다. 잠시 후 다시 시도해 주세요.",
            500,
          );
        }

        // 3-1. 찾은 개수로 랜덤을 돌린다 (만약에 없다면 에러)
        const randomSkip = Math.floor(Math.random() * cardCount);

        // 3-2. 랜덤으로 구한 케릭터를 가져온다.
        const randomCard = await prisma.cards.findMany({
          where: {
            grade: grade,
          },
          skip: randomSkip, // 랜덤으로 건너뛴 만큼 가져옴
          take: 1, // 한 개만 가져오기
        });

        if (!randomCard || randomCard.length === 0) {
          throw new CustomError(
            "서버 문제로 인해 뽑기를 진행할 수 없습니다. 잠시 후 다시 시도해 주세요.",
            500,
          );
        }

        // 3-3. 뽑은 카드를 모아둔다.
        cardList.push(randomCard[0]);

        // 3-4. 케시와 스택을 업데이트한다.
        userCash -= gachaCash;
        gachaCount++;

        //// 4. 인벤토리에 카드추가
        await prisma.inventory.create({
          data: {
            userId: userId,
            cardId: randomCard[0].cardId,
          },
        });

        //// 5. 스택과 캐시 업데이트
        await prisma.users.update({
          where: {
            userId: userId,
          },
          data: {
            stack: gachaCount,
            cash: userCash,
          },
        });
        totalCount--;
      }
    });

    console.log(cardList);
    // 출력
    return res.status(200).json({
      message: `[${count}]번 뽑으셨습니다. [남은 캐시 : ${userCash}]`,
      cards: cardList,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
