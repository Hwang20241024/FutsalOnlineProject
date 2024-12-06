import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authHandeler from "../../middlewares/authHandler.js";

const router = express.Router();

// 카드 강화 API
router.post("/upgrade", authHandeler, async (req, res, next) => {
  const { inventoryId1, inventoryId2 } = req.body;
  const userId = req.user;

  try {
    // 장착되어있는지 검증
    // 한개의 카드를 중복사용했는지 검증
    if (inventoryId1 === inventoryId2) {
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
    const inputCards = [inventoryId1, inventoryId2];

    if (inputCards.some((card) => equippedCards.includes(card))) {
      return res
        .status(400)
        .json({ message: "장착된 카드를 강화할 수 없습니다." });
    }

    // 인벤토리 검증
    const inventories = await Promise.all(
      inputCards.map((inventoryId) =>
        prisma.inventory.findUnique({
          where: { inventoryId },
          include: { cards: true },
        }),
      ),
    );

    // 카드 존재 여부 확인
    if (!inventories[0] || !inventories[1]) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    // 카드 소유권 확인
    if (inventories[0].userId !== userId || inventories[1].userId !== userId) {
      return res.status(403).json({ message: "본인의 카드가 아닙니다." });
    }

    // 같은 카드인지 확인
    if (inventories[0].cardId !== inventories[1].cardId) {
      return res
        .status(400)
        .json({ message: "같은 종류의 카드만 강화할 수 있습니다." });
    }

    // 강화 진행
    const upgradedCard = await prisma.$transaction(async (prisma) => {
      // 두 카드의 upgrade 합산 (최대 10)
      let totalUpgrade = Math.min(
        inventories[0].upgrade + inventories[1].upgrade,
        10,
      );

      if (totalUpgrade === 0) totalUpgrade = 1;
      else if (inventories[0].upgrade === 0 || inventories[1].upgrade === 0) {
        totalUpgrade += 1;
      }

      // 강화된 새 카드 생성
      const newCard = await prisma.inventory.create({
        data: {
          userId,
          cardId: inventories[0].cardId,
          upgrade: totalUpgrade,
        },
        include: { cards: true },
      });

      // 재료 카드 삭제


      await Promise.all(
        inputCards.map((inventory) =>
          prisma.inventory.delete({
            where: {inventoryId: inventory},
          }),
        ),
      );

      return newCard;
    });

    // 결과 반환
    return res.status(200).json({
      message: "카드 강화가 완료되었습니다.",
      cardInfo: {
        cardId: upgradedCard.cards.cardId,
        name: upgradedCard.cards.name,
        speed: `${upgradedCard.cards.speed + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
        shoot: `${upgradedCard.cards.shoot + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
        pass: `${upgradedCard.cards.pass + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
        sight: `${upgradedCard.cards.sight + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
        tackle: `${upgradedCard.cards.tackle + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
        defence: `${upgradedCard.cards.defence + upgradedCard.upgrade} (+${upgradedCard.upgrade})`,
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
