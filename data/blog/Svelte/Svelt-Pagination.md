---
title: '[Svelte] SvelteKit Pagination'
date: '2022-09-07'
tags: ['Svelte', 'Pagination']
draft: false
summary: 'SvelteKit Pagination'
---

# [Svelte] SvelteKit Pagination

`SvelteKit`에서 페이지네이션을 구현하는 방법에 대해 알아보겠습니다.

페이지네이션을 구현하기 위해서는 `querystring`으로 페이지 정보를 받아와서
페이지에 해당하는 게시글을 조회하면 됩니다.

## QueryString 값 조회

`+page.ts` 파일에서 파라미터로 `url`을 받을 수 있습니다.

해당 `url`에서 `querystring`을 추출할수 있습니다.

또한 페이징이 여러곳에서 필요하다면 현재 route 경로 (엄밀히 말하면 폴더 경로)를 주는 `routeId`를 이용 할 수 있습니다.

저는 그냥 사용하기 보단 클래스화 시켜 사용하였습니다.

- `PostPageDTO`

```ts
class PostPageDTO {
  private readonly page: number
  private readonly size: number

  constructor(page: number) {
    this.page = page > 0 ? page : 1
    this.size = 10
  }

  public getPage(): number {
    return this.page
  }

  public getSize(): number {
    return this.size
  }
}

export default PostPageDTO
```

- `PostPaginationDTO`

```ts
class PostPaginationDTO {
  private readonly currentPage: number
  private readonly lastPage: number
  private readonly routeId: string

  constructor(currentPage: number, lastPage: number, routeId: string) {
    this.currentPage = currentPage
    this.lastPage = lastPage
    this.routeId = routeId
  }

  public getCurrentPage(): number {
    return this.currentPage
  }

  public getPreviousPage(): string {
    return this.getPage(this.currentPage - 1)
  }

  public getNextPage(): string {
    return this.getPage(this.currentPage + 1)
  }

  private getPage(page: number): string {
    return `/${this.getRouteId()}?page=${page}`
  }

  public isFirstPage(): boolean {
    return this.getCurrentPage() === 1
  }

  public isLastPage(): boolean {
    return this.getCurrentPage() >= this.lastPage
  }

  public getLastPage(): number {
    return this.lastPage
  }

  public getRouteId(): string {
    return this.routeId
  }
}

export default PostPaginationDTO
```

- `+page.ts`

```ts
export type PostsPage = {
  postItems: PostItemDTO[];
  postPagination: PostPaginationDTO;
};

// /blog?page=1
export const load: PageLoad<PostsPage> = async ({ url, routeId }) => {
  const postPage = new PostPageDTO(Number(url.searchParams.get('page')));

  const postItems = axios.get(...);
  const postPagination = new PostPaginationDTO(postPage.getPage(), 10, routeId ? routeId : 'blog');

  return {
    postItems,
    postPagination
  }
}
```

## Pagination 만들기

- `+page.svelte`

```sveltehtml

<script lang=ts>
  export let data;
  let postItems = data.postItems;
  let postPagination = data.postPagination;
</script>

<Posts {postItems} {postPagination}/>
```

- `Posts.svelte`

```sveltehtml

<script lang="ts">
  import PostItem from '$lib/posts/component/list/PostItem.svelte';
  import PostPaginationDTO from '../../dto/postPaginationDTO';
  import PostItemDTO from '../../dto/postItemDTO';
  import PostPagination from '$lib/posts/component/list/PostPagination.svelte';

  export let postItems: PostItemDTO[];
  export let postPagination: PostPaginationDTO;
</script>

<section>
  {#each postItems as post}
    <PostItem {post}/>
  {/each}
  <PostPagination {postPagination}/>
</section>
```

- `PostPagination.svelte`

```sveltehtml

<script lang="ts">
  import PostPaginationDTO from '../../dto/postPaginationDTO';

  export let postPagination: PostPaginationDTO;

  const handleLinkOnClick = (href: string) => {
    location.href = href;
  };
</script>

<div class="mt-12 flex justify-center">
  {#if postPagination.isFirstPage()}
    <button class="cursor-default text-gray-400">Previous</button>
  {:else}
    <button on:click={() => handleLinkOnClick(postPagination.getPreviousPage())}>Previous</button>
  {/if}

  <div class="mx-12 flex gap-2">
    <div>{postPagination.getCurrentPage()}</div>
    <div>of</div>
    <div>{postPagination.getLastPage()}</div>
  </div>

  {#if postPagination.isLastPage()}
    <button class="cursor-default text-gray-400">Next</button>
  {:else}
    <button on:click={() => handleLinkOnClick(postPagination.getNextPage())}>Next</button>
  {/if}
</div>
```

`PostItem`부분은 중요한게 아니니 생략했습니다.

여기서 보면 `a 태그`를 사용하지 않고 `click 이벤트`를 넣어 `location.href`를 직접 호출한 것을 볼 수 있습니다.

처음에는 `a 태그`를 사용하여 호출 하려 했지만, 어떤 이유인지 `+page.ts`가 동작하지 않았습니다. (아마 내부적으로 최적화를 하기 떄문에 발생하는 문제 같습니다.)

그래서 정말 페이지를 새로 렌더링 하도록 `location.href`를 사용하였고 잘 동작합니다.

그리고 `PostPaginationDTO`를 보면 `routeId`를 이용해서 경로를 만들기 때문에 여러곳에서 사용할 수 있습니다.

- `blog`: `blog?page=1`
- `search`: `search?page=1` 등

## 마치며

핵심 내용은 `a 태그` 대신 `location.href`를 직접 핸들링 해야 `+page.ts`가 다시 실행된다는 것입니다.

간단하게 클래스화 시켰는데 프론트는 대부분 이런식으로 사용하지 않는 것을 알고 있습니다.

하지만 프론트도 이렇게 사용해도 충분히 좋은것 같습니다.
