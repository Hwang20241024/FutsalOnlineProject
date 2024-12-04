// 라이브러리 import
import express from "express";

// 모듈 import
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";
import CustomError from "../utils/errors/customError.js";

// 라우터 생성.
const router = express.Router();

router.get("/cards/inventory", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~

  // 인벤토리 조회
  const inventorys = await prisma.inventory.findMany({
    where:{
      userId : userId
    },
    select: {
      inventoryId: true,
      cardId: true,
      upgrade: true,
      cards: {
        select:{
          name:true,
          speed:true,
          pass:true,
          sight:true,
          tackle:true,
          defence:true,
          grade:true,
        }
      },
    }
  });

  // 카드가 없다면
  if(inventorys.length === 0) {
    return next(new CustomError("카드가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 이상없다면 출력
  return res.status(200).json(inventorys);
});


/*보유 카드 상세*/
router.get("/cards", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~
  const {name} = req.body; // 바디 정보 가져오기.


  // 인벤토리 조회
  const inventorys = await prisma.inventory.findMany({
    where:{
      userId : userId,   // 유저 아이디로 필터링 
      cards: {
        name: {
          equals: name,  // 카드 이름으로 필터링
        },
      },
    },
    select: {
      inventoryId: true,
      cardId: true,
      upgrade: true,
      cards: {
        select:{
          name:true,
          speed:true,
          pass:true,
          sight:true,
          tackle:true,
          defence:true,
          grade:true,
        }
      },
    }
  });

  // 카드가 없다면
  if(inventorys.length === 0) {
    return next(new CustomError("검색하신 카드가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 이상없다면 출력
  return res.status(200).json(inventorys);
  
})

export default router;
