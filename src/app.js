// 라이브러리 import
import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";
import GamesRouter from "./routes/games.router.js";
import CardsUpgrade from "./routes/upgrade.router.js";
import OrganizeRouter from "./routes/organize.router.js";
import GachaRouter from "./routes/gacha.router.js";
import RankRouter from "./routes/ranks.router.js";
import InventoryRouter from "./routes/inventory.router.js";
import MatchrecordRouter from "./routes/matchrecord.router.js";
import CardFusionRouter from "./routes/fusion.router.js";



// 모듈 import
import ErrorHandlingMiddleware from "./middlewares/errorHandler.js";

const app = express();
const PORT = 3000;

/* 미들웨어 추가 */
app.use(express.json());
app.use(cookieParser());

/* 라우터 추가 */


app.use("/api", [UsersRouter, GamesRouter, OrganizeRouter,GachaRouter, CardsUpgrade, RankRouter, InventoryRouter, MatchrecordRouter, CardFusionRouter]);



/* 에러 처리 미들 웨어 */
app.use(ErrorHandlingMiddleware);

/* 서버 연결 */
app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
