---
title: '[Svelte] 마크다운 에디터 적용하기 (feat. Toast-ui Editor)'
date: '2022-08-21'
tags: ['Svelte', Svelte-Kit]
draft: false
summary: 마크다운 에디터 적용하기 (feat. Toast-ui Editor)
---

# [Svelte] 마크다운 에디터 적용하기 (feat. Toast-ui Editor)

개인 블로그에서 글을 작성하기 위해서는 마크다운 에디터가 필요했는데,
이 중 많이 사용되고 있는 `Toast-ui Editor`를 적용 해보기로 하였습니다.

Svelte용 Toast-ui Editor로 `tui-editor-svelte`가 존재했지만,
codeBlock에 컬러를 씌우는 등의 커스텀 작업을 하기에는 한계가 있었습니다. (제가 못찾은걸 수도 있습니다.)

그래서 오리지날 버전으로 사용하기로 했습니다.

## Toast-ui Editor 설치

```zsh
npm i -D @toast-ui/editor
```

## SvelteKit에 적용하기

CSR과 SSR에서의 적용 방법이 조금 달랐습니다.

- `CSR`

```sveltehtml

<script lang="ts">
  import { onMount } from 'svelte'

  import '@toast-ui/editor/dist/toastui-editor.css'
  import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

  import Editor from '@toast-ui/editor'

  let markdownEditorEl;
  let markdownEditor;

  onMount(() => {
    markdownEditor = new Editor({
      el: markdownEditorEl,
      height: '80vh',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: 'dark',
    })
  })

</script>

<div bind:this={editor}></div>
```

CSR의 경우 위처럼 onMount 안에 콜백함수로 작성하면 됩니다.

- `SSR`

```sveltehtml

<script lang="ts">
  import { onMount } from 'svelte';
  import '@toast-ui/editor/dist/toastui-editor.css';
  import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';

  let markdownEditorEl;
  let markdownEditor;

  onMount(async () => {
    const Editor = (await import('@toast-ui/editor')).default;

    markdownEditor = new Editor({
      el: markdownEditorEl,
      height: '80vh',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      theme: 'dark',
    });
  });
</script>

<div bind:this={markdownEditorEl}/>
```

`SSR` 방식의 경우 위 처럼 비동기 함수로 `import` 해야합니다.

- `import '@toast-ui/editor/dist/toastui-editor.css'`: 마크다운 CSS 적용
- `import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'`: dark 모드 CSS

## CodeBlock 컬러 입히기

기본적으로 위 처럼 작성하면 CodeBlock은 CSS가 적용되지 않습니다.

CodeBlock에 컬러를 입히기 위해서는 별도의 라이브러리를 추가해야 합니다.

```zsh
npm i @toast-ui/editor-plugin-code-syntax-highlight
```

```sveltehtml

<script lang="ts">
  import { onMount } from 'svelte';
  import '@toast-ui/editor/dist/toastui-editor.css';
  import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';

  import 'prismjs/themes/prism.css'; // CodeBlock 커스텀 컬러
  import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css'; // 추가

  export let markdown: string;
  let markdownEditorEl;
  let markdownEditor;

  onMount(async () => {
    const Editor = (await import('@toast-ui/editor')).default;
    const codeSyntaxHighlight = (
        await import(
            '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js'
            ) // 추가
    ).default;

    markdownEditor = new Editor({
      el: markdownEditorEl,
      initialValue: markdown,
      height: '80vh',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      theme: 'dark',
      plugins: [codeSyntaxHighlight] // 추가
    });
  });
</script>

<div bind:this={markdownEditorEl}/>
```

위 처럼 `codeSyntaxHighlight` 부분은 비동기 함수에서 `import` 하고, 그 외의 부분은 일반적인 `import`를 사용하면 됩니다.

이후 `plugins`에 추가하면 CodeBlck에도 색상이 들어가는 것을 확인할 수 있습니다.

## 마크다운 값 가져오기

`markdownEditor`를 통해서 작성된 마크다운 값을 가져올 수 있습니다.

```ts
markdownEditor.getMarkdown()
```

`html`을 가져오는 등 다양한 기능이 있으므로 필요할 때 찾아보면 될것 같습니다.

## 마치며

`SSR`에서 어떻게 작성해야 하는지 몰라서 삽질을 많이 한것 같습니다.

우연히 이슈에 적힌 글을 보고 처리할 수 있었음에 감사합니다.

## 참고 사이트

- [https://svelte.dev/repl/16b375da9b39417dae837b5006799cb4?version=3.25.0](https://svelte.dev/repl/16b375da9b39417dae837b5006799cb4?version=3.25.0)
- [https://www.npmjs.com/package/@toast-ui/editor-plugin-code-syntax-highlight](https://www.npmjs.com/package/@toast-ui/editor-plugin-code-syntax-highlight)
