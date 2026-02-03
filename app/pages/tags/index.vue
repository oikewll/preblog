<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tags = ref<any[]>([])
const loading = ref(true)

async function fetchTags() {
  try {
    loading.value = true
    const response = await $fetch('/api/tags')
    tags.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <BlogNav />

    <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">文章标签</h1>
        <p class="mt-1 text-gray-600 text-sm md:text-base">通过标签发现相关内容</p>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- 标签云 -->
      <div v-else class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/?tag=${tag.slug}`"
          class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 block"
        >
          <span class="font-medium text-gray-900">#{{ tag.name }}</span>
          <span class="ml-2 text-sm text-gray-500">({{ tag._count.posts }})</span>
        </NuxtLink>
      </div>

      <div v-if="!loading && tags.length === 0" class="text-center py-12">
        <p class="text-gray-600">暂无标签</p>
      </div>
    </main>

    <footer class="bg-white border-t mt-10 md:mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <p class="text-center text-gray-600 text-sm">© 2025 My Blog. Powered by Nuxt 4</p>
      </div>
    </footer>
  </div>
</template>
