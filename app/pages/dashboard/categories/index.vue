<script setup lang="ts">
import { ref, onMounted } from 'vue'

const categories = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingCategory = ref<any>(null)

const form = ref({ name: '', description: '' })

async function fetchCategories() {
  try {
    loading.value = true
    const response = await $fetch('/api/admin/categories')
    categories.value = response.data
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  try {
    if (editingCategory.value) {
      await $fetch(`/api/admin/categories/${editingCategory.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/admin/categories', { method: 'POST', body: form.value })
    }
    resetForm()
    await fetchCategories()
  } catch (e: any) {
    alert('操作失败：' + e.message)
  }
}

function editCategory(category: any) {
  editingCategory.value = category
  form.value = { name: category.name, description: category.description || '' }
  showForm.value = true
}

async function deleteCategory(categoryId: string) {
  if (!confirm('确定要删除这个分类吗？')) return
  try {
    await $fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
    await fetchCategories()
  } catch (e: any) {
    alert('删除失败：' + e.message)
  }
}

function resetForm() {
  editingCategory.value = null
  form.value = { name: '', description: '' }
  showForm.value = false
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">分类管理</h1>
        <p class="mt-0.5 text-sm text-gray-500">管理文章分类</p>
      </div>
      <button
        v-if="!showForm"
        @click="showForm = true"
        class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
      >
        新建分类
      </button>
    </div>

    <!-- 表单 -->
    <div v-if="showForm" class="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-6">
      <h3 class="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">{{ editingCategory ? '编辑分类' : '新建分类' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-3 md:space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input v-model="form.name" type="text" required class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea v-model="form.description" rows="2" class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{{ editingCategory ? '更新' : '创建' }}</button>
            <button type="button" @click="resetForm" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300">取消</button>
          </div>
        </div>
      </form>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="p-12 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else>
      <!-- 手机卡片 -->
      <div class="md:hidden space-y-3">
        <div v-if="categories.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
          <p class="text-gray-500">暂无分类</p>
        </div>
        <div v-for="cat in categories" :key="cat.id" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-start justify-between mb-1.5">
            <h3 class="text-sm font-semibold text-gray-900">{{ cat.name }}</h3>
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ cat._count.posts }} 篇</span>
          </div>
          <p class="text-xs text-gray-500 mb-2">{{ cat.slug }}</p>
          <p v-if="cat.description" class="text-xs text-gray-600 mb-2">{{ cat.description }}</p>
          <div class="flex gap-3 pt-2.5 border-t border-gray-100">
            <button @click="editCategory(cat)" class="text-blue-600 text-sm font-medium flex-1 text-center">编辑</button>
            <button @click="deleteCategory(cat.id)" :disabled="cat._count.posts > 0" class="text-red-600 text-sm font-medium flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed">删除</button>
          </div>
        </div>
      </div>

      <!-- 桌面表格 -->
      <div class="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <div v-if="categories.length === 0" class="text-center py-12">
          <p class="text-gray-500">暂无分类</p>
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文章数</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cat in categories" :key="cat.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ cat.name }}</div>
                <div class="text-sm text-gray-500">{{ cat.slug }}</div>
              </td>
              <td class="px-6 py-4"><div class="text-sm text-gray-900">{{ cat.description || '-' }}</div></td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ cat._count.posts }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editCategory(cat)" class="text-blue-600 hover:text-blue-900 mr-4">编辑</button>
                <button @click="deleteCategory(cat.id)" :disabled="cat._count.posts > 0" class="text-red-600 hover:text-red-900 disabled:opacity-40">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
