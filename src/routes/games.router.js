import express from "express";
import { prisma } from "../utils/prisma/index.js";
import { Prisma } from "@prisma/client";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router();

/*** 축구 게임 API */
router.post("/games", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    /*****
     *  데이터 검사
     */
    // User 정보 체크
    const myUser = await prisma.users.findFirst({ where: { userId } });

    if (!myUser)
      return res.status(404).json({
        errorMessage: "플레이어 정보가 없습니다.",
      });

    const myTeam = await prisma.team.findFirst({
      where: { userId },
    });

    // Team 정보 체크(없으면 생성 후 MSG)
    if (!myTeam) {
      await prisma.team.create({
        data: {
          userId,
        },
      });
      return res.status(401).json({
        message: "팀 구성이 이루어지지 않았습니다. 팀 구성 후 다시 시도 바랍니다.",
      });
    }

    //팀 구성 체크
    if (myTeam.inventoryId1 === null || myTeam.inventoryId2 === null || myTeam.inventoryId3 === null)
      return res.status(401).json({
        message: "팀 구성이 이루어지지 않았습니다. 팀 구성 후 다시 시도 바랍니다.",
      });

    //진행 카드 조회
    const myPlayers = await prisma.inventory.findMany({
      where: {
        userId,
        inventoryId: {
          in: [myTeam.inventoryId1, myTeam.inventoryId2, myTeam.inventoryId3],
        },
      },
      include: { cards: true },
    });

    /*****
     * 1. 매치 메이킹
     */
    // const enemyUser = {};
    // const enemyPlayers = {};

    //테스트용 조회 입니다.
    const enemyUser = await prisma.users.findFirst({ where: { userId: 2 } });
    const enemyTeam = await prisma.team.findFirst({ where: { userId: 2 } });
    const enemyPlayers = await prisma.inventory.findMany({
      where: {
        userId: 2,
        inventoryId: {
          in: [enemyTeam.inventoryId1, enemyTeam.inventoryId2, enemyTeam.inventoryId3],
        },
      },
      include: { cards: true },
    });

    /*****
     * 2. 경기 진행
     */

    /******************
     * 승패 룰
     *
     * 한팀에 10번의 공격 기회가 주어진다. (총 20번)
     * 1. 나의 inventroy1의 패스, 시야
     * 2. 나의 inventroy2의 속력, 슈팅
     * 3. 상대 inventory3의 태클, 수비
     *
     * 1 ~ 3번 전부를 성공해야 1득점
     * 무승부인 경우 다시 10번씩
     */

    let myScore = 0;
    let enemyScore = 0;
    const attackCount = 10;
    //나의 공격
    for (let i = 0; i < attackCount; i++) {
      if (isSuccess(myPlayers[0].cards.pass + myPlayers[0].upgrade, myPlayers[0].cards.sight + myPlayers[0].upgrade, "A")) {
        if (isSuccess(myPlayers[1].cards.speed + myPlayers[1].upgrade, myPlayers[1].cards.shoot + myPlayers[1].upgrade, "A")) {
          if (isSuccess(enemyPlayers[2].cards.tackle + enemyPlayers[2].upgrade, enemyPlayers[2].cards.defence + enemyPlayers[2].upgrade, "D")) {
            myScore++;
          }
        }
      }
    }
    //상대방의 공격
    for (let i = 0; i < attackCount; i++) {
      if (isSuccess(enemyPlayers[0].cards.pass + enemyPlayers[0].upgrade, enemyPlayers[0].cards.sight + enemyPlayers[0].upgrade, "A")) {
        if (isSuccess(enemyPlayers[1].cards.speed + enemyPlayers[1].upgrade, enemyPlayers[1].cards.shoot + enemyPlayers[1].upgrade, "A")) {
          if (isSuccess(myPlayers[2].cards.tackle + myPlayers[2].upgrade, myPlayers[2].cards.defence + myPlayers[2].upgrade, "D")) {
            enemyScore++;
          }
        }
      }
    }

    let messageStr = ""; //message의 String 값
    let resPointStr = ""; //resPoint의 Sring 값
    let mmr = myUser.mmr;
    let isDraw = false; //무승부 여부

    if (myScore > enemyScore) {
      messageStr = `'${myScore} - ${enemyScore}'로 승리하셨습니다.`;
    } else if (myScore < enemyScore) {
      messageStr = `'${myScore} - ${enemyScore}'로 패배하셨습니다.`;
    } else {
      messageStr = `'${myScore} - ${enemyScore}'로 무승부 입니다.`;
      isDraw = true;
      resPointStr = "0 점";
    }

    // 경기 결과 등록
    prisma.$transaction(
      async (tx) => {
        const matchresult = await prisma.matchResult.create({
          data: {
            userId1: myUser.userId,
            userId2: enemyUser.userId,
            score1: myScore,
            score2: enemyScore,
          },
        });

        if (!isDraw) {
          /*****
           * 3. 승리/패배 시 게임 점수 조정 기능
           */
          //mmr , resPointStr 변수에 결과 값 초기화 처리 해주셔야 합니다.
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    /*****
     * 4. Return
     */
    return res.status(201).json({
      message: messageStr,
      mmr: mmr,
      resPoint: resPointStr,
    });
  } catch (error) {
    next(error);
  }
});

//공격 기회 처리
const isSuccess = (status1, status2, type) => {
  let res = false;
  const randomValue = Math.random() * 100;
  if ("A" === type) {
    if (randomValue < (status1 + status2) / 2) res = true;
  } else {
    if (randomValue >= (status1 + status2) / 2) res = true;
  }

  return res;
};

export default router;
