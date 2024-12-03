import express from "express";
import { prisma } from "../src/utils/prisma";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

//팀 편성 API
router.post("/api/teams/cards", async (req, res, next) => {
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slotId, inventoryId } = req.body;

  ///*인증 어케하는지 공부한 뒤에 수정*/
  //const myteam= await prisma.team.findById(userId).exec();

  //선택된 선수
  const chosenMember = await prisma.inventory.findById(inventoryId).exec();
  //선택된 슬릇
  const chosenSlot = await prisma.team.findOne(slotId).exec();

  //1? 2? 3?
  //선수 값이 유효하면 슬릇에 선수 삽입
  switch (slotId) {
    case inventoryId1:
      if (chosenMember) {
        chosenSlot.inventoryId1 = chosenMember.inventoryId;
      }
      await chosenSlot.save();
    case inventoryId2:
      if (chosenMember) {
        chosenSlot.inventoryId2 = chosenMember.inventoryId;
      }
      await chosenSlot.save();
    case inventoryId3:
      if (chosenMember) {
        chosenSlot.inventoryId3 = chosenMember.inventoryId;
      }
      await chosenSlot.save();
    default:
  }

  //근데 이대로면 그냥
  // if (chosenMember) {
  //   chosenSlot.slotId = chosenMember.inventoryId;
  // }
  // await chosenSlot.save();
  //굳이 스위치문 안 쓰고 이렇게 해도 되겠는데?

  return res.status(200).json({});
});
