---
title: '[Svelte] 동적 CSS 적용'
date: '2022-08-23'
tags: ['Svelte']
draft: false
summary: '[Svelte] 동적 CSS 적용'
---

# [Svelte] 동적 CSS 적용

해당 값이 `true`일 때는 클래스를 추가하고 아니면 추가하지 않고 같은 로직은 자주 사용됩니다.

Svelte에서는 간단하게 해당 기능을 지원합니다.

```sveltehtml

<div class:hidden={!active}/>
```

`class:<클래스이름>`처럼 작성을 하면 `true`일 때만 해당 클래스 이름이 추가됩니다.

## 참고 사이트

- [동적 css 적용방법](https://freeseamew.gitbook.io/svelte/5./untitled)
