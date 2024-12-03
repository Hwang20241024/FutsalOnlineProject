import express from "express";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

//팀 편성 API
router.post("/api/teams/cards", async (req, res, next) => {
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slot, inventoryId } = req.body;

  //const myteam= await team.findById(userId/*인증 어케하는지 공부한 뒤에 수정*/)

  //선택된 선수
  const chosenMember = await inventory.findById(inventoryId).exec();
  //선택된 슬릇
  const chosenSlot = await team.findOne(slot).exec();

  //선수 값이 유효하면 슬릇에 선수 삽입
  if (chosenMember) {
    chosenSlot.slot = chosenMember.cardId;
  }
  await chosenSlot.save();

  return res.status(200).json({});
});
