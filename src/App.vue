<template>
  <div class="app" :data-theme="currentTheme">
    <div class="container">
      <!-- 顶部栏 -->
      <Header
        :theme="currentTheme"
        @toggle-theme="toggleTheme"
        @open-settings="openSettings"
      />

      <!-- 统计栏 -->
      <StatsBar :stats="stats" />

      <!-- 搜索栏 -->
      <SearchBar
        v-model="searchQuery"
        @clear="clearSearch"
      />

      <!-- 主面板 -->
      <Dashboard
        v-if="!showSettings"
        :pinned-groups="pinnedGroups"
        :other-groups="otherGroups"
        :sleep-suggestions="sleepSuggestions"
        :search-query="searchQuery"
        :is-loading="isLoading"
        @pin-domain="pinDomain"
        @unpin-domain="unpinDomain"
        @close-tab="closeTab"
        @close-domain="closeDomainGroup"
        @focus-tab="focusTab"
        @close-duplicates="closeDuplicates"
        @close-sleep-tab="closeSleepTab"
      />

      <!-- 设置页面 -->
      <Settings
        v-else
        :settings="settings"
        :pinned-domains="pinnedDomains"
        @save-settings="saveSettings"
        @reset-settings="resetSettings"
        @remove-pinned-domain="unpinDomain"
        @back="closeSettings"
      />
    </div>

    <!-- Toast 提示 -->
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="hideToast"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTabStore } from './stores/tabs'
import { useSettingStore } from './stores/settings'
import { useThemeStore } from './stores/theme'

import Header from './components/Header.vue'
import StatsBar from './components/StatsBar.vue'
import SearchBar from './components/SearchBar.vue'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'
import Toast from './components/Toast.vue'

// 状态管理
const tabStore = useTabStore()
const settingStore = useSettingStore()
const themeStore = useThemeStore()

// 本地状态
const showSettings = ref(false)
const searchQuery = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 计算属性
const currentTheme = computed(() => themeStore.currentTheme)
const stats = computed(() => tabStore.stats)
const pinnedGroups = computed(() => tabStore.pinnedGroups)
const otherGroups = computed(() => tabStore.otherGroups)
const sleepSuggestions = computed(() => tabStore.sleepSuggestions)
const settings = computed(() => settingStore.settings)
const pinnedDomains = computed(() => tabStore.pinnedDomains)
const isLoading = computed(() => tabStore.isLoading)

// 方法
const toggleTheme = () => {
  themeStore.toggleTheme()
}

const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
}

const pinDomain = async (domain) => {
  await tabStore.pinDomain(domain)
  showToast(`已置顶 ${domain}`, 'success')
}

const unpinDomain = async (domain) => {
  await tabStore.unpinDomain(domain)
  showToast(`已取消置顶 ${domain}`, 'success')
}

const closeTab = async (tabId) => {
  await tabStore.closeTab(tabId)
  showToast('已关闭标签页', 'success')
}

const closeDomainGroup = async (domain) => {
  const count = await tabStore.closeDomainGroup(domain)
  showToast(`已关闭 ${domain} 的 ${count} 个标签页`, 'success')
}

const focusTab = async (tabId) => {
  await tabStore.focusTab(tabId)
}

const closeDuplicates = async (domain) => {
  const count = await tabStore.closeDuplicates(domain)
  showToast(`已关闭 ${count} 个重复标签页`, 'success')
}

const closeSleepTab = async (tabId) => {
  await tabStore.closeTab(tabId)
  showToast('已关闭休眠标签页', 'success')
}

const saveSettings = async (newSettings) => {
  await settingStore.saveSettings(newSettings)
  showToast('设置已保存', 'success')
}

const resetSettings = async () => {
  await settingStore.resetSettings()
  showToast('设置已重置', 'success')
}

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    hideToast()
  }, 2500)
}

const hideToast = () => {
  toast.value.show = false
}

// 生命周期
onMounted(async () => {
  // 加载主题
  await themeStore.loadTheme()

  // 加载设置
  await settingStore.loadSettings()

  // 加载标签页
  await tabStore.loadTabs()

  // 监听标签页变化（使用防抖版本）
  if (chrome?.tabs) {
    chrome.tabs.onCreated.addListener(() => tabStore.debouncedLoadTabs())
    chrome.tabs.onRemoved.addListener(() => tabStore.debouncedLoadTabs())
    chrome.tabs.onUpdated.addListener(() => tabStore.debouncedLoadTabs())
    chrome.tabs.onActivated.addListener(() => tabStore.debouncedLoadTabs())
  }
})
</script>

<style>
.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
