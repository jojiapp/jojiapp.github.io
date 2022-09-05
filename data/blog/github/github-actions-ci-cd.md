---
title: '[Github] 정적 사이트 Github Actions CI/CD로 배포하기'
date: '2022-09-05'
tags: ['Github', 'Github Actions', 'CI/CD']
draft: false
summary: '정적 사이트 Github Actions CI/CD로 배포하기'
---

# [Github] 정적 사이트 Github Actions CI/CD로 배포하기

`Github Actions`를 이용하여 `gh-pages`로 `정적 사이트 배포`를 해보도록 하겠습니다.

## Workflow 권한 토큰 발급

`Settings -> Developer setting -> Personal access token -> Generate new token`

`workflow`를 선택하고 토큰읇 발급 받습니다.

발급 받은 토큰 값을 `Repository -> Settings -> Secrets -> Actions -> New Repository Secret`에

`WORKFLOW`이름으로 만들어 줍니다.

아래에서 `${{ secrets.WORKFLOW }}`이렇게 사용할 것이기 떄문에 `WORKFLOW`로 지은 것이지 이름은 상관없습니다.

## Workflow 만들기

해당 `Repository`의 `Actions` 탭에 들어가면 `workflow`를 생성할 수 있습니다.

혹은 그냥 `.github/workflow/` 하위에 만들면 `Github`가 자동으로 인식 합니다.

- `.github/workflow/gh-pages.yml`

```yml
name: Build and Deploy # workflow 실행 이름 (아무거나 해도 됨)
on:
  push:
    branches:
      - main # 해당 브랜치에 푸쉬하면 실행 됨

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest # 실행 환경
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          persist-credentials: false

      - name: Install and Build # CI 과정
        uses: actions/setup-node@v3 # node 설치
        with:
          node-version: 16 # node 버전
      - run: npm install #
      - run: npm run build
      - run: npm run export # 이 부분은 라이브러리마다 정적 파일을 만드는 커맨드로 변경
        env:
          CI: true
          DEPLOY_TARGET: gh-pages
      - run: touch out/.nojekyll # gh-pages는 .nojekyll 파일이 존재해야 하므로 생성, 라이브러리에 따라 out 폴더가 아닐수 있음

      - name: Deploy # CD 과정
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          GITHUB_TOKEN: ${{ secrets.WORKFLOW }} # workflow key
          BRANCH: gh-pages # 배포될 브랜치
          FOLDER: out # 이 폴더에 있는 파일을 배포 (라이브러리 마다 다를수 있음)
          CLEAN: true # 배포 브랜치에 있는 파일들을 자동으로 삭제
```

## 마치며

이후 `main` 브랜치에 `push`를 하면 잘 동작하는 것을 확인할 수 있습니다.

예전에 `React + NextJS`로 만들 때 해봤던 것인데 이번데 `SvelteKit`으로 배포를 하기 위해 다시 한번 할 겸 정리하였습니다.

하지만 `SvetleKit`은 `adapter-static`부터 문제여서 `Github Actions + AWS EC2` 배포로 따로 다뤄보려 합니다.
