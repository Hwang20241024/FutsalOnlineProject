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

**가챠 시스템**
- 1000캐시를 소모하여 1회 카드를 뽑습니다.
- 확률은 GOLD : 10%, SILVER : 30%, BRONZE : 60%의 확률입니다.
- 10회 GOLD 등급이 나오지않으면, 다음 가챠시 GOLD 등급 확정입니다.

**강화 시스템**
- 같은 카드 2장 강화시 +1 카드 획득
- 해당 카드는 모든 스탯이 +1, 최대 +10까지

**카드조합**
- 보유카드 3장 조합시 랜덤한 카드 획득
- 높은 등급의 카드를 넣을수록, 높은 등급의 카드가 나올 확률이 올라갑니다.
- 숨겨진 레시피로 조합을 진행하면, 숨겨진 히든 카드가 생성될 수 있습니다.

 **팀 편성**
- 보유한 카드를 원하는 자리에 편성할 수 있습니다.
- 현재는 한 팀에 3명씩 선발할 수 있습니다.
- 같은 카드를 중복으로 편성할 수 없습니다.
- 편성되어있는 카드는 강화할 수 없습니다.

**축구게임** 
- 매칭이 결정되면, 서로 10번의 공격기회
- 스텟에 따라 미드필더의 패스성공, 공격수의 슈팅성공, 상대방 수비수의 수비실패시 득점

**점수**
- 본인 mmr기준 +-50점 이내의 유저 매칭
- 승패에 따라 10(+@)
- 일정 점수를 넘으면 티어 상승 



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


