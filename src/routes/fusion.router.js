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

  const cardCombinations = [
    //히든 조합법
    { cards: [2, 3, 4].sort(), hiddenCard: 91 },
    { cards: [7, 40, 45].sort(), hiddenCard: 92 },
    { cards: [12, 49, 50].sort(), hiddenCard: 93 },
    { cards: [2, 65, 67].sort(), hiddenCard: 94 },
    { cards: [3, 37, 64].sort(), hiddenCard: 95 },
    { cards: [19, 20, 73].sort(), hiddenCard: 96 },
    { cards: [3, 33, 45].sort(), hiddenCard: 97 },
    { cards: [9, 37, 40].sort(), hiddenCard: 98 },
    { cards: [18, 36, 65].sort(), hiddenCard: 99 },
    { cards: [21, 23, 45].sort(), hiddenCard: 100 },
  ];

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

    // 장착중인지 검증
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
      inputCards.map((inventoryId) =>
        prisma.inventory.findUnique({
          where: { inventoryId },
          include: { cards: true },
        }),
      ),
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

    const sortedInputCards = [inventories[0].cardId, inventories[1].cardId, inventories[2].cardId].sort(); // 원본 배열은 유지하고 정렬된 새 배열 생성
    const combination = cardCombinations.find((combo) =>
      combo.cards.sort().every((id, index) => id === sortedInputCards[index]),
    );

    // 트랜잭션
    if (!combination) {
      await prisma.$transaction(async (prisma) => {
        try {
          const randomValue = Math.floor(Math.random() * 100) + 1;
          let grade = "";
          let bonusrate = 0;

          const materials = [inventories[0], inventories[1], inventories[2]];

          // 재료별 확률 추가
          materials.forEach((element) => {
            if (element.cards.grade === "GOLD") bonusrate += 20;
            else if (element.cards.grade === "SILVER") bonusrate += 3;
            else bonusrate += 1;
          });

          if (randomValue <= 5 + bonusrate) grade = "GOLD";
          else if (randomValue <= 30 + bonusrate) grade = "SILVER";
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
          return res.status(200).json({
            message: "카드 조합이 완료되었습니다.",
            card: randomCard,
          });
        } catch (err) {
          console.error("트랜잭션 중 오류 발생:", err);
          return res.status(500).json({ message: "서버 문제로 인해 뽑기를 진행할 수 없습니다." });
        }
      });
    // 히든 카드 조합
    } else if (combination) {
      await prisma.$transaction(async (prisma) => {
        try {
          // 히든 카드 생성
          const hiddenCard = await prisma.inventory.create({
            data: {
              userId,
              cardId: combination.hiddenCard,
            },
          });

          const hiddenCardStats = await prisma.cards.findUnique({
            where: { cardId: combination.hiddenCard },
          });

          // 기존 카드 삭제
          await Promise.all(
            inputCards.map((inventoryId) =>
              prisma.inventory.delete({ where: { inventoryId } }),
            ),
          );

          return res.status(200).json({
            message: "히든 카드가 생성되었습니다!",
            hiddenCard:hiddenCardStats,
          });
        } catch (err) {
          console.error("히든 카드 조합 중 오류 발생:", err);
          return res.status(500).json({ message: "서버 문제로 인해 히든 카드를 생성할 수 없습니다." });
        }
      });
    }
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
