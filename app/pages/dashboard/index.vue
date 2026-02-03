<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

const statusFilter = ref('all')
const searchQuery = ref('')

async function fetchPosts() {
  try {
    loading.value = true
    const query: any = { page: page.value, pageSize: pageSize.value }
    if (statusFilter.value !== 'all') query.status = statusFilter.value
    if (searchQuery.value) query.search = searchQuery.value

    const response = await $fetch('/api/admin/posts', { params: query })
    posts.value = response.data.posts
    total.value = response.data.pagination.total
    totalPages.value = response.data.pagination.totalPages
  } catch (e: any) {
    error.value = e.message
    console.error('Failed to fetch posts:', e)
  } finally {
    loading.value = false
  }
}

async function handleDelete(postId: string) {
  if (!confirm('确定要删除这篇文章吗？')) return
  try {
    await $fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' })
    await fetchPosts()
  } catch (e: any) {
    alert('删除失败：' + e.message)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}

// onMounted 只在客户端执行，不需要检查
onMounted(() => {
  fetchPosts()
})

watch([statusFilter, searchQuery], () => {
  page.value = 1
  fetchPosts()
})

watch(page, () => {
  fetchPosts()
})
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">文章管理</h1>
        <p class="mt-0.5 text-sm text-gray-500">管理所有文章内容</p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
      >
        新建文章
      </NuxtLink>
    </div>

    <!-- 筛选 -->
    <div class="bg-white shadow rounded-lg p-3 md:p-4 mb-4 md:mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <div v-else>
      <!-- 手机卡片列表 -->
      <div class="md:hidden space-y-3">
        <div v-if="posts.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
          <p class="text-gray-500">暂无文章</p>
        </div>
        <div v-for="post in posts" :key="post.id" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-sm font-semibold text-gray-900 flex-1 mr-3">{{ post.title }}</h3>
            <span
              class="px-2 py-0.5 text-xs font-semibold rounded-full shrink-0"
              :class="post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >{{ post.published ? '已发布' : '草稿' }}</span>
          </div>
          <p v-if="post.excerpt" class="text-xs text-gray-500 mb-2 line-clamp-1">{{ post.excerpt }}</p>
          <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span v-if="post.category" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{{ post.category.name }}</span>
            <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
            <span class="ml-auto">👁️ {{ post.views }}</span>
          </div>
          <div class="flex gap-3 pt-3 border-t border-gray-100">
            <NuxtLink :to="`/dashboard/posts/${post.id}`" class="text-blue-600 text-sm font-medium flex-1 text-center">编辑</NuxtLink>
            <button @click="handleDelete(post.id)" class="text-red-600 text-sm font-medium flex-1 text-center">删除</button>
          </div>
        </div>
      </div>

      <!-- 桌面表格 -->
      <div class="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <div v-if="posts.length === 0" class="text-center py-12">
          <p class="text-gray-500">暂无文章</p>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="post in posts" :key="post.id">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                <div class="text-sm text-gray-500">{{ post.excerpt?.substring(0, 50) }}...</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="post.category" class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ post.category.name }}</span>
                <span v-else class="text-sm text-gray-400">无分类</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 text-xs font-semibold rounded-full" :class="post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ post.published ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(post.publishedAt || post.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ post.views }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink :to="`/dashboard/posts/${post.id}`" class="text-blue-600 hover:text-blue-900 mr-4">编辑</NuxtLink>
                <button @click="handleDelete(post.id)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button v-if="page > 1" @click="page--" class="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">上一页</button>
        <span class="text-sm text-gray-600">{{ page }} / {{ totalPages }}</span>
        <button v-if="page < totalPages" @click="page++" class="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
