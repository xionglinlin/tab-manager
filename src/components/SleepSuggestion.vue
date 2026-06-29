<template>
  <div class="sleep-suggestion" v-if="suggestions.length > 0">
    <div class="sleep-header">
      <div class="sleep-title">
        <svg class="sleep-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
        休眠建议（{{ suggestions.length }} 个标签超过 {{ threshold }} 小时未访问）
      </div>
      <button class="sleep-toggle" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>
    <div class="sleep-body" v-if="isExpanded">
      <div
        v-for="tab in suggestions"
        :key="tab.id"
        class="sleep-item"
      >
        <div class="sleep-item-info">
          <div class="sleep-item-title">{{ tab.title || '无标题' }}</div>
          <div class="sleep-item-time">{{ formatTime(tab.lastAccessed) }}</div>
        </div>
        <button
          class="sleep-item-close"
          @click="$emit('close-sleep-tab', tab.id)"
          title="关闭标签页"
        >
          <svg class="sleep-item-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  suggestions: {
    type: Array,
    default: () => []
  },
  threshold: {
    type: Number,
    default: 2
  }
})

defineEmits(['close-sleep-tab'])

const isExpanded = ref(true)

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未知时间'

  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days === 1) return '昨天'
  return `${days} 天前`
}
</script>

<style scoped>
.sleep-suggestion {
  background: var(--bg-card);
  border: 1px dashed var(--accent-yellow);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
  animation: fadeInUp var(--transition-normal) both;
}

.sleep-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.sleep-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--accent-yellow);
}

.sleep-icon {
  width: 18px;
  height: 18px;
}

.sleep-toggle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.sleep-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.sleep-body {
  padding: var(--spacing-sm) 0;
}

.sleep-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all var(--transition-fast);
}

.sleep-item:hover {
  background: var(--bg-hover);
}

.sleep-item-info {
  flex: 1;
  min-width: 0;
}

.sleep-item-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sleep-item-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.sleep-item-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0;
}

.sleep-item:hover .sleep-item-close {
  opacity: 1;
}

.sleep-item-close:hover {
  color: var(--accent-red);
  background: rgba(248, 113, 113, 0.1);
}

.sleep-item-close-icon {
  width: 14px;
  height: 14px;
}
</style>
