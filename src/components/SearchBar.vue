<template>
  <div class="search-bar" :class="{ 'is-focused': isFocused }">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
    <input
      ref="searchInput"
      type="text"
      class="search-input"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
      placeholder="搜索标签页..."
      autocomplete="off"
      spellcheck="false"
    >
    <button
      v-if="modelValue"
      class="search-clear"
      @click="$emit('clear')"
      title="清除搜索"
    >
      <svg class="search-clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
    <span v-else class="search-hint">/</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const searchInput = ref(null)
const isFocused = ref(false)

// 键盘快捷键
const handleKeydown = (e) => {
  // 按 / 聚焦搜索框
  if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    e.preventDefault()
    searchInput.value?.focus()
    searchInput.value?.select()
  }

  // 按 Escape 清除搜索并失焦
  if (e.key === 'Escape' && document.activeElement === searchInput.value) {
    emit('clear')
    searchInput.value?.blur()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  animation: fadeInUp var(--transition-normal) 200ms both;
}

.search-bar.is-focused {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2px rgba(108, 140, 255, 0.1);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.search-bar.is-focused .search-icon {
  color: var(--accent-blue);
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.search-clear-icon {
  width: 14px;
  height: 14px;
}

.search-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.search-bar.is-focused .search-hint {
  opacity: 0;
}
</style>
