import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authHandeler from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

const router = express.Router();
// 카드 조합 API
router.post("/cards/fusion", authHandeler, async (req, res, next) => {
  const { inventoryId1, inventoryId2, inventoryId3 } = req.body;
  const userId = req.user;
  let randomCard;

  try {
    // 한개의 카드를 중복사용했는지 검증
    if (
      inventoryId1 === inventoryId2 ||
      inventoryId2 === inventoryId3 ||
      inventoryId3 === inventoryId1
    ) {
      return res
        .status(400)
        .json({ message: "하나의 카드를 중복해서 사용할 수 없습니다." });
    }

    //장착중인지 검증
    const userTeam = await prisma.team.findUnique({
      where: { userId: userId },
    });

    const equippedCards = [
      userTeam.inventoryId1,
      userTeam.inventoryId2,
      userTeam.inventoryId3,
    ];
    const inputCards = [inventoryId1, inventoryId2, inventoryId3];

    if (inputCards.some((card) => equippedCards.includes(card))) {
      return res
        .status(400)
        .json({ message: "장착된 카드를 조합할 수 없습니다." });
    }

    // 인벤토리 검증
    const inventories = await Promise.all(
      inputCards.map(inventoryId =>
        prisma.inventory.findUnique({
          where: { inventoryId },
          include: { cards: true },
        })
      )
    );

    // 카드 존재 여부 확인
    if (!inventories[0] || !inventories[1] || !inventories[2]) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    // 카드 소유권 확인
    if (
      inventories[0].userId !== userId ||
      inventories[1].userId !== userId ||
      inventories[2].userId !== userId
    ) {
      return res.status(403).json({ message: "본인의 카드가 아닙니다." });
    }

    // 트랜잭션
    await prisma.$transaction(async (prisma) => {
      const randomValue = Math.floor(Math.random() * 100) + 1;
      let grade = "";
      let bounsrate = 0;

      const materials = [inventories[0], inventories[1], inventories[2]];

      // 재료별 확률 추가
      materials.forEach((element) => {
        if (element.cards.grade === "GOLD") bounsrate += 20;
        else if (element.cards.grade === "SILVER") bounsrate += 3;
        else bounsrate += 1;
      });

      console.log(bounsrate);

      if (randomValue <= 5 + bounsrate) grade = "GOLD";
      else if (randomValue <= 30 + bounsrate) grade = "SILVER";
      else grade = "BRONZE";

      const cardCount = await prisma.cards.count({ where: { grade } });
      if (cardCount === 0) {
        throw new CustomError(
          "서버 문제로 인해 뽑기를 진행할 수 없습니다.",
          500,
        );
      }

      // 카드 랜덤 선택
      const randomSkip = Math.floor(Math.random() * cardCount);

      randomCard = await prisma.cards.findFirst({
        where: { grade },
        skip: randomSkip,
      });

      if (!randomCard) {
        throw new CustomError(
          "서버 문제로 인해 조합을 진행할 수 없습니다.",
          500,
        );
      }

      // 새 카드 추가
      await prisma.inventory.create({
        data: {
          userId: userId,
          cardId: randomCard.cardId,
        },
      });

      // 기존 카드 삭제
      await Promise.all(
        materials.map((inventory) =>
          prisma.inventory.delete({
            where: { inventoryId: inventory.inventoryId },
          }),
        ),
      );
    });

    return res.status(200).json({
      message: "카드 조합이 완료되었습니다.",
      card: randomCard,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
