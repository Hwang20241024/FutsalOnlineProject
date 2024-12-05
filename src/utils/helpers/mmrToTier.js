// 라우터에서 사용할때 경로.. ../utility/helpers/mmrToTier.js
import { prisma } from "../../utils/prisma/index.js";

export default async function mmrToTier(userId) {
  
  try {
    let tier = "";
    
    // 1. 유저 정보를 가져온다.
    const users = await prisma.users.findMany({
      select: {
        userId: true, // userId 선택
        mmr: true, // mmr 컬럼만 선택
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

    // 2. 챌린저 검증하기위한 랭킹 조회.
    const temp = userId; // 본인의 userId를 입력
    const userRank = users.findIndex((user) => user.userId === temp) + 1; // 0부터 시작이니 +1
    const userMmr = users.find((user) => user.userId === temp);

    console.log(userRank);
    // 3. 티어 결정.
    if (userMmr.mmr > 2000 && userRank < 10) {
      tier = "챌린저";
    } else if (userMmr.mmr > 2000) {
      tier = "다이아";
    } else if (userMmr.mmr > 1600) {
      tier = "플래티넘";
    } else if (userMmr.mmr > 1200) {
      tier = "골드";
    } else if (userMmr.mmr > 800) {
      tier = "실버";
    } else {
      tier = "브론즈";
    }

    return tier;
  } catch (error) {
    return null;
  }
}
