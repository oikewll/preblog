<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tags = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingTag = ref<any>(null)

const form = ref({ name: '' })

async function fetchTags() {
  try {
    loading.value = true
    const response = await $fetch('/api/admin/tags')
    tags.value = response.data
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  try {
    if (editingTag.value) {
      await $fetch(`/api/admin/tags/${editingTag.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/admin/tags', { method: 'POST', body: form.value })
    }
    resetForm()
    await fetchTags()
  } catch (e: any) {
    alert('操作失败：' + e.message)
  }
}

function editTag(tag: any) {
  editingTag.value = tag
  form.value = { name: tag.name }
  showForm.value = true
}

async function deleteTag(tagId: string) {
  if (!confirm('确定要删除这个标签吗？')) return
  try {
    await $fetch(`/api/admin/tags/${tagId}`, { method: 'DELETE' })
    await fetchTags()
  } catch (e: any) {
    alert('删除失败：' + e.message)
  }
}

function resetForm() {
  editingTag.value = null
  form.value = { name: '' }
  showForm.value = false
}

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">标签管理</h1>
        <p class="mt-0.5 text-sm text-gray-500">管理文章标签</p>
      </div>
      <button
        v-if="!showForm"
        @click="showForm = true"
        class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
      >
        新建标签
      </button>
    </div>

    <!-- 表单 -->
    <div v-if="showForm" class="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-6">
      <h3 class="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">{{ editingTag ? '编辑标签' : '新建标签' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input v-model="form.name" type="text" required class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">{{ editingTag ? '更新' : '创建' }}</button>
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
      <div class="md:hidden space-y-2">
        <div v-if="tags.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
          <p class="text-gray-500">暂无标签</p>
        </div>
        <div v-for="tag in tags" :key="tag.id" class="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
          <div>
            <span class="text-sm font-semibold text-gray-900">#{{ tag.name }}</span>
            <span class="ml-2 text-xs text-gray-400">{{ tag.slug }}</span>
            <span class="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ tag._count.posts }}</span>
          </div>
          <div class="flex gap-3 shrink-0">
            <button @click="editTag(tag)" class="text-blue-600 text-sm font-medium">编辑</button>
            <button @click="deleteTag(tag.id)" class="text-red-600 text-sm font-medium">删除</button>
          </div>
        </div>
      </div>

      <!-- 桌面表格 -->
      <div class="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <div v-if="tags.length === 0" class="text-center py-12">
          <p class="text-gray-500">暂无标签</p>
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文章数</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tag in tags" :key="tag.id">
              <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">{{ tag.name }}</div></td>
              <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-500">{{ tag.slug }}</div></td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{{ tag._count.posts }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editTag(tag)" class="text-blue-600 hover:text-blue-900 mr-4">编辑</button>
                <button @click="deleteTag(tag.id)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
