---
title: '[Svelte] SvelteKit Routing'
date: '2022-08-20'
tags: ['Svelte', Svelte-Kit]
draft: false
summary: SvelteKit Routing
---

# [Svelte] SvelteKit Routing

SeveltKit은 NextJS와 비슷하게 SSR을 제공합니다.

기본적으로 `/src/routes` 폴더 하위에 생성된 파일들은 리우팅 경로로 잡힙니다.

> ex) `src/routes/about/+page.svelte` -> `http://localhost:3000/about`

## +page.svelte

실질적으로 보여질 페이지입니다.

```sveltehtml

<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>About</title>
  <meta name="description" content="About this app"/>
</svelte:head>

<div class="content">
  <h1>{data.title}</h1>
</div>
```

여기서 `data`는 `+page.ts` 혹은 `+page.server.ts`에서 받아온 것입니다.

위 두 파일이 존재하지 않다면 `+layout.ts` 혹은 `+layout.server.ts`에서 받아옵니다.

## +page.ts

`+page.svelte`가 렌더링 되기 전 API를 통해 데이터를 받아오는 등 데이터 관련 처리를 하는 파일입니다.

```ts
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  if (params.slug === 'hello-world') {
    return {
      title: 'Hello world!',
    }
  }

  throw error(404, 'Not found')
}
```

> 함수명은 반드시 `load`여야 인식합니다.

## +page.server.ts

`+page.ts`는 서버와의 API 통신 처럼 클라이언트 관련 처리를 한다면,

`+page.server.ts`는 DB와 직접 통신하는 등 서버에서 할 수 있는 작업을 하는 파일입니다.

```ts
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const post = await getPostFromDatabase(params.slug)

  if (post) {
    return post
  }

  throw error(404, 'Not found')
}
```

`+page.ts`와 `page.server.ts` 둘 중 필요한 것으로 사용하면 됩니다.

> 함수명은 반드시 `load`여야 인식합니다.

## +layout.svelte

공통적으로 사용될 부분들을 작성하는 파일입니다.

```sveltehtml

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/settings">Settings</a>
</nav>

<slot></slot>
```

여기서 `<slot></slot>`부분이 해당 경로의 `+page.svelte`가 됩니다.

해당 `+layout.svelte`파일이 생성된 하위 모든 경로에 적용됩니다.

`/src/routes/+layout.svelte`가 존재하고, `/src/routes/about/+layout.svelte`도 존재한다면

`/src/routes/+layout.svelte`안에 `/src/routes/about/+layout.svelte`가 포함되게 됩니다.

즉, `<slot></slot>` 부분에 `/src/routes/about/+layout.svelte`가 들어가게 되는것 입니다.

## +layout.ts

위의 `+page.ts`와 동일하나 `+layout.svelte` 렌더링 이전에 실행된다는 차이점이 있습니다.

## +layout.server.ts

위의 `+page.server.ts`와 동일하나 `+layout.svelte` 렌더링 이전에 실행된다는 차이점이 있습니다.

## +error.svelte

`+page.ts`, `+page.server.ts`에서 예외가 발생하면 `+page.svelte`대신 `+error.svelte`가 실행됩니다.

```sveltehtml

<script lang="ts">
  /** @type {import('./$types').LayoutData} */
  import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

## +server.ts

API 전용 파일입니다.

보통 서버에 API를 호출하여 데이터(JSON 등)을 받아 처리를 하는데, 그 때 사용되는 API 입니다.

```ts
import { error } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
  const min = Number(url.searchParams.get('min') ?? '0')
  const max = Number(url.searchParams.get('max') ?? '1')

  const d = max - min

  if (isNaN(d) || d < 0) {
    throw error(400, 'min and max must be numbers, and min must be less than max')
  }

  const random = min + Math.random() * d

  return new Response(String(random))
}
```

위 파일들과 동일한 폴더에 생성하면 안됩니다.

`/src/routes/api` 폴더 하위에 생성하여 사용하는것이 좋은것 같습니다.

메소드 명은 `HTTP Method`로 지으면 일치하는 요청과 매칭되어 실행됩니다.

> 간단한 프로그램의 경우 `Java + Spring`같은 별도의 서버를 만들지 않아도
>
> 이정도 수준에서 처리할 수 있을것 같습니다.

## $types

```sveltehtml

<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>
```

위 파일들을 보면 주석으로 `type`이 적혀있습니다.

`page`의 경우 `PageData`, `layout`의 경우 `LayoutData`로 해당 타입임을 의미합니다.

해당 주석이 없어도 문제 없이 실행은 되나, 안정성을 제공한다고 합니다. (아직 잘 모르겠습니다.)

## 실행 순서

`+layout.server.ts` -> `+page.server.ts` -> `+layout.ts` -> `+page.ts` -> `+layout.svelte` -> `+page.svelte`

`+page.server.ts`와 `+page.ts`모두 값을 반환하면 `+page.ts` 값을 사용합니다.

위 파일이 없다면 동일한 규칙으로 `+layout.server.ts`, `+layout.ts`에서 반환하는 값을 사용합니다.

- `+page.ts`

```ts
return {
  title: 'title',
}
```

- `layout.ts`

```ts
return {
  content: 'content',
}
```

이런식으로 각각 객체의 키값이 겹치지 않는다면 `+page.svelte`에서 두 값 모두 사용할 수 있습니다.

## 참고 사이트

- [SvelteKit Routing 공식 사이트](https://kit.svelte.dev/docs/routing)
