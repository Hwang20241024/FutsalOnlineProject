<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=%EC%95%84%EC%9D%B4%EC%98%A4%EB%8B%89&fontSize=70&textColor=white" />

# 브랜치 구조와 작업 흐름 설명 (제출 후 삭제 예정)
## 1. 메인 브런치와 서브 브런치
### 1. 메인 브런치 (main)
 - 프로젝트에서 최종적으로 병합되는 브런치입니다. 최종적인 코드 상태가 여기에 반영됩니다.

### 2. 서브 브런치 (sub branch)
 - 메인 브런치에서 파생된 브런치입니다. 메인 브런치에 병합하기전에 사용하게될 서브 브런치입니다.

### 3. 개인 브런치 
 - 각자 작업하고 서브 브런치에 병합합니다. 만약 같은 파일안에서 작업한다면 순서를 정하고 병합합시다.

### 4. 각자의 브런치를 서브 브런치 (sub branch)에 병합.
 - 에러가 있는지 없는지 확입합니다.

### 5. 서브 브런치 (sub branch)에서 메인 브런치 (main) 병합.
 - 해당 작업은 "필수기능", "도전기능"등 큼지막한 일이있을때 진행합니다.

### 6. 반복입니다. 

## 2. gitBash 

```bash
# 개인 브런치 생성법.
git checkout -b "개인브런치 이름"

## 작업완료후 병합하는법
# 서브브런치로 이동
git checkout "서브브런치-이름"

# 개인 브런치에서 최신 상태로 업데이트
git pull origin "서브브런치-이름"

# 개인 브런치 병합
git checkout "서브브런치-이름"
git merge "개인브런치-이름"

git add .
git commit -m "메시지 내용."

# 병합된 서브 브런치 푸시
git push origin sub-branch

# 만든 개인용 브런치 삭제
git branch -d "개인브런치-이름"
git push origin --delete "개인브런치-이름"
```
## 3. 브런치 이름 규칙
1. 메인 브런치 : main
2. 서브 브런치 :
   1. Essential_Features(필수기능)
   2. Challenge_Features(도전기능)
   3. Additional_Features_01(추가기능, 계속해서 숫자를 증가시킬 수 있음)
4. 개인 브런치
     1. 기능 개발: feature_"기능명"_"이름"
     2. 버그 수정: bugfix_"버그내용"_"이름"
     3. 리펙토링: refactor_"기능명"_"이름"


# Code Convention (제출 후 삭제 예정)
- 탭은 **2칸**
- 변수는 **camelCase**
- 함수는 **Pascalcase**
- 칼럼,테이블명은 전부 대문자인 **SNAKE_CASE**
- 따옴표는 **‘**

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "singleQuote": false,
  "trailingComma": "all"
}
```

# customError - 사용법 (제출 후 삭제 예정)

**만든 이유**: 트랜잭션에서 에러를 보다 쉽게 처리하기 위해서입니다.

**사용법 0: import**

```js
import CustomError from '경로';
```

**사용법 1: 트랜잭션 외에서 사용**

```js
  next(throw new CustomError('에러 메세지.', status코드));
```
**사용법 2: 트랜잭션 내에서 사용**

```js
  try {
    const transaction = await prisma.$transaction(async (prisma) => {
      ...
      throw new CustomError('에러 메세지.', status코드); 
    });
  } catch(error) {
    console.log(error); // 확인용 - 없어도 됩니다.
    return next(error);
  }
```

# Technologies Used
![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white)
![mysql](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=150&section=footer" />

