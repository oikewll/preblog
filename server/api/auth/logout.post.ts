export default defineEventHandler(async (event) => {
  // 清除 cookie
  deleteCookie(event, 'auth-token')

  return {
    success: true,
    message: '登出成功'
  }
})
