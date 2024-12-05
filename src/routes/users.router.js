import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandler.js";

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/sign-up", async (req, res, next) => {
  const { id, password, checkPassword } = req.body;

  // 비밀번호 확인
  if (password !== checkPassword) {
    return res
      .status(400)
      .json({ message: "비밀번호와 확인비밀번호가 다릅니다." });
  }

  // 사용자 존재 여부 확인
  const isExistUser = await prisma.users.findFirst({
    where: {
      id,
    },
  });

  if (isExistUser) {
    return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
  }

  try {
    const transaction = await prisma.$transaction(async (prisma) => {
      // 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(password, 10);

      // Users 테이블에 사용자 추가
      const user = await prisma.users.create({
        data: {
          id,
          password: hashedPassword, // 암호화된 비밀번호 저장
        },
      });

      // Team 테이블 추가
      await prisma.team.create({
        data: {
          userId: user.userId,
        },
      });
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//사용자 로그인 API
router.post("/sign-in", async (req, res, next) => {
  const { id, password } = req.body;
  const user = await prisma.users.findFirst({ where: { id } });

  if (!user)
    return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
  const secretKey = process.env.JWT_SECRET_KEY;

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    secretKey,
  );

  // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

/** 풋살온라인 - 내정보 보기 API → (JWT 인증 필요)  **/
router.get("/users/me", authMiddleware, async (req, res, next) => {
  const userId = req.user; // 유저 정보 가져오세요~

  // 1. 유저 정보를 가져온다.
  const users = await prisma.users.findMany({
    select: {
      userId: true, // userId 선택
      id: true, // id 컬럼만 선택
      mmr: true, // mmr 컬럼만 선택
      cash: true,
    },
    orderBy: [
      {
        mmr: "desc", // mmr을 내림차순으로 정렬
      },
      {
        userId: "asc", // 만약에 mmr이 똑같으면 가입 순서대로.
      },
    ],
  });

  // 2. 유저가 없을때 예외 설정.
  if (users.length === 0) {
    return next(new CustomError("유저가 없습니다.", 404)); // 상태 코드 404: Not Found
  }

  // 3. 팀정보를 가져온다.
  const team = await prisma.team.findFirst({
    where: {
      userId: userId,
    },
    select: {
      inventoryId1: true,
      inventoryId2: true,
      inventoryId3: true,
    },
  });

  // 4. 팀정보를 가없다면
  if (!team) {
    // 상태 코드 500: Internal Server Error
    return next(
      new CustomError(
        "중대한 오류: 팀 정보가 누락되었습니다. 데이터베이스를 확인해주세요.",
        500,
      ),
    );
  }

  // 5. 순위를 매긴다.
  const rankedUsers = users.map((user, index) => ({
    ranking: index + 1, // 인덱스가 0부터 시작, + 1을 해야한다.
    ...user,
  }));

  // 6. 순위를 정하고 내정보를 가져오자.
  const myUser = rankedUsers.find((user) => user.userId === userId);

  
  // 7. 팀으로 설정된 선수를 대리고 오자.
  const player_id = [team.inventoryId1, team.inventoryId2, team.inventoryId3];
  let player_name = [];

  for (let value of player_id) {
    let cardName = null;

    if (value !== null) {
      cardName = await prisma.inventory.findFirst({
        where: {
          userId: userId,
          inventoryId: value,
        },
        select: {
          upgrade: true,
          cards: {
            select: {
              name: true,
            },
          },
        },
      });
    }

    if(value !== null && cardName) {
      player_name.push(`${cardName.cards.name} (+${cardName.upgrade})`);
    } else {
      player_name.push("팀원이 없습니다.");
    }
  }

  // 7. 출력
  return res.status(201).json({
    ranking: myUser.ranking,
    id: myUser.id,
    mmr: myUser.mmr,
    cash: myUser.cash,
    team: {
      striker: player_name[0],
      defender: player_name[1],
      midfielder: player_name[2],
    },
  });
});

//돈벌기 API
router.patch("/cash", authMiddleware, async (req, res, next) => {
  const  userId  = req.user;

  try {
    await prisma.$transaction(async (prisma) => {
      // 유저 찾기
      const user = await prisma.users.findFirst({
        where: {
          userId: +userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "계정 정보를 찾을 수 없습니다.",
        });
      }

      // 캐릭터 잔액 증가
      const newMoney = user.cash +10000;
      await prisma.users.update({
        where: { userId: +userId },
        data: {
          cash: newMoney,
        },
      });

      res.status(200).json({ message: "10000캐시 충전 완료",data:{ cash: newMoney } });
    });
  } catch (error) {
    console.error(error);
    next(error); // 오류 미들웨어로 전달
  }
});
export default router;
