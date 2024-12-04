import express from "express";
import { prisma } from "../src/utils/prisma";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

//팀 편성 API
router.post("/api/teams/cards", async (req, res, next) => {
  //유저 정보
  const { userId } = req.user;
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slotId, inventoryId } = req.body;
  
  // //선택된 선수
  // const chosenMember = await prisma.inventory.findById(inventoryId).exec();
  // //선택된 슬릇
  // const chosenSlot = await prisma.team.findOne(slotId).exec();

  // 연결
  const user = await prisma.users.findFirst({
    where: {
      userId: +userId,
    },
  });

  await prisma.$transaction(async (prisma) => {
    //중복 편성 방지
    // for (let i = 1; i < 4; i++) {
    //   let check = "inventoryId" + i;
    //조건 재설정해야함
    //   if (chosenSlot.check == chosenMember.inventoryId) {
    //     return res
    //       .status(405)
    //       .json({ message: `이미 투입되어있는 선수입니다.` });
    //   }
    // }

    //선택한 선수 포지션 결정
    await prisma.team.update({
      where: {
        userId: +user.userId,
      },
      data: {
        slotId: +inventoryId,
      },
    });

    //만약 slotId로 못 받을 경우 위에 거 말고 스위치 문으로 시도
    // switch (slotId) {
    //   case inventoryId1:
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId1: +inventoryId,
    //       },
    //     });
    //   case inventoryId2:
    //     await prisma.team.update({
    //       where: {
    //         userId: +user.userId,
    //       },
    //       data: {
    //         inventoryId2: +inventoryId,
    //       },
    //     });
    //   case inventoryId3:
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
    .json({ message: `${slotId}번 슬릇에 ${chosenMember.name} 투입` });
});
