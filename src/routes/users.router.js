import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/authHandeler.js";

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
    secretKey
  );

  // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

export default router;
