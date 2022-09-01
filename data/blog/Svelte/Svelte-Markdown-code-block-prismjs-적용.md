---
title: '[Svelte] Markdown code block prismjs 적용'
date: '2022-09-02'
tags: ['Svelte', 'Markdown', 'Markdown CSS', 'prismjs', code block]
draft: false
summary: 'Markdown code block prismjs 적용'
---

# [Svelte] Markdown code block prismjs 적용

이전에 `tailwindcss/typography`를 이용하여 간단하게 `마크다운`을 `HTML`로 만든 결과를
블로그 CSS로 간단하게 만들어 봤습니다.

이전에는 `code block`에 `CSS`가 없어 `highlighting`애 실패했습니다.

그래서 찾아 본 결과 `마크다운`에서 `HTML`로 만드는 과정에 `code block`을 토큰 단위로 쪼개 클래스를 입혀 놓아야
`highlight 라이브러리`를 통해 `CSS`를 적용할 수 있다는걸 알게 되었습니다.

이전에 사용했었던 `svelte-markdown`은 `marked`를 추가로 넣어 각 토큰을 컨트롤해야 하는것 같았습니다.

다른 대안으로 `markdown-it`라이브러리를 사용했는데, `markdown-highlight`은 잘 적용이 되었으나
`markdown-prism`은 공식문서 대로 작성했음에도 적용이 되지 않았습니다.

`remark`도 해보았는데 잘 `prism`적용은 잘 되지 않았습니다.

그러던 중 `marked`라이브러리가 자체적으로 markdown to html도 되고, `prismjs`를 통해 `highlight 커스텀`도 제공하는 등
여러 옵션이 있다는걸 알게 되었습니다.

그래서 적용해본 결과를 작성해 보려 합니다.

## 최종 코드

```sveltehtml

<script lang="ts">
  import { marked } from 'marked';
  import prism from 'prismjs';
  import 'prismjs/themes/prism-dark.css';
  import '$lib/global/css/prism';
  import '$lib/global/css/prism.css';

  export let markdown;

  function getLanguageHighlight (code: string, lang: string) {
    return prism.highlight(code, prism.languages[lang], lang);
  }

  function getDefaultLanguageHighlight (code: string) {
    return prism.highlight(code, prism.languages.log, 'log');
  }

  marked.setOptions({
    langPrefix: 'language-',
    highlight: function (code, lang) {
      try {
        return getLanguageHighlight(code, lang);
      } catch {
        return getDefaultLanguageHighlight(code);
      }
    },
    gfm: true
  });

  let html = marked.parse(markdown);
</script>

{@html html}
```

## code block highlight용 클래스 입히기

```bash
npm i prismjs @types/prismjs
```

`prismjs`에 있는 `CSS`들은

```css
code[class*="language-"],
pre[class*="language-"]
```

```css
.token.각기다른클래스명;
```

위 두 형식으로 만들어져 있습니다.

`code block`을 파싱해서 단어 단위로 `token`클래스 값을 넣어주는 일은 보통일이 아닙니다.

또한 각 언어를 이렇게 다 만들려면 너무 많은 작업을 해야합니다.

`prismjs`라이브러리에는 각 언어마다 위의 형식으로 만들어주는 메소드가 존재합니다.

```ts
import prism from 'prismjs'
import 'prismjs/components/prism-java'

const codeBlock = prism.highlight(code, prism.languages.java, 'java')
```

`code block`은 만들어주니 이제 우리는 2가지를 해야합니다

- `markdown to html`하는 과정에 포함 시켜야 함
- `java`뿐 아니라 다른 언어도 지원해야 함

## markdown to html에 해당 과정 포함 시키기

```bash
npm i marked @types/marked
```

`marked`라이브러리는 여러 옵션이 있습니다.

각 옵션은 공식 사이트에서 확인하고 지금은 `highlight` 만드는데 집중하겠습니다.

```ts
marked.setOptions({
  langPrefix: 'language-',
  highlight: function (code, lang) {
    try {
      return getLanguageHighlight(code, lang)
    } catch {
      return getDefaultLanguageHighlight(code)
    }
  },
  gfm: true,
})
```

- `langPrefix`: `code block`을 감싸는 `<code>`의 클래스명의 `prefix`를 지정합니다.
  - 클래스 명은 `language-java 형식`으로 됩니다.
- `highlight`: `code block` 값을 가져와 컨버젼 합니다.

`highlight`함수가 `code`와 `lang`를 제공하기 때문에 동적으로 `highlight`할 언어를 지정할 수 있습니다.

```ts
function getLanguageHighlight(code: string, lang: string) {
  return prism.highlight(code, prism.languages[lang], lang)
}
```

> 단, 여기서 언어는 사용할 언어는 `import`를 각각 해줘야 합니다.

지원하지 않는다면 예외가 발생하게 됩니다.

이런 경우를 위해 기본적으로 사용할 언어도 지정해줍니다. 저는 `log`로 지정했습니다.

```ts
function getDefaultLanguageHighlight(code: string) {
  return prism.highlight(code, prism.languages.log, 'log')
}
```

## highlight할 언어 import 하기

저는 각각 하기 보다 하나의 파일에 모아서 해당 파일을 `import`하는 것이 깔끔하고 좋다고 생각하여 분리 하였습니다.

- `src/lib/global/css/prism.ts`

```ts
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-git'
import 'prismjs/components/prism-gradle'
import 'prismjs/components/prism-http'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-log'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-mongodb'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-regex'
import 'prismjs/components/prism-sass'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-vim'
import 'prismjs/components/prism-yaml'
```

```sveltehtml

<script lang="ts">
  ...
  import '$lib/global/css/prism';
  import 'prismjs/themes/prism-dark.css';

  ...
</script>

```

> 제가 사용할 것 같은 것 위주로 `import`한 것입니다. 더 많은 언어를 지원하니 필요에 따라 넣으면 될 것 같습니다.

## HTML String을 HTML로 변환

`Svelte`의 `{@html <HTML String>}`문법을 이용하면 간단하게 변환이 가능합니다.

```ts
let html = marked.parse(markdown)
```

이렇게 나온 `HTML String`을 위 태그에 넣어줍니다.

```sveltehtml
{@html html}
```

이제 `code block`에 `CSS`가 적용 된 것을 볼 수 있습니다.

## Code Block CSS 직접 커스텀하기

해보면 알겠지만 생각보다 이쁘지 않습니다.

`operator`의 `배경색`과 `텍스트`에 `쉐도우`가 들어간게 저는 마음에 들지 않았습니다.

그래서 직접 커스텀 해야겠다. 라고 다짐은 했지만 여전히 저는 디자인은 자신이 없는지라
제가 사용하던 블로그 템플릿에서 가져와 조금 추가하였습니다.

```css
/* Token styles */
/**
 * MIT License
 * Copyright (c) 2018 Sarah Drasner
 * Sarah Drasner's[@sdras] Night Owl
 * Ported by Sara vieria [@SaraVieira]
 * Added by Souvik Mandal [@SimpleIndian]
 */
code[class*='language-'] {
  text-shadow: none;
}

.token.operator {
  background: none;
}

.token.comment,
.token.prolog,
.token.cdata {
  color: rgb(99, 119, 119);
  font-style: italic;
}

.token.punctuation {
  color: rgb(199, 146, 234);
}

.namespace {
  color: rgb(178, 204, 214);
}

.token.deleted {
  color: rgba(239, 83, 80, 0.56);
  font-style: italic;
}

.token.symbol,
.token.property {
  color: rgb(128, 203, 196);
}

.token.tag,
.token.operator,
.token.keyword {
  color: rgb(127, 219, 202);
}

.token.boolean {
  color: rgb(255, 88, 116);
}

.token.number {
  color: rgb(247, 140, 108);
}

.token.constant,
.token.function,
.token.builtin,
.token.char {
  color: rgb(130, 170, 255);
}

.token.selector,
.token.doctype {
  color: rgb(199, 146, 234);
  font-style: italic;
}

.token.attr-name,
.token.inserted {
  color: rgb(173, 219, 103);
  font-style: italic;
}

.token.string,
.token.url,
.token.entity,
.language-css .token.string,
.style .token.string {
  color: rgb(173, 219, 103);
}

.token.class-name,
.token.atrule,
.token.attr-value {
  color: rgb(255, 203, 139);
}

.token.regex,
.token.important,
.token.variable {
  color: rgb(214, 222, 235);
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.table {
  display: inline;
}
```

색상은 조금씩 수정해보면서 마음에 드는 것으로 찾아 나가면 될 것 같습니다.

## 마치며

리액트는 커뮤니티가 크다보니 지원하는 라이브러리가 많던데 Svelte는 순수 자바스크립트 라이브러리만 가져다 쓰는 기분이 듭니다.

하지만 그만큼 특정 프레임워크에 의존적인게 아니라 좋은것 같다는 생각도 듭니다.

`code block` 그냥 `prismjs`로 CSS 입히면 되겠다 생각했는데, 생각보다 그 과정이 쉽지 않았습니다.

이렇게 구현하고 나니 `markdown to html` 과정에서 어떤걸 커스텀할 수 있는지 더 알게 되서 좋았습니다.

## 참고 사이트

- [https://marked.js.org/using_advanced#options](https://marked.js.org/using_advanced#options)
- [https://svelte.dev/tutorial/html-tags](https://svelte.dev/tutorial/html-tags)
- [https://github.com/timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)
