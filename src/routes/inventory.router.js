// 라이브러리 import
import express from "express";

// 모듈 import
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

// 라우터 생성.
const router = express.Router();

/* 풋살온라인 - 인벤토리 API → (JWT 인증 필요) */
router.get("/cards/inventory", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~

  // 인벤토리 조회
  const inventorys = await prisma.inventory.findMany({
    where: {
      userId: userId,
    },
    select: {
      inventoryId: true,
      cardId: true,
      upgrade: true,
      cards: {
        select: {
          name: true,
          speed: true,
          shoot: true,
          pass: true,
          sight: true,
          tackle: true,
          defence: true,
          grade: true,
        },
      },
    },
  });

  // 카드가 없다면
  if (inventorys.length === 0) {
    return next(new CustomError("카드가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 분해해서 출력에 맞춰 변형 버리자.
  const upgradedInventorys = inventorys.map((inventory) => {
    const { cards, upgrade } = inventory;

    // 업그레이드 적용
    const upgradedCards = {
      ...cards,
      speed: upgrade ? `${cards.speed} (+${upgrade})` : cards.speed,
      shoot: upgrade ? `${cards.shoot} (+${upgrade})` : cards.shoot,
      pass: upgrade ? `${cards.pass} (+${upgrade})` : cards.pass,
      sight: upgrade ? `${cards.sight} (+${upgrade})` : cards.sight,
      tackle: upgrade ? `${cards.tackle} (+${upgrade})` : cards.tackle,
      defence: upgrade ? `${cards.defence} (+${upgrade})` : cards.defence,
    };

    return {
      ...inventory,
      cards: upgradedCards,
    };
  });

  // 이상없다면 출력
  return res.status(200).json(upgradedInventorys);
});

/* 풋살온라인 - 보유 카드 상세 API → (JWT 인증 필요) */
router.get("/cards", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~
  const { name } = req.body; // 바디 정보 가져오기.

  // 인벤토리 조회
  const inventorys = await prisma.inventory.findMany({
    where: {
      userId: userId, // 유저 아이디로 필터링
      cards: {
        name: {
          equals: name, // 카드 이름으로 필터링
        },
      },
    },
    select: {
      inventoryId: true,
      cardId: true,
      upgrade: true,
      cards: {
        select: {
          name: true,
          speed: true,
          shoot: true,
          pass: true,
          sight: true,
          tackle: true,
          defence: true,
          grade: true,
        },
      },
    },
  });

  // 카드가 없다면
  if (inventorys.length === 0) {
    return next(new CustomError("검색하신 카드가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 배열을 순회하면서 업그레이드 적용
  const upgradedInventorys = inventorys.map((inventory) => {
    const { cards, upgrade } = inventory;

    const upgradedCards = {
      ...cards,
      speed: upgrade ? `${cards.speed} (+${upgrade})` : cards.speed,
      shoot: upgrade ? `${cards.shoot} (+${upgrade})` : cards.shoot,
      pass: upgrade ? `${cards.pass} (+${upgrade})` : cards.pass,
      sight: upgrade ? `${cards.sight} (+${upgrade})` : cards.sight,
      tackle: upgrade ? `${cards.tackle} (+${upgrade})` : cards.tackle,
      defence: upgrade ? `${cards.defence} (+${upgrade})` : cards.defence,
    };

    return {
      ...inventory,
      cards: upgradedCards,
    };
  });

  // 이상없다면 출력
  return res.status(200).json(upgradedInventorys);
});

/* 풋살온라인 - 카드 판매 API → (JWT 인증 필요) */
router.post("/cards/sales", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~
  const { inventoryId } = req.body; // 바디 정보 가져오기.

  let saleCash = 0; // 판매 케시

  try {
    // 조회 + 삭제 + 업데이트를 한곳에 묶자.
    const transaction = await prisma.$transaction(async (prisma) => {
      // 1. (중요) 일단 있는지 없는지 확인해보자.!!
      const inventory = await prisma.inventory.findFirst({
        where: {
          userId: userId, // 유저 아이디로 필터링
          inventoryId: inventoryId,
        },
        select: {
          cards: {
            select: {
              name: true,
              grade: true,
            },
          },
        },
      });

      if (!inventory) {
        throw new CustomError("해당 카드가 인벤토리에 없습니다.", 404);
      }

      // 2. 있다면 삭제를 진행하자.
      const deletCard = await prisma.inventory.delete({
        where: {
          userId: userId, // 유저 아이디로 필터링
          inventoryId: inventoryId, // 인벤토리Id로 필터링
        },
      });

      if (!deletCard) {
        throw new CustomError(
          "삭제할 수 없습니다. 데이터베이스를 확인해주세요.",
          404,
        );
      }

      // 3. 이제 삭제 완료 했으면 유저의 캐시를 조작하자.
      // 유저 정보를 불러온다.
      const user = await prisma.users.findFirst({
        where: {
          userId: userId, // 유저 아이디로 필터링
        },
        select: {
          id: true,
          cash: true,
        },
      });

      if (!user) {
        throw new CustomError("유저를 조회 할 수 없습니다..", 404);
      }

      // 등급별 캐시
      switch (inventory.cards.grade) {
        case "GOLD":
          saleCash = 500;
          break;
        case "SILVER":
          saleCash = 200;
          break;
        case "BRONZE":
          saleCash = 100;
          break;
        case "HIDDEN":
          saleCash = 500;
          break;
      }

      // 업데이트하자
      await prisma.users.update({
        where: {
          userId: userId, // 유저 아이디로 필터링
        },
        data: {
          cash: user.cash + saleCash,
        },
      });

      // 사용할 데이터 리턴.
      return { inventory, user };
    });

    return res
      .status(200)
      .json(
        `[${transaction.inventory.cards.name}] 선수를 팔았습니다. ${saleCash} 획득. [남은 캐시: ${transaction.user.cash + saleCash}]`,
      );
  } catch (error) {
    console.log(error); // 확인용 - 없어도 됩니다.
    return next(error);
  }
});

export default router;
