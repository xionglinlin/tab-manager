<template>
  <div class="domain-card" :class="{ 'is-pinned': isPinned, 'has-duplicates': hasDuplicates }">
    <div class="card-header">
      <div class="card-title">
        <span class="domain-icon" :style="{ background: domainColor }">{{ domainInitial }}</span>
        <span class="domain-name">{{ domainName }}</span>
        <span class="tab-count">{{ totalCount }}</span>
        <span v-if="duplicateCount > 0" class="duplicate-count">{{ duplicateCount }}个重复</span>
        <button
          v-if="isPinned"
          class="pin-badge"
          @click.stop="$emit('unpin-domain', domain)"
          title="取消置顶"
        >
          ⭐
        </button>
      </div>
      <div class="card-actions">
        <button
          class="action-btn close-btn"
          @click="$emit('close-domain', domain)"
          :title="`关闭全部 ${totalCount} 个`"
        >
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          v-if="!isPinned"
          class="action-btn pin-btn"
          @click="$emit('pin-domain', domain)"
          title="置顶"
        >
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </button>
        <button
          v-if="duplicateCount > 0"
          class="action-btn dedup-btn"
          @click="$emit('close-duplicates', domain)"
          :title="`关闭 ${duplicateCount} 个重复`"
        >
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
          </svg>
        </button>
      </div>
    </div>

    <div class="card-body">
      <div class="tab-list">
        <TabItem
          v-for="tab in visibleTabs"
          :key="tab.id"
          :tab="tab"
          :is-duplicate="isDuplicate(tab)"
          :duplicate-count="getDuplicateCount(tab)"
          @focus-tab="$emit('focus-tab', tab.id)"
          @close-tab="$emit('close-tab', tab.id)"
        />
        <button
          v-if="hiddenTabs.length > 0"
          class="expand-btn"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? '收起' : `+${hiddenTabs.length} 更多` }}
        </button>
        <template v-if="isExpanded">
          <TabItem
            v-for="tab in hiddenTabs"
            :key="tab.id"
            :tab="tab"
            :is-duplicate="isDuplicate(tab)"
            :duplicate-count="getDuplicateCount(tab)"
            @focus-tab="$emit('focus-tab', tab.id)"
            @close-tab="$emit('close-tab', tab.id)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabItem from './TabItem.vue'

const props = defineProps({
  domain: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    default: () => []
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  duplicates: {
    type: Array,
    default: () => []
  }
})

defineEmits(['pin-domain', 'unpin-domain', 'close-tab', 'close-domain', 'focus-tab', 'close-duplicates'])

const isExpanded = ref(false)

// 计算属性
const domainName = computed(() => {
  if (props.domain === '其他') return '其他'
  // 简化域名显示
  return props.domain.replace(/^www\./, '')
})

const domainInitial = computed(() => {
  if (props.domain === '其他') return '?'
  return props.domain.charAt(0).toUpperCase()
})

const domainColor = computed(() => {
  // 根据域名生成颜色
  const colors = [
    '#4ade80', '#6c8cff', '#f87171', '#fbbf24', '#a78bfa',
    '#22c55e', '#4f6df5', '#ef4444', '#f59e0b', '#8b5cf6'
  ]
  let hash = 0
  for (let i = 0; i < props.domain.length; i++) {
    hash = props.domain.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})

const duplicateCount = computed(() => props.duplicates.length)

const hasDuplicates = computed(() => duplicateCount.value > 0)

// 总数量 = 唯一标签数 + 重复数
const totalCount = computed(() => props.tabs.length + duplicateCount.value)

const visibleTabs = computed(() => {
  if (isExpanded.value) return props.tabs
  return props.tabs.slice(0, 5)
})

const hiddenTabs = computed(() => {
  if (isExpanded.value) return []
  return props.tabs.slice(5)
})

const isDuplicate = (tab) => {
  return props.duplicates.some(d => d.id === tab.id)
}

// 获取某个标签页的重复数量
const getDuplicateCount = (tab) => {
  if (!tab.url) return 0
  // 统计该 URL 在 duplicates 中出现的次数
  return props.duplicates.filter(d => d.url === tab.url).length
}
</script>

<style scoped>
.domain-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
  animation: fadeInUp var(--transition-normal) both;
}

.domain-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.domain-card:hover .card-actions {
  opacity: 1;
}

.domain-card.is-pinned {
  border-color: var(--accent-yellow);
}

.domain-card.has-duplicates {
  border-top: 2px solid var(--accent-yellow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.domain-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: white;
}

.domain-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-radius: 10px;
}

.duplicate-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--accent-yellow);
  background: rgba(251, 191, 36, 0.1);
  border-radius: 10px;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.pin-badge:hover {
  transform: scale(1.2);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.card-body {
  padding: var(--spacing-sm) 0;
}

.tab-list {
  display: flex;
  flex-direction: column;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.expand-btn:hover {
  color: var(--accent-blue);
  background: var(--bg-hover);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  background: var(--bg-hover);
}

.action-icon {
  width: 14px;
  height: 14px;
}

.close-btn {
  border-color: rgba(248, 113, 113, 0.2);
  color: var(--accent-red);
  background: rgba(248, 113, 113, 0.04);
}

.close-btn:hover {
  background: rgba(248, 113, 113, 0.08);
  border-color: rgba(248, 113, 113, 0.4);
}

.pin-btn {
  border-color: rgba(167, 139, 250, 0.2);
  color: var(--accent-purple);
  background: rgba(167, 139, 250, 0.04);
}

.pin-btn:hover {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.4);
}

.dedup-btn {
  border-color: rgba(251, 191, 36, 0.2);
  color: var(--accent-yellow);
  background: rgba(251, 191, 36, 0.04);
}

.dedup-btn:hover {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.4);
}
</style>
