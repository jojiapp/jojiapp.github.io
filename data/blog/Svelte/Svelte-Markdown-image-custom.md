---
title: '[Svelte] Markdown Image CSS 적용하기 (약간의 커스텀)'
date: '2022-09-04'
tags: ['Svelte', 'Markdown', 'Markdown CSS', 'marked']
draft: false
summary: 'Markdown Image CSS 적용하기 (약간의 커스텀)'
---

# Markdown Image CSS 적용하기 (약간의 커스텀)

`marked` 라이브러리를 통해 `마크다운`을 `HTML`로 변환하고 `TailwindCSS`로 블로그 `CSS`도 적용했습니다.

그런데 이미지는 이미지 크기 만큼 그냥 들어가버리기 때문에 이미지 크기가 크면 게시글의 대부분을 차지하게 됩니다.

그래서 `width: 50%` 정도로 하면서 비율을 깨뜨리지 않게 `object-fit: cover`를 적용하고 싶었습니다.

여기까지는 단순히 `CSS`만 추가해주면 되는 일이였습니다.

문제는 이미지를 가운데 정렬을 하고 싶은데 이럴려면 `div` 태그로 한번 감싸야 했습니다.

그래서 `마크다운`을 `HTML`로 `변환`하는 `과정`을 조금 손봐야 했습니다.

`marked`에는 `renderer`라는 객체를 플러그인으로 사용하여 각 태그로 변환하는 과정을 커스텀 할 수 있었습니다.

## Renderer

`Renderer`을 이용하여 각 태그 별로 커스텀을 할 수 있습니다.

```ts
const renderer = {
  image(href: string, title: string, text: string) {
    return `
        <div class='post-img-container'>
            <img src=${href} alt=${text} />
        </div>
    `
  },
}
marked.use({ renderer })
```

```css
img {
  width: 50%;
  object-fit: cover;
}
.post-img-container {
  @apply flex items-center justify-center;
}
```

별다른 설명 없어도 이해가 될 것이라 생각합니다.

다른 다양한 태그는 공식사이트에서 확인 할 수 있습니다.

## 마치며

이렇게 열심히 만들었는데 생각해보니 `img 태그`에`margin: auto`를 주면 된다는 것을 글을 쓰며 알았습니다.

나중에 링크할 때 또 커스텀을 해야하니 맛보기로 했다고 생각해야겠습니다.

## 참고 사이트

- [https://marked.js.org/using_pro#renderer](https://marked.js.org/using_pro#renderer)
