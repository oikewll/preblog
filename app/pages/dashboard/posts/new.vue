<script setup lang="ts">
import { ref, onMounted } from 'vue'

const router = useRouter()

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  published: false,
  categoryId: '',
  tags: [] as string[]
})

const categories = ref<any[]>([])
const tags = ref<any[]>([])
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const showPreview = ref(false)
const previewContent = ref('')

// 实时预览 markdown
function updatePreview() {
  if (import.meta.client) {
    const markdown = form.value.content
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full" />')
      .replace(/\n/gim, '<br />')

    previewContent.value = html
  }
}

// 获取分类列表
async function fetchCategories() {
  try {
    const response = await $fetch('/api/admin/categories')
    categories.value = response.data
  } catch (e: any) {
    console.error('Failed to fetch categories:', e)
  }
}

// 获取标签列表
async function fetchTags() {
  try {
    const response = await $fetch('/api/admin/tags')
    tags.value = response.data
  } catch (e: any) {
    console.error('Failed to fetch tags:', e)
  }
}

// 创建文章
async function createPost() {
  error.value = ''

  if (!form.value.title || !form.value.content) {
    error.value = '标题和内容不能为空'
    return
  }

  try {
    saving.value = true
    await $fetch('/api/admin/posts', {
      method: 'POST',
      body: {
        title: form.value.title,
        slug: form.value.slug,
        content: form.value.content,
        excerpt: form.value.excerpt || undefined,
        coverImage: form.value.coverImage || undefined,
        published: form.value.published,
        categoryId: form.value.categoryId || undefined,
        tagIds: form.value.tags
      }
    })

    alert('创建成功')
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || '创建失败'
  } finally {
    saving.value = false
  }
}

// 生成 slug
function generateSlug() {
  if (form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// 上传封面图到 S3（经 API 中转）
async function uploadCoverImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    form.value.coverImage = res.url
  } catch (e: any) {
    error.value = e.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

// 清除封面图
function removeCoverImage() {
  form.value.coverImage = ''
}

onMounted(() => {
  fetchCategories()
  fetchTags()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">新建文章</h1>
    </div>

    <!-- 编辑表单 -->
    <div class="bg-white shadow rounded-lg p-6">
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <div class="space-y-6">
        <!-- 标题 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入文章标题"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Slug</label>
          <div class="flex gap-2">
            <input
              v-model="form.slug"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="文章URL标识符"
            />
            <button
              @click="generateSlug"
              type="button"
              class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              从标题生成
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">手动编辑，不会随标题自动变化</p>
        </div>

        <!-- 摘要 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">摘要</label>
          <textarea
            v-model="form.excerpt"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="简短描述文章内容"
          ></textarea>
        </div>

        <!-- 内容 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">内容 *</label>
            <button
              @click="showPreview = !showPreview"
              type="button"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              {{ showPreview ? '编辑' : '预览' }}
            </button>
          </div>

          <!-- 编辑模式 -->
          <div v-if="!showPreview">
            <textarea
              v-model="form.content"
              @input="updatePreview"
              rows="15"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="使用 Markdown 编写文章内容"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">支持 Markdown 语法：# 标题、**粗体**、*斜体*、`代码`、[链接](url)</p>
          </div>

          <!-- 预览模式 -->
          <div v-else class="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[300px] prose max-w-none">
            <div v-html="previewContent" class="markdown-preview"></div>
          </div>
        </div>

        <!-- 封面图上传 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">封面图</label>

          <!-- 已上传预览 -->
          <div v-if="form.coverImage" class="mb-3 relative rounded-md overflow-hidden border border-gray-200">
            <img :src="form.coverImage" alt="封面图预览" class="w-full max-h-48 object-cover" />
            <button
              @click="removeCoverImage"
              type="button"
              class="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white text-xs px-2 py-1 rounded"
            >
              删除
            </button>
          </div>

          <!-- 上传按钮 -->
          <div v-if="!form.coverImage">
            <input
              id="cover-upload-new"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              class="sr-only"
              @change="uploadCoverImage"
            />
            <label
              for="cover-upload-new"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
            >
              <span>📎</span>
              <span>{{ uploading ? '上传中...' : '选择封面图' }}</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">支持 jpg / png / gif / webp，最大 10MB</p>
          </div>
        </div>

        <!-- 分类 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select
            v-model="form.categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">无分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <div class="space-y-2">
            <div v-for="tag in tags" :key="tag.id" class="flex items-center">
              <input
                :id="`tag-${tag.id}`"
                v-model="form.tags"
                :value="tag.id"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label :for="`tag-${tag.id}`" class="ml-2 text-sm text-gray-700">
                {{ tag.name }}
              </label>
            </div>
          </div>
        </div>

        <!-- 发布状态 -->
        <div>
          <label class="flex items-center">
            <input
              v-model="form.published"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">立即发布</span>
          </label>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-between pt-4 border-t">
          <NuxtLink
            to="/dashboard"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            取消
          </NuxtLink>
          <button
            @click="createPost"
            :disabled="saving"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '创建中...' : '创建文章' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-preview {
  line-height: 1.6;
  color: #374151;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-preview :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.25em;
}

.markdown-preview :deep(p) {
  margin-bottom: 1em;
}

.markdown-preview :deep(strong) {
  font-weight: 700;
}

.markdown-preview :deep(em) {
  font-style: italic;
}

.markdown-preview :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-preview :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-preview :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-preview :deep(a:hover) {
  color: #1d4ed8;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 1em 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin-left: 2em;
  margin-bottom: 1em;
}
</style>
