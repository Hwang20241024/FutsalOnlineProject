import express from 'express';

// 라우터 임포트.
import CardFusionRouter from "./cards/fusion.router.js";
import GachaRouter from "./cards/gacha.router.js";
import InventoryRouter from "./cards/inventory.router.js";
import CardsUpgrade from "./cards/upgrade.router.js";

// 라우터 연결 
const cardsManagerRouter = express.Router();

// 카드 관련 라우터만 추가 (배열로 받을 수도 있지만, 나중에 라우터가 더 추가될 가능성을 고려하여 개별적으로 처리.)
cardsManagerRouter.use("/cards", CardFusionRouter);
cardsManagerRouter.use("/cards", GachaRouter);
cardsManagerRouter.use("/cards", InventoryRouter);
cardsManagerRouter.use("/cards", CardsUpgrade);

// 연결 
export default cardsManagerRouter;