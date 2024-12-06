import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/**팀 편성 API **/
router.post("/teams/cards", authMiddleware, async (req, res, next) => {
  //유저 정보
  const userId = req.user;
  
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slotId, inventoryId } = req.body;

  // 슬롯 검증 
  if(slotId !== "inventoryId1" &&  slotId !== "inventoryId2" && slotId !== "inventoryId3") {
    return next(new CustomError("슬롯을 다시 입력해주세요.", 400));
  }

  // 사용자의 팀
  const chosenSlot = await prisma.team.findFirst({
    where: { userId },
  });

  if (!chosenSlot) {
    return next(new CustomError("선택한 슬롯이 없습니다.", 404));
  }

  //선택된 선수
  const chosenMember = await prisma.inventory.findFirst({
    where: { inventoryId },
  });

  if (!chosenMember) {
    return next(new CustomError("선택한 선수가 없습니다.", 404));
  }


  //선택된 선수의 이름
  const chosenMemberName = await prisma.cards.findFirst({
    where: { cardId: chosenMember.cardId },
  });

  if (!chosenMemberName) {
    return next(new CustomError("선택하신 선수의 데이터는 존재하지 않습니다.", 404));
  }


  //미소지 카드 편성 방지
  if (chosenMember.userId !== userId) {
    return res.status(403).json({ message: `보유하신 선수 카드가 아닙니다.` });
  }



  //중복 편성 방지
  if (
    chosenSlot.inventoryId1 === chosenMember.inventoryId ||
    chosenSlot.inventoryId2 === chosenMember.inventoryId ||
    chosenSlot.inventoryId3 === chosenMember.inventoryId
  ) {
    return res.status(400).json({ message: `이미 투입되어있는 선수입니다.` });
  }

  try {
    await prisma.$transaction(async (prisma) => {
      //선택한 선수 포지션 결정
      switch (slotId) {
        case "inventoryId1":
          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId1: +inventoryId,
            },
          });
          break;
        case "inventoryId2":
          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId2: +inventoryId,
            },
          });
          break;
        case "inventoryId3":
          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId3: +inventoryId,
            },
          });
          break;
        default:
          throw new CustomError( "슬롯을 제대로 입력하세요", 400, );
      }
    });

    return res.status(200).json({
      message: `${slotId.charAt(11)}번 포지션에 ${chosenMemberName.name} 선수가 합류하였습니다.`,
    });
  } catch (error) {
    return next(error);
  }
});

/**팀 해체 API **/
router.post("/teams/release", authMiddleware, async (req, res, next) => {
  //유저 정보
  const userId = req.user;
  //슬릇 선택, 보유 중인 선수 카드 중 선택
  const { slotId } = req.body;

  // 있는지 확인 
  const slot = await prisma.team.findFirst({
    where: { userId },
    select: {
      inventoryId1: true,
      inventoryId2: true,
      inventoryId3: true,
    }
  });

  if(!slot) {
    return next(new CustomError("teams 가 없습니다.", 400));
  }
  

  try {
    await prisma.$transaction(async (prisma) => {
      //선택한 선수 포지션 결정
      switch (slotId) {
        case "inventoryId1":
          if(slot.inventoryId1 === null) {
            throw new CustomError("이미 비어있는 슬롯입니다." , 400, );
          }

          // 있다면 업데이트
          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId1: null,
            },
          });
          break;
        case "inventoryId2":
          if(slot.inventoryId2 === null) {
            throw new CustomError("이미 비어있는 슬롯입니다." , 400, );
          }

          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId2: null,
            },
          });
          break;
        case "inventoryId3":
          if(slot.inventoryId3 === null) {
            throw new CustomError("이미 비어있는 슬롯입니다." , 400, );
          }

          await prisma.team.update({
            where: {
              userId,
            },
            data: {
              inventoryId3: null,
            },
          });
          break;
        default:
          throw new CustomError( "슬롯을 제대로 입력하세요", 400, );
      }
    });

    return res.status(200).json({
      message: `${slotId.charAt(11)}번 포지션을 초기화하였습니다.`,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
