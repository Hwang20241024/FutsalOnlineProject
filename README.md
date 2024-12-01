<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=%EC%95%84%EC%9D%B4%EC%98%A4%EB%8B%89&fontSize=70&textColor=white" />



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

