---
title: '[Svelte] SvelteKit 시작'
date: '2022-08-19'
tags: ['Svelte', Svelte-Kit]
draft: false
summary: SvelteKit 시작
---

# SvelteKit 시작

요즘 Vite라는 빌드 툴이 좋다고 하여 `Vite + Svelte + SSR`로 개인 블로그를 만들어 보려고 하였습니다.

Svelte의 SSR 프레임워크로는 `SvelteKit`이 존재하고 React의 `NextJS`와 비슷한 구조를 가지고 있습니다.

그래서 SvelteKit을 사용하기로 마음 먹고 Vite 공식 홈페이지에서 제공하는 방식으로 Svelte 프로젝트를 생성해 보았습니다.

```zsh
npm create vite@latest my-app -- --template svelte-ts
```

그리고 SvelteKit을 적용하기 위해 열심히 검색을 했지만 별도의 설치 없이
그냥 Svelte 프로젝트를 생성하면 존재하는것 처럼 나와있었습니다.

하지만 폴더 구조가 달랐고, routes 폴더를 만들어 svelte 파일을 생성해 보았지만 역시나 라우팅이 되지 않았습니다.

그래서 다시 천천히 찾아본 결과 아래 처럼 프로젝트를 생성하면 되는 것이였습니다.

```zsh
npm create vite@latest my-app
```

## 마치며

사실 Vite 공식 홈페이지 첫 번째 줄에 있는 방식인데 어째서 저걸 무시하고 아래 방식으로 했는지 저도 모르겠습니다.

어쩐지 다들 `Eslint`랑 `Prettier` 여부를 묻는다고 하던데 묻지 않아서 이상하다고 생각했는데
이런 예감은 빗나가질 않는군요.

## 참고 사이트

[Vite 공식 홈페이지](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)
