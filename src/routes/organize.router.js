import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

//팀 편성 API
router.post("/api/teams/cards", authMiddleware, async (req, res, next) => {
  //유저 정보
  const { userId } = req.user;
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slotId, inventoryId } = req.body;

  //사용자의 팀
  const chosenSlot = await prisma.team.findFirst({
    where: { userId },
  });
  //선택된 선수
  const chosenMember = await prisma.inventory.findFirst({
    where: { inventoryId },
  });

  //선택된 선수
  //const chosenMember = await prisma.inventory.findById(inventoryId).exec();
  //선택된 슬릇
  // const chosenSlot = await prisma.team.findOne(slotId).exec();

  await prisma.$transaction(async (prisma) => {
    //중복 편성 방지
    for (let i = 1; i < 4; i++) {
      //조건 맞는지 확인해야함
      if (
        chosenSlot.inventoryId1 == chosenMember.inventoryId ||
        chosenSlot.inventoryId2 == chosenMember.inventoryId ||
        chosenSlot.inventoryId3 == chosenMember.inventoryId
      ) {
        return res
          .status(405)
          .json({ message: `이미 투입되어있는 선수입니다.` });
      }
    }

    //선택한 선수 포지션 결정
    await prisma.team.update({
      where: {
        userId,
      },
      data: {
        slotId: +inventoryId,
      },
    });

    //만약 slotId로 못 받는 경우 위에 거 말고 스위치 문으로 시도
    // switch (slotId) {
    //   case "inventoryId1":
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId1: +inventoryId,
    //       },
    //     });
    //   case "inventoryId2":
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId2: +inventoryId,
    //       },
    //     });
    //   case "inventoryId3":
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId3: +inventoryId,
    //       },
    //     });
    //   default:
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId1: +inventoryId,
    //       },
    //     });
    // }
  });

  return res
    .status(200)
    .json({ message: `${slotId}번 슬릇에 ${chosenMember.name} 선수가 합류하였습니다.` });
});

export default router;
