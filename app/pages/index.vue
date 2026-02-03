<script setup lang="ts">
import { ref, watch } from 'vue'

const route = useRoute()
const selectedCategory = ref<string | null>(null)
const mobileCatOpen = ref(false)

// 使用 useFetch 进行 SSR 数据获取
const { data: categoriesData, pending: categoriesLoading } = await useFetch('/api/categories', {
  transform: (res: any) => res.data
})

const { data: postsData, pending: postsLoading, error, refresh } = await useFetch('/api/posts', {
  query: {
    category: selectedCategory
  },
  transform: (res: any) => res.data.posts,
  watch: [selectedCategory]
})

const posts = computed(() => postsData.value || [])
const categories = computed(() => categoriesData.value || [])
const loading = computed(() => postsLoading.value || categoriesLoading.value)

// SEO Meta
useSeoMeta({
  title: '首页 - My Blog',
  description: '分享技术、思考和生活点滴的博客',
  ogTitle: 'My Blog',
  ogDescription: '分享技术、思考和生活点滴的博客',
  ogType: 'website',
  twitterCard: 'summary'
})

// 结构化数据
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'My Blog',
        description: '分享技术、思考和生活点滴的博客',
        url: 'https://note.88931823.xyz',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://note.88931823.xyz/?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }))
    }
  ]
})

watch(selectedCategory, () => {
  refresh()
})

// 从 URL 参数读取分类
onMounted(() => {
  if (route.query.category) {
    selectedCategory.value = route.query.category as string
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <BlogNav />

    <!-- 主内容 -->
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 md:py-8">

      <!-- 手机分类选择（水平 pills） -->
      <div class="md:hidden mb-4">
        <button
          class="flex items-center justify-between w-full bg-white rounded-lg shadow-sm px-4 py-3 text-sm text-gray-700"
          @click="mobileCatOpen = !mobileCatOpen"
        >
          <span class="font-medium">📁 {{ selectedCategory ? (categories.find((c: any) => c.slug === selectedCategory)?.name || '全部') : '全部文章' }}</span>
          <svg class="w-4 h-4 transition-transform" :class="mobileCatOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="mobileCatOpen" class="mt-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            @click="selectedCategory = null; mobileCatOpen = false"
            class="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
            :class="selectedCategory === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'"
          >
            <span>全部文章</span>
            <span class="text-xs text-gray-400">{{ posts.length }}</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.slug; mobileCatOpen = false"
            class="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
            :class="selectedCategory === cat.slug ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'"
          >
            <span>{{ cat.name }}</span>
            <span class="text-xs text-gray-400">{{ cat._count?.posts ?? 0 }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-6 md:gap-8">

        <!-- 桌面侧栏：分类 -->
        <aside class="hidden md:block w-64 shrink-0">
          <div class="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="mr-2">📁</span> 分类
            </h3>
            <ul class="space-y-1">
              <li>
                <button
                  @click="selectedCategory = null"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="selectedCategory === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'"
                >
                  <span>全部文章</span>
                  <span class="text-xs text-gray-400">{{ posts.length }}</span>
                </button>
              </li>
              <li v-for="cat in categories" :key="cat.id">
                <button
                  @click="selectedCategory = cat.slug"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="selectedCategory === cat.slug ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'"
                >
                  <span>{{ cat.name }}</span>
                  <span class="text-xs text-gray-400">{{ cat._count?.posts ?? 0 }}</span>
                </button>
              </li>
            </ul>
            <div class="mt-5 pt-4 border-t border-gray-100">
              <NuxtLink to="/categories" class="block text-sm text-blue-600 hover:text-blue-800 font-medium">查看全部分类 →</NuxtLink>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span class="mr-1">🏷️</span> 标签
              </h4>
              <NuxtLink to="/tags" class="block text-sm text-blue-600 hover:text-blue-800 font-medium">查看全部标签 →</NuxtLink>
            </div>
          </div>
        </aside>

        <!-- 文章列表 -->
        <main class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-4 md:mb-6">
            <h2 class="text-lg md:text-xl font-bold text-gray-900">
              {{ selectedCategory ? categories.find((c: any) => c.slug === selectedCategory)?.name : '全部文章' }}
            </h2>
            <span class="text-sm text-gray-500">{{ posts.length }} 篇</span>
          </div>

          <!-- 加载 -->
          <div v-if="loading" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-500">加载中...</p>
          </div>

          <!-- 错误 -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
            <p class="text-red-800">{{ error }}</p>
          </div>

          <!-- 文章列表 -->
          <div v-else class="space-y-3 md:space-y-4">
            <div v-if="posts.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm">
              <p class="text-gray-500 text-lg">该分类暂无文章</p>
            </div>

            <article
              v-for="post in posts"
              :key="post.id"
              class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <NuxtLink :to="`/posts/${post.slug || post.id}`" class="block p-4 md:p-6">
                <!-- 顶行：分类 + 日期 -->
                <div class="flex items-center justify-between mb-2 md:mb-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span v-if="post.category" class="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {{ post.category.name }}
                    </span>
                    <span class="text-xs text-gray-400">
                      {{ new Date(post.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-gray-400">
                    <span>👁️</span>
                    <span>{{ post.views || 0 }}</span>
                  </div>
                </div>

                <!-- 标题 -->
                <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-1.5 md:mb-2 hover:text-blue-600 transition-colors">
                  {{ post.title }}
                </h2>

                <!-- 摘要 -->
                <p v-if="post.excerpt" class="text-gray-500 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">
                  {{ post.excerpt }}
                </p>

                <!-- 底行：作者 + 标签 -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 md:w-7 md:h-7 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-semibold text-blue-700">{{ post.author.name.charAt(0) }}</span>
                    </div>
                    <span class="text-sm text-gray-600">{{ post.author.name }}</span>
                  </div>
                  <div v-if="post.tags && post.tags.length > 0" class="flex items-center gap-1.5">
                    <span
                      v-for="item in post.tags.slice(0, 2)"
                      :key="item.tag.id"
                      class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      #{{ item.tag.name }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>
        </main>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-10 md:mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        <p class="text-center text-gray-500 text-sm">© 2025 My Blog · Powered by Nuxt 4</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
