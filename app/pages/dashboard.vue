<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 应用认证中间件
definePageMeta({
  middleware: 'auth'
})

const user = ref<any>(null)
const loading = ref(true)
const logoutLoading = ref(false)
const sidebarOpen = ref(false)

async function fetchUser() {
  try {
    const response = await $fetch('/api/auth/me')
    user.value = response.data
  } catch (e) {
    await navigateTo('/login')
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try {
    logoutLoading.value = true
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  } catch (e) {
    console.error('登出失败', e)
  } finally {
    logoutLoading.value = false
  }
}

// 只在客户端执行
onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 加载 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 后台内容 -->
    <div v-else class="flex flex-col min-h-screen">
      <!-- 顶部导航 -->
      <nav class="bg-white shadow-sm sticky top-0 z-30">
        <div class="max-w-full mx-auto px-3 sm:px-6">
          <div class="flex justify-between h-14 md:h-16 items-center">
            <!-- 左侧：汉堡 + 标题 -->
            <div class="flex items-center gap-3">
              <!-- 手机汉堡菜单 -->
              <button
                class="md:hidden p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                @click="sidebarOpen = !sidebarOpen"
              >
                <svg v-if="!sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h1 class="text-base md:text-xl font-bold text-gray-900">管理后台</h1>
            </div>
            <!-- 右侧：用户 + 登出 -->
            <div class="flex items-center gap-2 md:gap-4">
              <span class="hidden sm:inline text-sm text-gray-700">{{ user?.name }}</span>
              <button
                @click="handleLogout"
                :disabled="logoutLoading"
                class="px-2.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {{ logoutLoading ? '...' : '登出' }}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- 手机侧栏遮光层 -->
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" @click="sidebarOpen = false"></div>

      <!-- 布局 -->
      <div class="flex flex-1">
        <!-- 侧边栏 -->
        <aside
          class="fixed md:static inset-y-0 left-0 z-20 w-64 bg-white shadow-sm transform transition-transform duration-200 md:translate-x-0 flex flex-col"
          :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
          :style="{ top: '56px' }"
        >
          <nav class="mt-3 px-2 space-y-1 flex-1">
            <NuxtLink
              to="/dashboard"
              class="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              active-class="bg-blue-50 text-blue-600"
              @click="sidebarOpen = false"
            >
              <span class="mr-3">📝</span> 文章管理
            </NuxtLink>
            <NuxtLink
              to="/dashboard/categories"
              class="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              active-class="bg-blue-50 text-blue-600"
              @click="sidebarOpen = false"
            >
              <span class="mr-3">📁</span> 分类管理
            </NuxtLink>
            <NuxtLink
              to="/dashboard/tags"
              class="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              active-class="bg-blue-50 text-blue-600"
              @click="sidebarOpen = false"
            >
              <span class="mr-3">🏷️</span> 标签管理
            </NuxtLink>
            <div class="pt-4 mt-4 border-t border-gray-200">
              <NuxtLink
                to="/"
                class="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
                @click="sidebarOpen = false"
              >
                <span class="mr-3">🔙</span> 返回网站
              </NuxtLink>
            </div>
          </nav>
        </aside>

        <!-- 主内容区 -->
        <main class="flex-1 p-3 md:p-6 overflow-x-hidden">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>
