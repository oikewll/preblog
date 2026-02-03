<script setup lang="ts">
import { ref, onMounted } from 'vue'

const categories = ref<any[]>([])
const loading = ref(true)

async function fetchCategories() {
  try {
    loading.value = true
    const response = await $fetch('/api/categories')
    categories.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <BlogNav />

    <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">文章分类</h1>
        <p class="mt-1 text-gray-600 text-sm md:text-base">浏览不同主题的文章</p>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- 分类 grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/?category=${category.slug}`"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5 md:p-6 block"
        >
          <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-1.5 md:mb-2">{{ category.name }}</h2>
          <p v-if="category.description" class="text-gray-600 text-sm mb-3 md:mb-4">{{ category.description }}</p>
          <div class="flex items-center text-sm text-gray-500">
            <span>{{ category._count.posts }} 篇文章</span>
          </div>
        </NuxtLink>
      </div>
    </main>

    <footer class="bg-white border-t mt-10 md:mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <p class="text-center text-gray-600 text-sm">© 2025 My Blog. Powered by Nuxt 4</p>
      </div>
    </footer>
  </div>
</template>
