export default defineNuxtRouteMiddleware(async (to) => {
  // 排除登录页本身
  if (to.path === '/login') {
    return
  }

  // 只在客户端执行中间件
  if (import.meta.server) {
    return
  }

  try {
    // 调用 API 检查登录状态
    await $fetch('/api/auth/me')
  } catch (e) {
    // 未登录或 token 失效，跳转到登录页
    return navigateTo('/login')
  }
})
