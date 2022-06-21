---
title: Git Log 이쁘게 출력하기
date: '2022-02-05'
tags: ['Git']
draft: false
summary: Git에서 Log를 이쁘게 출력하는 방법.
---

# [Git] Log 이쁘게 출력하기

> Git을 사용하다 보면 Log는 굉장히 많이 보게 됩니다. 기본적으로 설정되어 있는 Log는 여러개를 한꺼번에 보기엔 가독성이 좋지 않습니다.
>
> 한 눈에 보기 쉽게 만들어 보겠습니다. (+ 나만의 Log )

## 이쁘게 출력하기 위한 옵션

- `--graph`: `commit`된 내역들의 그래프를 확인 할 수 있습니다.
- `--all`: 다른 브랜치의 커밋 기록까지 보여줍니다.
- `--date`: `short`를 사용하면 `yyyy-MM-dd`형식으로 날짜를 볼 수 있습니다.
- `--pretty=<값>`: 로그를 이쁘게 보기 위해 사용합니다. 단독으로 사용되지는 않고 뒤에 값을 입력해주어야 합니다. `short` `full` `fuller`와 같은 옵션이 있지만 `format`을
  사용하여 원하는대로 설정이 가능하기 때문에 `format`를 많이 사용합니다.
  - `format:<값>`
    - `%h`: 짧은 커밋 해시
    - `%d`: branch 정보
    - `%an`: Author 이름
    - `%ae`: Author 이메일
    - `%ad`: 절대 날짜
    - `%ar`: 상대 날짜
    - `%s`: 커밋 내용
    - `%C(<색상>)`: 색상 변경
      - 색상은 `red` `green` `blue` `white`만 사용가능하며 `reset`은 값을 초기화합니다.
      - `bold`를 사용하여 진하게 표시할 수 있습니다.
      - 터미널 설정에 따라, 보여지는 색은 조금씩 상이할 수 있습니다.
    - 그 외
      옵션은 [2.3 Git의 기초 - 커밋 히스토리 조회하기](https://git-scm.com/book/ko/v2/Git%EC%9D%98-%EA%B8%B0%EC%B4%88-%EC%BB%A4%EB%B0%8B-%ED%9E%88%EC%8A%A4%ED%86%A0%EB%A6%AC-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0)
      참고

위의 내용을 바탕으로 저만의 `log`를 만들어 봤습니다.

```zsh
git log --graph --all --pretty=format:'%C(yellow)🕰 %ad | %C(green)# %h | %C(bold white)𝑻 %s%C(reset) >>> %C(blue)[%an] %C(yellow)%ar%C(red)%d' --date=short
```

![Git Log pretty 설정](/data/blog/Git/Git_기본_명령어/log_screenshot.png)

## alias

`global`하게 설정해두면 매번 위 처럼 길게 적지 않아도 `git lg` 처럼 간략하게 사용할 수 있습니다. (`alias`는 `lg`가 아니여도 됩니다.)

```zsh
git config --global alias.lg "log --graph --all --pretty=format:'%C(yellow)🕰 %ad | %C(green)# %h | %C(bold white)𝑻 %s%C(reset) >>> %C(blue)[%an] %C(yellow)%ar%C(red)%d' --date=short"
```

---

## 참고 사이트

- [2.3 Git의 기초 - 커밋 히스토리 조회하기](https://git-scm.com/book/ko/v2/Git%EC%9D%98-%EA%B8%B0%EC%B4%88-%EC%BB%A4%EB%B0%8B-%ED%9E%88%EC%8A%A4%ED%86%A0%EB%A6%AC-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0)
