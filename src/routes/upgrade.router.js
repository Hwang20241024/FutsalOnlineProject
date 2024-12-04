import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/index.js";
import authHandeler from "../middlewares/authHandler.js";

const router = express.Router();
//카드 강화 API
router.post("/cards/upgrade", authHandeler, async (req, res, next) => {
  const { inventoryId1, inventoryId2 } = req.body;
  const  userId  = req.user;

  try {
    //인증미들웨어 userId로  각각inventoryId1,inventoryId2가 본인 카드인지 검증 아니라면 오류출력
    const inventory1 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId1 },
    });
    const inventory2 = await prisma.inventory.findUnique({
      where: { inventoryId: inventoryId2 },
    });

    if (!inventory1 || !inventory2) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    if (inventory1.userId !== userId || inventory2.userId !== userId) {
      return res.status(403).json({ message: "본인의 카드가 아닙니다." });
    }

    //각각inventoryId1,inventoryId2에 해당하는 cardId가 같은 카드인지 확인 아니라면 오류 출력
    if (inventory1.cardId !== inventory2.cardId) {
      return res
        .status(400)
        .json({ message: "같은 종류의 카드만 강화할 수 있습니다." });
    }

    //본인 카드면서 같은 카드면 강화 진행 트랜잭션으로 진행
    await prisma.$transaction(async (prisma) => {
      //두 카드의 upgrade수치 합치기 강화 최대 10
      let totalUpgrade = Math.min(inventory1.upgrade + inventory2.upgrade, 10);
      //강화돼서 스탯이 추가된 새 카드 유저 인벤토리에 생성
      if(totalUpgrade === 0) totalUpgrade = 1;

      const upgradedCard = await prisma.inventory.create({
        data: {
          userId,
          cardId: inventory1.cardId,
          upgrade: totalUpgrade,
        },
      });
      //재료인 2개카드 삭제
      await prisma.inventory.delete({
        where: {
          inventoryId: inventoryId1,
        },
      });

      await prisma.inventory.delete({
        where: {
          inventoryId: inventoryId2,
        },
      });
    });

    return res.status(200).json({ message: "카드 강화가 완료되었습니다." });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
