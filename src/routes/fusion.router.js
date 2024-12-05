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
    if (inventoryId1 === inventoryId2 || inventoryId2 === inventoryId3 || inventoryId3 === inventoryId1) {
      return res.status(400).json({ message: "하나의 카드를 중복해서 사용할 수 없습니다." });
    }

    // 인벤토리 검증
    const inventory1 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId1 },
      include: { cards: true },
    });
    const inventory2 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId2 },
      include: { cards: true },
    });
    const inventory3 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId3 },
      include: { cards: true },
    });

    // 카드 존재 여부 확인
    if (!inventory1 || !inventory2 || !inventory3) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    // 카드 소유권 확인
    if (inventory1.userId !== userId || inventory2.userId !== userId || inventory3.userId !== userId) {
      return res.status(403).json({ message: "본인의 카드가 아닙니다." });
    }

    // 트랜잭션
    await prisma.$transaction(async (prisma) => {
      const randomValue = Math.floor(Math.random() * 100) + 1;
      let grade = "";
      let bounsrate = 0;

      const materials = [inventory1, inventory2, inventory3];

      // 재료별 확률 추가
      materials.forEach((element) => {
        if (element.cards.grade === "GOLD") bounsrate += 20;
        else if (element.cards.grade === "SILVER") bounsrate += 3;
        else bounsrate += 1;
      });

      if (randomValue <= 5 + bounsrate) grade = "GOLD";
      else if (randomValue <= 30 + bounsrate) grade = "SILVER";
      else grade = "BRONZE";

      const cardCount = await prisma.cards.count({ where: { grade } });
      if (cardCount === 0) {
        throw new CustomError("서버 문제로 인해 뽑기를 진행할 수 없습니다.", 500);
      }

      // 카드 랜덤 선택
      const randomSkip = Math.floor(Math.random() * cardCount);

      randomCard = await prisma.cards.findFirst({
        where: { grade },
        skip: randomSkip,
      });

      if (!randomCard) {
        throw new CustomError("서버 문제로 인해 조합을 진행할 수 없습니다.", 500);
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
          prisma.inventory.delete({ where: { inventoryId: inventory.inventoryId } })
        )
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
