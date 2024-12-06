<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=%EC%95%84%EC%9D%B4%EC%98%A4%EB%8B%89&fontSize=70&textColor=white" style="width: 100%; height: auto;" />



# 1. Architecture

```
📦src
 ┣ 📂middlewares
 ┃ ┣ 📜authHandler.js
 ┃ ┗ 📜errorHandler.js
 ┣ 📂routes
 ┃ ┣ 📂cards
 ┃ ┃ ┣ 📜fusion.router.js
 ┃ ┃ ┣ 📜gacha.router.js
 ┃ ┃ ┣ 📜inventory.router.js
 ┃ ┃ ┗ 📜upgrade.router.js
 ┃ ┣ 📜cardsManager.router.js
 ┃ ┣ 📜games.router.js
 ┃ ┣ 📜matchrecord.router.js
 ┃ ┣ 📜organize.router.js
 ┃ ┣ 📜ranks.router.js
 ┃ ┗ 📜users.router.js
 ┣ 📂utils
 ┃ ┣ 📂errors
 ┃ ┃ ┗ 📜customError.js
 ┃ ┣ 📂helpers
 ┃ ┃ ┗ 📜mmrToTier.js
 ┃ ┗ 📂prisma
 ┃ ┃ ┗ 📜index.js
 ┗ 📜app.js
```



# 2. API 개요

## 주요 기능 

**축구게임** 

**카드조합**

## 제공되는 엔드포인트

[POST] **/api/sign-up** : 회원가입 

[POST] **/api/sign-in** : 로그인 

[POST] **/api/cash** : 캐시구매

[GET] **/api/ranks** : 랭킹 조회

[GET] **/api/users/me** : 내 정보 보기 

[POST] **/api/records** : 대전기록 조회

[POST] **/api/cards/gacha** : 카드 뽑기

[POST] **/api/teams/cards** : 팀 편성

[POST] **/api/teams/release** : 팀 편성 해제

[POST] **/api/cards/upgrade** : 카드 강화

[POST] **/api/cards/fusion** : 카드 조합

[POST] **/api/cards/sales** : 카드 판매

[GET] **/api/cards/inventory** : 보유 카드 목록

[GET] **/api/cards** : 보유 카드 상세

[POST] **/api/games** : 매치 메이킹 / 축구 게임 / 게임승패/ 점수 조정

# 3. Technologies Used
![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white)
![mysql](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

[![My Skills](https://skillicons.dev/icons?i=nodejs,mysql,aws&theme=light)](https://skillicons.dev)




<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=150&section=footer" style="width: 100%; height: auto;" />


