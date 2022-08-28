---
title: '[Svelte] Toast-UI Editor 이미지 업로드'
date: '2022-08-29'
tags: ['Svelte']
draft: false
summary: 'Toast-UI Editor 이미지 업로드'
---

# [Svelte] Toast-UI Editor 이미지 업로드

이번에 블로그를 직접 만들어야겠다 생각했던 가장 큰 부분이 마크다운으로 글을 쓰면서
캡쳐한 이미지를 바로 넣고 싶어서였습니다.

그럼 어떻게 할 수 있는지 알아보겠습니다.

## addImageBlobHook

이미지가 첨부될 때 `addImageBlobHook`함수가 실행됩니다.

```ts
type HookCallback = (url: string, text?: string) => void

export type HookMap = {
  addImageBlobHook?: (blob: Blob | File, callback: HookCallback) => void
}
```

- `blob`: 파일 객체
- `callback`
  - `url`: 이미지 경로
  - `text?`: `alt` 값

그럼 이제 어떻게 동작하는지는 알았으니 해야할 일는 이미지를 업로드하고 해당 경로를 받아 `callback` 함수로 넘겨주면 됩니다.

```ts
const handleImageUpload = (blob, callback) => {
  console.log(blob)
  callback('http://localhost:3000/static/images/logo.png', 'logo.png')
}

markdownEditor = new Editor({
  el: markdownEditorEl,
  initialValue: $postMarkdown.getContent(),
  height: '80vh',
  initialEditType: 'markdown',
  previewStyle: 'tab',
  theme: 'dark',
  plugins: [codeSyntaxHighlight],
  events: {
    change: (editorType) => $postMarkdown.setContent(markdownEditor.getMarkdown()),
  },
  hooks: {
    addImageBlobHook: handleImageUpload,
  },
})
```

정상적으로 이미지 값이 마크다운으로 들어가는 것을 확인할 수 있습니다.

## 전체 코드

```sveltehtml

<script lang="ts">
  import { onMount } from 'svelte';
  import { postMarkdown } from '$lib/posts/store/post-create-stores';

  import '@toast-ui/editor/dist/toastui-editor.css';
  import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';

  import 'prismjs/themes/prism.css';
  import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';

  let markdownEditorEl;
  let markdownEditor;

  const handleImageUpload = (blob, callback) => {
    console.log(blob);
    callback('http://localhost:3000/static/images/logo.png', 'logo.png');
  };

  onMount(async () => {
    const Editor = (await import('@toast-ui/editor')).default;
    const codeSyntaxHighlight = (
        await import(
            '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js'
            )
    ).default;

    markdownEditor = new Editor({
      el: markdownEditorEl,
      initialValue: $postMarkdown.getContent(),
      height: '80vh',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      theme: 'dark',
      plugins: [codeSyntaxHighlight],
      events: {
        change: (editorType) => $postMarkdown.setContent(markdownEditor.getMarkdown())
      },
      hooks: {
        addImageBlobHook: handleImageUpload
      }
    });
  });
</script>

<div bind:this={markdownEditorEl}/>
```

## 마치며

아직 이미지 사이즈는 어떻게 설정할 수 있는지 모르겠습니다.

별도의 미리보기를 만들거라 크게 상관은 없지만, 모두 구현하고 나면 알아보기는 해야겠습니다.

다음에는 `AWS S3`에 직접 업로드 하고 이미지 경로를 서버로 보내 저장하는 부분까지 해보도록 하겠습니다.

## 참고 사이트

- [[React] Toast-UI Editor 이미지 파일 서버 업로드 방법(base64 인코딩 X)](https://curryyou.tistory.com/474)
