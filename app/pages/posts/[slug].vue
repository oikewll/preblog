<script setup lang="ts">
const route = useRoute()

// 使用 useFetch 进行 SSR 数据获取
const { data: postData, pending: loading, error } = await useFetch(`/api/posts/${route.params.slug}`, {
  transform: (res: any) => res.data
})

const post = computed(() => postData.value)

// 提取第一张图片（如果有）
const coverImage = computed(() => {
  if (!post.value) return null

  // 1. 优先使用 coverImage 字段
  if (post.value.coverImage) {
    return post.value.coverImage
  }

  // 2. 从内容中提取第一张图片
  if (post.value.content) {
    const imgRegex = /<img[^>]+src="([^">]+)"/i
    const match = post.value.content.match(imgRegex)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
})

// 提取纯文本描述
const plainDescription = computed(() => {
  if (!post.value) return '查看文章详情'
  if (post.value.excerpt) return post.value.excerpt
  if (post.value.content) {
    return post.value.content.replace(/<[^>]+>/g, '').slice(0, 160)
  }
  return '查看文章详情'
})

// SEO Meta & 结构化数据
useHead(() => {
  if (!post.value) {
    return {
      title: '文章详情 - My Blog'
    }
  }

  const fullTitle = `${post.value.title} - My Blog`
  const url = `https://note.88931823.xyz/posts/${route.params.slug}`

  return {
    title: fullTitle,
    meta: [
      { name: 'description', content: plainDescription.value },
      { property: 'og:title', content: post.value.title },
      { property: 'og:description', content: post.value.excerpt || plainDescription.value },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      ...(coverImage.value ? [{ property: 'og:image', content: coverImage.value }] : []),
      { name: 'twitter:card', content: coverImage.value ? 'summary_large_image' : 'summary' },
      ...(coverImage.value ? [{ name: 'twitter:image', content: coverImage.value }] : []),
      { name: 'article:author', content: post.value.author?.name },
      { name: 'article:published_time', content: post.value.publishedAt },
      { name: 'article:modified_time', content: post.value.updatedAt }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.value.title,
          description: post.value.excerpt,
          image: coverImage.value,
          datePublished: post.value.publishedAt,
          dateModified: post.value.updatedAt,
          author: {
            '@type': 'Person',
            name: post.value.author.name,
            email: post.value.author.email
          },
          publisher: {
            '@type': 'Organization',
            name: 'My Blog',
            url: 'https://note.88931823.xyz'
          },
          url: url,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url
          }
        })
      }
    ]
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <BlogNav />

    <!-- 主内容 -->
    <main class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
      <!-- 加载 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- 文章内容 -->
      <article v-else-if="post" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- 文章头部 -->
        <div class="px-4 md:px-6 py-6 md:py-8 border-b">
          <div class="flex items-center flex-wrap gap-2 mb-3 md:mb-4">
            <span v-if="post.category" class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {{ post.category.name }}
            </span>
            <span class="text-sm text-gray-500">
              {{ new Date(post.publishedAt).toLocaleDateString('zh-CN') }}
            </span>
            <div class="flex items-center gap-1 ml-auto">
              <span class="text-sm text-gray-500">👁️</span>
              <span class="text-sm text-gray-600">{{ post.views }}</span>
            </div>
          </div>

          <!-- 标题：手机缩小 -->
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            {{ post.title }}
          </h1>

          <p v-if="post.excerpt" class="text-base md:text-xl text-gray-600 mb-3 md:mb-4">
            {{ post.excerpt }}
          </p>

          <!-- 作者 -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span class="text-base md:text-lg font-medium text-gray-600">{{ post.author.name.charAt(0) }}</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ post.author.name }}</p>
              <p v-if="post.author.bio" class="text-sm text-gray-600">{{ post.author.bio }}</p>
            </div>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="px-4 md:px-6 py-6 md:py-8">
          <div class="prose prose-lg max-w-none" v-html="post.content"></div>
        </div>

        <!-- 标签 -->
        <div v-if="post.tags.length > 0" class="px-4 md:px-6 py-4 border-t bg-gray-50">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in post.tags"
              :key="item.tag.id"
              class="px-3 py-1 text-sm bg-white text-gray-700 rounded-full border hover:bg-gray-100 transition-colors cursor-pointer"
            >
              #{{ item.tag.name }}
            </span>
          </div>
        </div>
      </article>

      <!-- 返回链接 -->
      <div class="mt-6">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm font-medium">← 返回列表</NuxtLink>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-8 md:mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <p class="text-center text-gray-600 text-sm">© 2025 My Blog. Powered by Nuxt 4</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.prose {
  line-height: 1.8;
  color: #374151;
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .prose { font-size: 1rem; }
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  color: #111827;
}

.prose :deep(h1) { font-size: 1.75em; }
.prose :deep(h2) { font-size: 1.5em; }
.prose :deep(h3) { font-size: 1.25em; }

.prose :deep(p) { margin-bottom: 1.25em; }

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
  word-break: break-all;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin-bottom: 1.5em;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  word-break: normal;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 1.25em;
}

.prose :deep(li) { margin-bottom: 0.5em; }

.prose :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1em;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 1.25em;
}

.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5em;
}
</style>
