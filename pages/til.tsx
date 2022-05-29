import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { InferGetStaticPropsType } from 'next'
import { PostFrontMatter } from '../types/PostFrontMatter'

export const POSTS_PER_PAGE = 5

// @ts-ignore
export const getStaticProps: () => Promise<{
  props: {
    pagination: { folder: 'blog' | 'til'; totalPages: number; currentPage: number }
    initialDisplayPosts: PostFrontMatter[]
    posts: PostFrontMatter[]
  }
}> = async () => {
  const posts = await getAllFilesFrontMatter('til')
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    folder: 'til',
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return { props: { initialDisplayPosts, posts, pagination } }
}

export default function Blog({
  posts,
  initialDisplayPosts,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={`TIL - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="TIL Posts"
      />
    </>
  )
}
