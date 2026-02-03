<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: false,
  middleware: false  // 禁用中间件
})

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''

  if (!form.email || !form.password) {
    error.value = '请填写所有字段'
    return
  }

  try {
    loading.value = true
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })

    if (response.success) {
      // 登录成功，跳转到管理后台首页
      await navigateTo('/dashboard')
    }
  } catch (e: any) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/标题 -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          博客管理后台
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          使用管理员账户登录
        </p>
      </div>

      <!-- 登录表单 -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="邮箱"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- 登录按钮 -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>

        <!-- 提示信息 -->
        <div class="text-center">
          <p class="text-xs text-gray-500">
            测试账号: admin@example.com / admin123
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
