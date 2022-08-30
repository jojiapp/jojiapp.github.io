---
title: '[Svelte] Markdown CSS 적용하기 (tailwindcss/typography)'
date: '2022-08-31'
tags: ['Svelte', 'Markdown', 'Markdown CSS', 'Tailwind CSS']
draft: false
summary: 'Markdown CSS 적용하기 (tailwindcss/typography)'
---

# [Svelte] Markdown CSS 적용하기 (tailwindcss/typography)

블로그를 만들면서 가장 필수적인 요소는 마크다운으로 작성된 글을 게시글로 만드는 것입니다.

그러기 위해선 2가지를 해야합니다.

- Markdown -> HTML 변환
- 변환된 HTML에 CSS 입히기

하나씩 해보도록 하겠습니다.

> 최종적으론 `tailwindcss/typography`을 적용할 것입니다.

## Markdown -> HTML 변환

`Svelte`에는 `svelte-markdown`이라는 라이브러리가 존재합니다.

해당 라이브러리를 통해 `마크다운`으로 된 문자열을 손쉽게 `HTML`로 `변환`할 수 있습니다.

```zsh
npm i svelte-markdown
```

```sveltehtml

<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown'

  export let markdown
</script>

<SvelteMarkdown source={markdown}/>
```

## 변환된 HTML에 CSS 입히기

## github-markdown-css 적용해보기

한땀 한땀 CSS를 각 태그에 맞게 작성하면 좋겠지만,
저는 그럴 자신이 없어서 `github-markdown-css`를 사용하기로 했습니다.

```zsh
npm i github-markdown-css
```

```sveltehtml

<script lang="ts">
  import 'github-markdown-css/github-markdown-dark.css'; // 다크모드
  import SvelteMarkdown from 'svelte-markdown';

  export let markdown;
</script>

<div class="markdown-body">
  <SvelteMarkdown source={markdown}/>
</div>
```

`.markdown-body` 하위의 태그에 `github markdown css`가 자동으로 적용됩니다.

저는 `dark` 모드로 하고싶어서 `import 'github-markdown-css/github-markdown-dark.css'`도 추가하였습니다.

### github-markdown-css 커스텀 하기

배경색 부터 글자 색깔, 각 헤더에 있는 아래 줄선들까지 저는 마음에 들지 않았습니다.

그래서 조금의 커스텀을 해보기로 했습니다.

우선 배경색은 간단했습니다.

`.markdown-body` 옆에 나란히 추가해주면 적용되었습니다.

```sveltehtml

<div class="markdown-body bg-neutral-900 text-white">
  <SvelteMarkdown source={markdown}/>
</div>
```

문제는 각 `Heading` 태그를 어떻게 컨트롤 할것이냐 였습니다.

처음에는 단순하게 아래처럼 작성하면 될줄 알았습니다.

```css
.markdown h1 {
  @apply ...;
}
```

하지만 각 태그가 `id`선택자로 되어있어 우선순위에서 밀리는 것 같았습니다.

그래서 저도 질수 없어 `id`선택자를 넣기로 했습니다.

```sveltehtml

<div id="markdown-body-custom" class="markdown-body bg-neutral-900">
  <MarkdownConvertor markdown={markdown}/>
</div>
```

```css
#markdown-body-custom h2 {
  @apply text-9xl;
}
```

잘 적용되는 것을 확인할 수 있었습니다.

### github-markdown-css의 문제점

제가 원하는 스타일을 적용하려면 정말 많은 부분을 손봐야합니다.

또한, 가장 큰 문제점은 `highlight` 라이브러리의 `CSS`의 우선 순위가 낮기 때문에 `code block`에 `highlight`을 적용하기가 어려웠습니다.

그래서 고민하던 찰나 `tailwindcss/typography`를 발견하였습니다.

## tailwindcss/typography 적용하기

우선 라이브러리를 받고 플러그인을 등록해 줍니다.

```zsh
npm install -D @tailwindcss/typography
```

- `tailwind.config.cjs`

```ts
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}
```

그리고 `.markdown-body`였던 부분을 `prose`로 바꿔줍닙다. (`prose`만 남기고 모두 지워도 됩니다.)

그럼 적용 된것을 확인할 수 있습니다.

### tailwindcss/typography 커스텀하기

제공하는 `theme`를 사용해도 되지만 저는 뭔가 이쁘지 않았습니다.

그래서 제가 이전에 받아 사용하던 `nextjs + tailwindcss 블로그 템플릿`에 있는 커스텀 `CSS`를 훔쳐(?)왔습니다.

그리고 약간 수정하였습니다.

- `tailwind.config.cjs`

```ts
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        gray: colors.neutral,
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.pink.500'),
              '&:hover': {
                color: `${theme('colors.primary.400')} !important`,
              },
              code: { color: theme('colors.primary.400') },
            },
            h1: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.100'),
            },
            h2: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.100'),
            },
            h3: {
              fontWeight: '600',
              color: theme('colors.gray.100'),
            },
            'h4,h5,h6': {
              color: theme('colors.gray.100'),
            },
            pre: {
              borderRadius: theme('borderRadius.md'),
              backgroundColor: theme('colors.gray.800'),
            },
            code: {
              color: theme('colors.gray.100'),
              padding: '2px 4px',
              borderRadius: theme('borderRadius.md'),
              backgroundColor: theme('colors.gray.800'),
            },
            details: {
              backgroundColor: theme('colors.gray.800'),
            },
            hr: { borderColor: theme('colors.gray.700') },
            'ol li::marker': {
              fontWeight: '600',
              color: theme('colors.gray.400'),
            },
            'ul li::marker': {
              backgroundColor: theme('colors.gray.400'),
            },
            strong: { color: theme('colors.gray.100') },
            thead: {
              th: {
                color: theme('colors.gray.100'),
              },
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              },
            },
            blockquote: {
              color: theme('colors.gray.100'),
              borderLeftColor: theme('colors.primary.700'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

잘 적용된 것을 확인할 수 있습니다.

하지만 여전히 `code block`에 `highlighting`은 안되고 있습니다.

이 부분은 조금 더 찾아봐야 할 것 같습니다.

## 마치며

`Tailwind CSS`는 막강한 기능이 많은것 같습니다.

`code block`만 `highlighting`되면 완벽할 것 같은데 쉽지 않습니다.

## 참고 사이트

- [npm svelte-markdown](https://www.npmjs.com/package/svelte-markdown)
- [https://github.com/sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css)
- [https://tailwindcss.com/docs/typography-plugin](https://tailwindcss.com/docs/typography-plugin)
- [https://github.com/timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)
