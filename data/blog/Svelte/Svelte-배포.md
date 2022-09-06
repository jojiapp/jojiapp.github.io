---
title: '[Svelte] SvelteKit 배포'
date: '2022-09-06'
tags: ['Svelte', 'Svelte-Kit', 'Deploy']
draft: false
summary: 'SvelteKit 배포'
---

# [Svelte] SvelteKit 배포

오늘은 `SvelteKit`을 배포하기 위해 했던 삽질에 대해 적어보려 합니다.

배포는 정적사이트를 무료로 제공하는 곳들이 많습니다.

`Github Pages`, `Cloudflare Pages`, `Vercel`, `Netlify` 등이 있죠.

또한, 요금이 나가지만 `AWS EC2`에 직접 배포하는 방법이 있습니다.

저는 `Github Pages`로 배포를 하려다 실패하고 서버도 어차피 띄워야 하니 `AWS EC2`에 배포 하였습니다.

그 과정을 조금 공유해보겠습니다.

## Github Pages 배포 (실패)

`Github Pages`는 `Github`에서 각 리포지토리마다 무료로 정적 사이트를 만들 수 있도록 하고 있습니다.

여기에 배포하기 위해서는 `@sveltejs/adapter-static`를 받아야 합니다.

```bash
npm i -D @sveltejs/adapter-static
```

이후 `svelte.config.js` 파일을 조금 수정해줍니다.

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static'

export default {
  kit: {
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: 'build', // 빌드 결과물이 생성될 폴더
      assets: 'build',
      fallback: null,
      precompress: false,
    }),
  },
}
```

그리곤 `prerendering`을 할 곳에 모두 아래 코드를 심어줍니다.

> 여기서 `root`의 `+layout.ts`파일은 전체에 적용되므로 해당 파일에만 넣어주면 전체에 적용됩니다.

- `+layout.ts`

```ts
export const prerender = true
```

공식문서에 나온대로 작성하였습니다.

하지만 저는 `build`를 하면 동적라우팅이 있다며 계속해서 실패했습니다.

`fallback`을 `index.html`로 하라는 글들을 보고 수정했지만
이렇게 할 시 `SPA 모드`로 됩니다. (이럴거면 `SvelteKit` 안썼지)

다양하게 옵션을 변경하며 시도해보았지만 여전히 실패했습니다.

## AWS EC2 배포

그래서 그냥 `AWS EC2`에 배포하기로 하였습니다.

> `AWS EC2`를 만드는 과정은 생략하겠습니다.

`node`로 실행할 것이기 때문에 `node adapter`가 필요합니다.

```bash
npm i -D @sveltejs/adapter-node
```

```ts
import adapter from '@sveltejs/adapter-node'

const config = {
  kit: {
    adapter: adapter({ out: 'build' }),
  },
}
```

여기서 `out`은 빌드 된 결과물이 생성될 폴더입니다. (원하는대로 지으면 됩니다.)

```bash
npm run build
node build/index.js # 실행
```

이렇게 간단하게 실행할 수 있습니다.

## 마치며

이걸 하며 `CI/CD 자동화` (`Github Actions`를 통한 `CI`와 `AWS CodeDeploy`를 통한 `CD`)를 구축했습니다.

해당 과정은 이미지가 많이 필요한 관계(캡쳐 이미지 직접 경로 지정이 너무 귀찮)로 블로그를 완성하면 포스팅 해보겠습니다.

## 참고 사이트

- [https://github.com/sveltejs/kit/tree/master/packages/adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)
