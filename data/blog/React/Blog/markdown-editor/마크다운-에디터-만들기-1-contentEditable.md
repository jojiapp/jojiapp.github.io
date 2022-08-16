---
title: '[React] 마크다운 에디터 만들기 1. contentEditable 속성'
date: '2022-08-17'
tags: ['React', 'Markdown-Editor', 'Blog']
draft: false
summary: contentEditable 속성을 이용하여 마크다운 에디터 만들기
---

# [React] 마크다운 에디터 만들기 1. contentEditable 속성

저는 NextJS와 tailwindCSS로 만든 블로그 템플릿을 가져와서 블로그로 사용 중이였습니다.

사용법은 간단했습니다. 특정 폴더에 마크다운 파일을 만들면 자동으로 읽어 포스팅을 해주었습니다.

하지만, 직접 마크다운 파일을 만들다 보니 불편한 점이 많았습니다.

- 인텔리제이를 사용하고 있기 때문에 마크다운 미리보기를 할 수 있지만, 포스팅된 것과는 무관하다는 단점
- 이미지를 넣을려면 이미지를 public 폴더에 넣고 경로를 잡아주어야 함. 이렇기 때문에 마크다운이 모두 같은 뎁스가 아니면 경로 잡기가 어려워 미리보기에서 보기가 힘듦
- 이미지를 그냥 복붙 해서 빠르게 사용하고 싶은데 그럴 수 없음 (이게 가장 큼)

그래서 느슨해진 열정을 돋울겸 사이드 프로젝트로 만들어야겠다 ! 라고 생각했습니다.

제가 원하는 기능은 간단합니다.

- 마크다운으로 작성하면 미리보기를 눌렀을 때, 실제 포스팅 된 것과 같은 미리보기 제공
- 이미지 클립보드로 복사, 붙여넣기
- 태그
- 본문 포함 검색
- SEO
- 마크다운으로 내려받기

그래서 마크다운 에디터 부터 테스트를 해보기 위해 마크다운 에디터 라이브러리를 테스트 해보았습니다.

## @toast-ui/editor

`@toast-ui/editor` 라이브러리가 많이 사용된다고 하여 적용해보려 하였습니다.

하지만, `React 17` 버전까지만 지원을 한다는 에러가 발생했습니다.

제가 만들 당시 `React는 18`이기 때문에 버전을 내리는 선택은 별로 하고싶지 않았습니다.

패스

## @uiw/react-md-editor

다음으로 해당 라이브러리도 많이 사용된다고 하여 사용해보려 하였습니다.

`NextJS + Typescript`를 사용하여 만들 계획인데 공식 문서 및 각종 블로그에 나와있는 예제를 똑같이 따라하여도 에러가 발생했습니다.

패스

## 그냥 직접 만들자

어차피 대단한 거 할것도 아니고, 마크다운으로 작성(에디터 없이 직접 작성) + 이미지 복붙이 하고 싶었던 거기 때문에 그냥 직접 만들기로 하였습니다.

`textarea`태그를 사용하면 되겠지? 하며 간단하게 생각했지만 `textarea`는 이미지는 물론 노션처럼 값들을 커스텀 할 수는 없다고 되어있었습니다.

그러던 중 찾은 속성이 `contentEditable` 입니다. (이제서야 본론)

## contentEditable 속성 사용

```tsx
const Test: NextPage = () => {
  const [markdown, setMarkdown] = useState('')
  console.log(markdown)
  return (
    <div>
      <div
        contentEditable={true}
        onInput={(e) =>
          setMarkdown(e.currentTarget.textContent === null ? '' : e.currentTarget.textContent)
        }
      ></div>
    </div>
  )
}

export default Test
```

위 처럼 `div` 태그에 `contentEditable` 속성을 `true`로 주면 마치 `textarea`처럼 글을 작성할 수 있습니다.
또한, 이미지도 넣을 수가 있습니다.

하지만, 해당 값은 `textarea`와 다르게 `form`을 통해 보낼수 없습니다. (어차피 form은 안쓸거지만)

그래서 별도의 `state`에 값을 담도록 `onInput` 이벤트를 구현하였습니다.

입력하는 값이 `state`에 잘 들어오는 것 까지 확인이 완료되었고, 다음은 이미지 클립보드 복사, 붙여넣기 기능을 테스트해 볼 예정입니다.

## 마치며

얼른 만들어서 블로그를 옮기고 싶은데 이번에 업데이트 된 `React 18`이 생각보다 까다로운거 같아 걱정입니다.
