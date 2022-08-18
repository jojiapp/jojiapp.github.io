---
title: '[Svelte] 반응형'
date: '2022-08-18'
tags: ['Svelte']
draft: false
summary: Svelte 반응형
---

# [Svelte] 반응형

이번에 개인 블로그를 만들 계획을 하면서 여러가지 알아보던 중 Svelte가 눈에 들어왔습니다.

저는 React + Next JS를 한 번 뽀짝거린 경험이 있기 때문에
이번에는 다른 라이브러리를 사용하고 싶었습니다.

이유는 다른 라이브러리를 사용해봐야 각 라이브러리의 장단점이 확연하게 이해가 되고
조금 더 비판적인 시각으로 코드를 볼 수 있기 때문입니다.

그 중 Svelte를 선택한 이유는 컴파일을 하면 순수 자바스크립트로 결과물이 만들어지고,
가상DOM을 사용하지 않아 React, Vue에 비해 훨씬 좋은 성능을 낸다고 하여 궁금해졌습니다. (+ 요즘 뜬다고 해요)

React는 상태값이 변경되면 컴포넌트가 재렌더링 되고, 재렌더링된 가상DOM을 만들어 기존의 DOM과 비교하여 값이 바뀐 부분이 있으면
바뀐 부분만 수정하는 식으로 동작합니다. useState같은 hooks를 이용하여 상태값을 관리하게 됩니다.

Svelte는 React보다 훨씬 간단하게 사용할 수 있습니다.

```sveltehtml
<script lang="ts">
  let count = 0

  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment}>
  count is {count}
</button>

```

놀랍게도 그냥 변수를 선언하고 해당 변수를 수정하면 반영이 됩니다.

## 특이한 규칙

여기에는 한가지 중요한 규칙이 있습니다.

실제 해당 객체가 변경되는 것을 감지하는 것이 아니라, 사용되고 있는 변수의 양식에 맞는 것만 감지한다는 것입니다.

이게 무슨 소리인지 이해가 잘 안될테니 코드로 보여드리겠습니다.

```sveltehtml
<script lang="ts">

  const obj = {
    foo: {
      count: 1
    }
  }
  let a = obj.foo

  const increment = () => {
    a.count += 1
  }
</script>

<button on:click={increment}>
  count is {a.count}
  count is {obj.foo.count}
</button>
```

여기서 `a`랑 `obj.foo`는 동일한 객체이기 때문에 둘 중 하나의 `count`값이 변경되어도 두 개가 같이 변경됩니다. (참조변수이니 너무나 당연한 말)

그런데 위 로직의 결과는 놀랍게도 `count is {a.count}` 부분만 감지가 됩니다.

```sveltehtml
<script lang="ts">

  let obj = {
    foo: {
      count: 1
    }
  }
  let a = obj.foo

  const increment = () => {
    a.count += 1
    obj = obj
  }
</script>

<button on:click={increment}>
  count is {a.count}
  count is {obj.foo.count}
</button>
```

위 처럼 `obj = obj`를 넣어주면 해당 객체를 감지하여 `count is {obj.foo.count}` 부분도 값이 변경되는 것을 확인 할 수 있었습니다.

## 오히려 좋아

저는 백엔드 개발자여서 그런지 `class`로 사용하는 것이 결합도를 낮추고 응집도를 높이는 측면에서 좋다고 생각하는 편인데
`React`는 `function`기반을 권장하기 때문에 상당히 마음이 불편했습니다.

물론 class로 만들어 state에 `new Class`하여 넣으면 되기는 하겠지만, 그게 `React`가 추구하는 방향이랑 맞지 않다고 생각했습니다.

그런데 Svelte는 위처럼 동작을 한다고 하니 클래스화 시켜서 값을 변경하고 `obj = obj` 같은 로직만 마지막에 추가해주면 되는거 아니야? 하는 생각이 들었고 테스트를 해보았습니다.

```ts
class Count {
  private count: number = 0

  public getCount(): number {
    return this.count
  }

  public addCount(): void {
    this.count += 1
  }
}

export default Count
```

```sveltehtml
<script lang="ts">
  import Count from './Count'

  let count = new Count()

  const increment = () => {
    count.addCount()
    count = count
  }
</script>

<button on:click={increment}>
  count is {count.getCount()}
</button>
```

예상한대로 값이 잘 변경되는 것을 확인할 수 있었습니다.

## 아쉬운 점

변수를 재할당해야 해야 감지가 되기 때문에 `let`으로 선언해야 한다는 점입니다.  
사실상 불변객체로 사용되는데 `let`으로 선언하여 가변객체로써 존재한다는 점이 아쉽습니다.

## 마치며

클래스화 시켜서 사용하기에도 편리한 것 같고
React에 비하면 문법도 굉장히 심플한 것 같아 마음에 듭니다.

SvelteKit을 사용하면 SSR도 가능하다고 하니 기술 블로그 만드는데 도입하기로 결정하였습니다.

우선 기술 블로그를 만들면서 어떻게 이렇게 동작하는 것인지는 하나씩 알아보도록 하겠습니다.
