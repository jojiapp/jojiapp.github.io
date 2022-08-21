---
title: '[Svelte] SvelteKit에 TailwindCss 적용하기'
date: '2022-08-21'
tags: ['Svelte', Svelte-Kit, Tailwind CSS]
draft: false
summary: SvelteKit에 TailwindCss 적용하기
---

# [Svelte] SvelteKit에 TailwindCss 적용하기

## Install Tailwind CSS

```zsh
npm install -D tailwindcss postcss autoprefixer svelte-preprocess
npx tailwindcss init tailwind.config.cjs -p
```

## postCss를 처리하도록 프로세스 추가

- svelte.config.js

```js
const config = {
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
}
```

## tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## src/routes/app.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 전체에 적용

- src/routes/+layout.svelte

```sveltehtml

<script>
  import "../app.css";
</script>

<slot/>
```

## 자동 정렬

class에 작성한 tailwindCSS를 특정 규칙에 맞게 정렬해줍니다.

```zsh
npm install -D prettier prettier-plugin-tailwindcss
```

## 참고 사이트

[TailwindCss 공식 사이트](https://tailwindcss.com/docs/guides/sveltekit)
