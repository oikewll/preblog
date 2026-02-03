<script setup lang="ts">
import { ref } from 'vue'
const menuOpen = ref(false)
</script>

<template>
  <nav class="bg-white shadow-sm sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl md:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            📝 My Blog
          </NuxtLink>
        </div>
        <!-- 桌面导航 -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 font-medium">首页</NuxtLink>
          <NuxtLink to="/categories" class="text-gray-700 hover:text-blue-600 font-medium">分类</NuxtLink>
          <NuxtLink to="/tags" class="text-gray-700 hover:text-blue-600 font-medium">标签</NuxtLink>
          <NuxtLink to="/login" class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">后台</NuxtLink>
        </div>
        <!-- 手机汉堡 -->
        <button
          v-show="!menuOpen"
          class="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          @click="menuOpen = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 手机菜单下拉 -->
    <div v-if="menuOpen" class="md:hidden border-t bg-white">
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <span class="font-semibold text-gray-900">菜单</span>
        <button class="p-1 text-gray-600 hover:bg-gray-100 rounded-md" @click="menuOpen = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="px-3 py-2 space-y-1">
        <NuxtLink to="/" @click="menuOpen = false" class="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-100">首页</NuxtLink>
        <NuxtLink to="/categories" @click="menuOpen = false" class="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-100">分类</NuxtLink>
        <NuxtLink to="/tags" @click="menuOpen = false" class="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-100">标签</NuxtLink>
        <NuxtLink to="/login" @click="menuOpen = false" class="block mt-2 px-3 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 text-center">后台</NuxtLink>
      </div>
    </div>
  </nav>
</template>
