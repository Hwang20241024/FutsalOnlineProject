import CustomError from "../utils/errors/customError.js";

export default function (err, req, res, next) {
  // CustomError라면 statusCode와 message로 응답
  if (err instanceof CustomError) {
    console.error(err);
    //console.error(err.name); // 디버깅용
    return res.status(err.statusCode).json({ message: err.message });
  }
  // CustomError가 아니라면?
  console.error(err);
  res.status(500).json({ errorMessage: "서버 내부 에러가 발생했습니다." });
}
