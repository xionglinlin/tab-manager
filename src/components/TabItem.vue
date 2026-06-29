<template>
  <div
    class="tab-item"
    :class="{ 'is-duplicate': isDuplicate, 'is-active': tab.active }"
    @click="$emit('focus-tab', tab.id)"
    :title="tab.title"
  >
    <img
      v-if="tab.favIconUrl"
      :src="tab.favIconUrl"
      class="tab-favicon"
      alt=""
      @error="handleFaviconError"
    >
    <div v-else class="tab-favicon-placeholder">
      {{ tabInitial }}
    </div>
    <div class="tab-info">
      <div class="tab-title">
        {{ tabTitle }}
        <span v-if="isDuplicate" class="duplicate-badge">{{ duplicateCount }}个重复</span>
      </div>
      <div class="tab-url">{{ tabUrl }}</div>
    </div>
    <div class="tab-actions">
      <button
        class="tab-action"
        @click.stop="handleCopy"
        title="复制链接"
      >
        <svg class="tab-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      </button>
      <button
        class="tab-action"
        @click.stop="$emit('close-tab', tab.id)"
        title="关闭标签页"
      >
        <svg class="tab-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  tab: {
    type: Object,
    required: true
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['focus-tab', 'close-tab'])

const faviconError = ref(false)
const copied = ref(false)

// 计算属性
const tabTitle = computed(() => {
  if (!props.tab.title) return '无标题'
  // 清理标题中的域名后缀
  let title = props.tab.title
  const suffixes = [' - YouTube', ' - GitHub', ' - Stack Overflow', ' - Claude']
  suffixes.forEach(suffix => {
    if (title.endsWith(suffix)) {
      title = title.slice(0, -suffix.length)
    }
  })
  return title
})

const tabUrl = computed(() => {
  if (!props.tab.url) return ''
  try {
    const url = new URL(props.tab.url)
    // 显示简化 URL
    let display = url.hostname
    if (url.pathname !== '/') {
      display += url.pathname
    }
    // 截断过长的 URL
    if (display.length > 50) {
      display = display.substring(0, 47) + '...'
    }
    return display
  } catch {
    return props.tab.url
  }
})

const tabInitial = computed(() => {
  if (!props.tab.title) return '?'
  return props.tab.title.charAt(0).toUpperCase()
})

// 方法
const handleFaviconError = () => {
  faviconError.value = true
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.tab.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.tab-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--border-primary);
}

.tab-item:last-child {
  border-bottom: none;
}

.tab-item:hover {
  background: var(--bg-hover);
}

.tab-item.is-active {
  background: rgba(108, 140, 255, 0.05);
}

.tab-item.is-duplicate {
  background: rgba(251, 191, 36, 0.05);
}

.tab-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tab-favicon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.tab-info {
  flex: 1;
  min-width: 0;
}

.tab-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.duplicate-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-yellow);
  background: rgba(251, 191, 36, 0.15);
  border-radius: 8px;
  flex-shrink: 0;
}

.tab-url {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.tab-item:hover .tab-actions {
  opacity: 1;
}

.tab-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-action:hover {
  color: var(--accent-red);
  background: rgba(248, 113, 113, 0.1);
}

.tab-action-icon {
  width: 14px;
  height: 14px;
}
</style>
