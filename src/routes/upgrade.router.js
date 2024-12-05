import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authHandeler from "../middlewares/authHandler.js";

const router = express.Router();

// 카드 강화 API
router.post("/cards/upgrade", authHandeler, async (req, res, next) => {
  const { inventoryId1, inventoryId2 } = req.body;
  const userId = req.user;

  try {
    // inventoryId1, inventoryId2가 본인 카드인지 검증
    const inventory1 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId1 },
      include: { cards: true }, // 카드 정보를 포함
    });
    const inventory2 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId2 },
      include: { cards: true },
    });

    if (!inventory1 || !inventory2) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    if (inventory1.userId !== userId || inventory2.userId !== userId) {
      return res.status(403).json({ message: "본인의 카드가 아닙니다." });
    }

    // 같은 카드인지 확인
    if (inventory1.cardId !== inventory2.cardId) {
      return res
        .status(400)
        .json({ message: "같은 종류의 카드만 강화할 수 있습니다." });
    }

    // 강화 진행
    const upgradedCard = await prisma.$transaction(async (prisma) => {
      // 두 카드의 upgrade 합산 (최대 10)
      let totalUpgrade = Math.min(
        inventory1.upgrade + inventory2.upgrade,
        10
      );

      if (totalUpgrade === 0) totalUpgrade = 1;
      else if (inventory1.upgrade === 0 || inventory2.upgrade === 0) {
        totalUpgrade += 1;
      }

      // 강화된 새 카드 생성
      const newCard = await prisma.inventory.create({
        data: {
          userId,
          cardId: inventory1.cardId,
          upgrade: totalUpgrade,
        },
        include: { cards: true },
      });

      // 재료 카드 삭제
      await prisma.inventory.delete({
        where: { inventoryId: inventoryId1 },
      });

      await prisma.inventory.delete({
        where: { inventoryId: inventoryId2 },
      });

      return newCard;
    });

    // 결과 반환
    return res.status(200).json({
      message: "카드 강화가 완료되었습니다.",
      cardInfo: {
        cardId: upgradedCard.cards.cardId,
        name: upgradedCard.cards.name,
        speed: `${upgradedCard.cards.speed} (+${upgradedCard.upgrade})`,
        shoot: `${upgradedCard.cards.shoot} (+${upgradedCard.upgrade})`,
        pass: `${upgradedCard.cards.pass} (+${upgradedCard.upgrade})`,
        sight: `${upgradedCard.cards.sight} (+${upgradedCard.upgrade})`,
        tackle: `${upgradedCard.cards.tackle} (+${upgradedCard.upgrade})`,
        defence: `${upgradedCard.cards.defence} (+${upgradedCard.upgrade})`,
        grade: upgradedCard.cards.grade,
      },
      upgradedCard: {
        upgrade: upgradedCard.upgrade,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
