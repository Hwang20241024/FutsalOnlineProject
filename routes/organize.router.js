import express from "express";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

//팀 편성 API
router.post("/api/teams/cards", async (req, res, next) => {
  const { slot, inventoryId } = req.body;
});

