---
title: '[Svelte] Svelte 상태관리'
date: '2022-08-24'
tags: ['Svelte', 'Svelte-Kit']
draft: false
summary: Svelte 상태관리
---

# [Svelte] 상태관리

Svelte를 사용하면서 가장 마음에 들었던 것은 값의 변경을 감지하는 메커니즘이 단순해서였습니다.

클래스화 시켜서 사용을 해도 `obj = obj`처럼만 해주면 감지가 되어 값의 변경이 일어나는게 좋았습니다.

그런데 Props로 넘겨줄려고 하니, 값이 넘어가지 않았습니다.

그러다 문득 Props로 값을 내려줄수 있다고 해도
컴포넌트를 작은 단위로 만들면 Props 전달을 너무 많이 해야할 것 같아 상태 관리에 대해 찾아 보았습니다.

Svelte는 내부적으로 상태 관리가 존재`(svelte/store)`했고 사용법도 아주 간단했습니다.

React를 공부할 때, 리코일을 아주 간단하게 나마 사용해봤기 때문에 더 쉬웠을수도 있습니다.

## writable

writable는 읽기와 쓰기가 모두 가능한 Store입니다.

writable는 3가지 메소드가 존재합니다.

- `set()`: 초기값 설정
- `update()`: 변경값 설정
- `subscribe()`: 해당 Store 구독

저는 값을 바로 사용하는 것 보다 클래스화 시켜 사용하는 것이 좋아
클래스화 시켜 사용할 때 어떻게 사용할 수 있는지 알아보겠습니다.

- `post-category.ts`

```ts
class PostCategory {
  private readonly categories: string[]
  private choice: string

  constructor(categories: string[]) {
    this.categories = categories
    this.choice = categories[0]
  }

  public getCategories(): string[] {
    return [...this.categories]
  }

  public getChoice(): string {
    return this.choice
  }

  public setChoice(choice: string): PostCategory {
    this.choice = choice
    return this
  }
}

export default PostCategory
```

- `post-create-stores.ts`

```ts
import { writable } from 'svelte/store' // 1
import type PostCategory from '../component/category/post-category'

export const postCategories = writable<PostCategory>() // 2
```

우선, Store를 정의합니다.

- `+page`

```sveltehtml

<script lang='ts'>
  import { postCategories } from '$lib/posts/store/post-create-stores';
  import Category from '$lib/posts/component/category/PostCategory.svelte';
  import PostCategory from '$lib/posts/component/category/post-category'; // 1

  export let data;
  postCategories.set(new PostCategory(data.categories)); // 2

</script>

<Category/>
```

postCategories에 초기값을 설정해줍니다.

- `PostCategory.svelte`

```sveltehtml

<script lang='ts'>
  import { categories } from '../../store/post-create-stores'; // 1
  import { onDestroy } from 'svelte';
  import PostCategory from './post-category';

  let categoriesValue: PostCategory; // 2
  let categoriesSubscribe = categories.subscribe(categoriesStore => // 3
      categoriesValue = categoriesStore
  );

  const handleCategoryClick = (category: string) => {
    categoriesValue.setChoice(category); // 4
    categories.update(value => value); // 5
  };

  onDestroy(categoriesSubscribe); // 6
</script>
```

1. postCategories Store Import
2. 값을 담을 변수 생성
3. subscribe 함수를 통해 구독을 합니다.
   1. Store의 값이 변경될 때마다 구독된 함수가 실행 됨
   2. categoriesValue 값이 변경되면서 해당 값이 사용되고 있는 부분 재렌더링
4. 해당 객체 값 변경
5. Store 업데이트를 통해 구독자들에게 변경을 알림 (실제 값이 변경되지 않아도 위처럼 작성해주면 구독자에게 이벤트가 발행 됨)
6. 해당 컴포넌트가 사라지면 onDestroy()함수를 통해 구독을 취소해줍니다.

### writable 간단하게 사용하기

위 코드를 보면 사용법은 아주 간단합니다.

`초기값 설정` - `구독` - `값 변경` - `변경 이벤트 발생` - `구독 취소`

하지만 이 과정 자체가 반복되고 조금 번거롭다고 생각이 되었습니다.

`구독`, `변경 이벤트 발생`, `구독 취소` 해당 부분은 변수명만 다르고 똑같이 사용될 거 같았기 때문입니다.

그래서 찾아 본 결과 `$<store>`처럼 `바로 Store의 값에 접근` 하는 방법이 있었고 자동으로 `구독`, `구독 취소`도 해주었습니다.

사용방법은 아래와 같습니다.

```sveltehtml

<script lang='ts'>

  import { postCategories } from '../../store/post-create-stores'; // 1

  const handleCategoryClick = (category: string) => {
    $postCategories = $postCategories.setChoice(category); // 2
  };
</script>
```

`$postCategories`로 해당 값에 바로 접근이 가능하기에 위처럼 값을 변경하고 할당해주면 구독자에게 이벤트가 발생됨을 확인할 수 있었습니다.

번거롭게 별도의 변수를 만들어서 값을 꺼내서 담고, 구독을 취소를 하고 등 귀찮은 로직없이 그냥 `값을 사용하듯이 바로 사용`하면 됩니다.

단, 변경 감지를 위해 `obj = obj` 형식은 필요합니다.

## 마치며

리코일도 엄청나게 편하다고 느꼈었는데 이건 넘사벽 편함인 것 같습니다.

최근에 리액티브에 대해서 공부했었는데, 딱 해당 내용이라 한번 더 복습도 되고 좋았습니다.

## 참고 사이트

- [[Svelte] Store](https://beomy.github.io/tech/svelte/store/)
