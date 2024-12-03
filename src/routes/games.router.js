import express from "express";
import { prisma } from "../utils/prisma/index.js";
import Prisma from "@prisma/client";
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
        message:
          "팀 구성이 이루어지지 않았습니다. 팀 구성 후 다시 시도 바랍니다.",
      });
    }

    //팀 구성 체크
    if (
      myTeam.inventoryId1 === null ||
      myTeam.inventoryId2 === null ||
      myTeam.inventoryId3 === null
    )
      return res.status(401).json({
        message:
          "팀 구성이 이루어지지 않았습니다. 팀 구성 후 다시 시도 바랍니다.",
      });

    const myPlayers = await prisma.inventory.findMany();
    /*****
     * 1. 매치 메이킹
     */
    // const myPlayers = {};
    // const enemyPlayers = {};

    const enemyUser = await prisma.users.findFirst({ where: { userId: 2 } });

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
      if (isSuccess(myPlayers.pass, myPlayers.sight)) {
        if (isSuccess(myPlayers.speed, myPlayers.shoot)) {
          if (isSuccess(enemyTeam.tackle, enemyTeam.deffence)) {
            myScore++;
          }
        }
      }
    }

    //상대방의 공격
    for (let i = 0; i < attackCount; i++) {
      if (isSuccess(enemyTeam.pass, enemyTeam.sight)) {
        if (isSuccess(enemyTeam.speed, enemyTeam.shoot)) {
          if (isSuccess(myPlayers.tackle, myPlayers.deffence)) {
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
      messageStr = "게임에서 승리하셨습니다.";
    } else if (myScore < enemyScore) {
      messageStr = "게임에서 패배하셨습니다.";
    } else {
      messageStr = "무승부로 게임이 종료되었습니다.";
      isDraw = true;
      resPointStr = "0 점";
    }

    // 경기 결과 등록
    const matchresult = prisma.matchResult.create({
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
    }

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
const isSuccess = (status1, status2) => {
  let res = false;

  const randomValue = Math.random() * 100;
  if (randomValue < (status1 + status2) / 2) res = true;
  return res;
};

export default router;
