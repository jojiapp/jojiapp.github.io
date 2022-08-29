---
title: '[Svelte] Font Awesome 사용하기'
date: '2022-08-30'
tags: ['Svelte']
draft: false
summary: 'Font Awesome 사용하기'
---

# [Svelte] Font Awesome 사용하기

```zsh
npm install svelte-fa

npm install @fortawesome/free-solid-svg-icons
npm install @fortawesome/free-brands-svg-icons
```

## Svelte Kit 사용 시

Svelte 사용시에는 `Fa`를 사용하기 위해서는 `Svelte`파일을 `import`해야 합니다.

```sveltehtml
import Fa from 'svelte-fa/src/fa.svelte'
```

## 아이콘 추가해보기

```sveltehtml

<script lang="ts">
  import Fa from 'svelte-fa/src/fa.svelte'
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<Fa icon={faGithub}/>
```

## 빌드 후 실행 시 에러 발생

```zsh
SyntaxError: Named export 'faGithub' not found. The requested module '@fortawesome/free-brands-svg-icons' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from '@fortawesome/free-brands-svg-icons';
const { faGithub } = pkg;
```

개발모드에서는 잘 되다가 빌드 후 실행시켰더니 위와 같은 에러가 발생했습니다.

저는 앞에 `/node_modules`를 추가함으로써 정상 작동 되었습니다.

```ts
import { faGithub } from '/node_modules/@fortawesome/free-brands-svg-icons'
```

## 참고 사이트

[https://www.npmjs.com/package/svelte-fa](https://www.npmjs.com/package/svelte-fa)
