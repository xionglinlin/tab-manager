<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 置顶域名区域 -->
    <div v-if="Object.keys(pinnedGroups).length > 0" class="section pinned-section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
          置顶域名（{{ Object.keys(pinnedGroups).length }}）
        </h2>
      </div>
      <div class="card-grid">
        <DomainCard
          v-for="(tabs, domain) in pinnedGroups"
          :key="domain"
          :domain="domain"
          :tabs="tabs"
          :is-pinned="true"
          :duplicates="getDuplicates(domain)"
          @unpin-domain="$emit('unpin-domain', domain)"
          @close-tab="$emit('close-tab', $event)"
          @close-domain="$emit('close-domain', domain)"
          @focus-tab="$emit('focus-tab', $event)"
          @close-duplicates="$emit('close-duplicates', domain)"
        />
      </div>
    </div>

    <!-- 其他域名区域 -->
    <div v-if="Object.keys(otherGroups).length > 0" class="section other-section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          其他域名（{{ Object.keys(otherGroups).length }}）
        </h2>
      </div>
      <div class="card-grid">
        <DomainCard
          v-for="(tabs, domain) in filteredOtherGroups"
          :key="domain"
          :domain="domain"
          :tabs="tabs"
          :is-pinned="false"
          :duplicates="getDuplicates(domain)"
          @pin-domain="$emit('pin-domain', domain)"
          @close-tab="$emit('close-tab', $event)"
          @close-domain="$emit('close-domain', domain)"
          @focus-tab="$emit('focus-tab', $event)"
          @close-duplicates="$emit('close-duplicates', domain)"
        />
      </div>
    </div>

    <!-- 休眠建议 -->
    <SleepSuggestion
      v-if="sleepSuggestions.length > 0"
      :suggestions="sleepSuggestions"
      :threshold="sleepThreshold"
      @close-sleep-tab="$emit('close-sleep-tab', $event)"
    />

    <!-- 空状态 -->
    <div v-if="!isLoading && Object.keys(pinnedGroups).length === 0 && Object.keys(otherGroups).length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div class="empty-title">标签页已清零</div>
      <div class="empty-subtitle">干得漂亮！</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingStore } from '../stores/settings'
import DomainCard from '../components/DomainCard.vue'
import SleepSuggestion from '../components/SleepSuggestion.vue'

const props = defineProps({
  pinnedGroups: {
    type: Object,
    default: () => ({})
  },
  otherGroups: {
    type: Object,
    default: () => ({})
  },
  sleepSuggestions: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  duplicateTabs: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'pin-domain',
  'unpin-domain',
  'close-tab',
  'close-domain',
  'focus-tab',
  'close-duplicates',
  'close-sleep-tab'
])

const settingStore = useSettingStore()

// 计算属性
const sleepThreshold = computed(() => settingStore.settings.sleepThreshold || 2)

const filteredOtherGroups = computed(() => {
  if (!props.searchQuery) return props.otherGroups

  const query = props.searchQuery.toLowerCase()
  const filtered = {}

  Object.entries(props.otherGroups).forEach(([domain, tabs]) => {
    // 搜索域名
    if (domain.toLowerCase().includes(query)) {
      filtered[domain] = tabs
      return
    }

    // 搜索标签页标题和 URL
    const matchingTabs = tabs.filter(tab => {
      const title = (tab.title || '').toLowerCase()
      const url = (tab.url || '').toLowerCase()
      return title.includes(query) || url.includes(query)
    })

    if (matchingTabs.length > 0) {
      filtered[domain] = matchingTabs
    }
  })

  return filtered
})

// 获取重复标签页
const getDuplicates = (domain) => {
  return props.duplicateTabs[domain] || []
}
</script>

<style scoped>
.dashboard {
  animation: fadeInUp var(--transition-normal) 300ms both;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.section-icon {
  width: 18px;
  height: 18px;
  color: var(--accent-blue);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 800px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  animation: scaleIn var(--transition-normal) both;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.08);
  border: 2px solid rgba(74, 222, 128, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounceIn var(--transition-slow) 100ms both;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: var(--accent-green);
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.empty-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}
</style>
