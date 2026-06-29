<template>
  <div class="settings">
    <div class="settings-header">
      <button class="back-btn" @click="$emit('back')">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        返回
      </button>
      <h1 class="settings-title">
        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        设置
      </h1>
    </div>

    <div class="settings-content">
      <!-- 基础设置 -->
      <div class="settings-section">
        <h2 class="section-title">基础设置</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">主题</span>
            <span class="setting-desc">选择界面主题</span>
          </div>
          <div class="setting-control">
            <select v-model="localSettings.theme" class="setting-select">
              <option value="dark">深色</option>
              <option value="light">浅色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="settings-section">
        <h2 class="section-title">显示设置</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">卡片布局</span>
            <span class="setting-desc">每行显示的域名卡片数量</span>
          </div>
          <div class="setting-control">
            <select v-model="localSettings.columns" class="setting-select">
              <option value="1">1 列</option>
              <option value="2">2 列</option>
              <option value="3">3 列</option>
              <option value="auto">自动</option>
            </select>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">显示缩略图</span>
            <span class="setting-desc">在标签页列表中显示页面缩略图</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input type="checkbox" v-model="localSettings.showThumbnails">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 休眠设置 -->
      <div class="settings-section">
        <h2 class="section-title">休眠设置</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">休眠阈值</span>
            <span class="setting-desc">超过此时间未访问的标签页将被标记为休眠</span>
          </div>
          <div class="setting-control">
            <select v-model.number="localSettings.sleepThreshold" class="setting-select">
              <option :value="1">1 小时</option>
              <option :value="2">2 小时</option>
              <option :value="4">4 小时</option>
              <option :value="8">8 小时</option>
              <option :value="24">1 天</option>
            </select>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">显示休眠建议</span>
            <span class="setting-desc">在主界面显示休眠标签页建议</span>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input type="checkbox" v-model="localSettings.showSleepSuggestions">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 置顶域名管理 -->
      <div class="settings-section">
        <h2 class="section-title">置顶域名管理</h2>
        <div v-if="pinnedDomains.length > 0" class="pinned-list">
          <div
            v-for="domain in pinnedDomains"
            :key="domain"
            class="pinned-item"
          >
            <span class="pinned-domain">{{ domain }}</span>
            <button class="pinned-remove" @click="$emit('remove-pinned-domain', domain)">
              <svg class="pinned-remove-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div v-else class="pinned-empty">
          暂无置顶域名
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="settings-section">
        <h2 class="section-title">高级设置</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="setting-name">重置所有设置</span>
            <span class="setting-desc">将所有设置恢复为默认值</span>
          </div>
          <div class="setting-control">
            <button class="reset-btn" @click="handleReset">
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="settings-footer">
        <button class="save-btn" @click="handleSave">
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  pinnedDomains: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save-settings', 'reset-settings', 'remove-pinned-domain', 'back'])

// 本地设置副本
const localSettings = ref({ ...props.settings })

// 监听设置变化
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })

// 保存设置
const handleSave = () => {
  emit('save-settings', { ...localSettings.value })
}

// 重置设置
const handleReset = () => {
  if (confirm('确定要重置所有设置吗？')) {
    emit('reset-settings')
  }
}
</script>

<style scoped>
.settings {
  animation: fadeInUp var(--transition-normal) both;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-hover);
  background: var(--bg-hover);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.settings-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.settings-icon {
  width: 24px;
  height: 24px;
  color: var(--accent-blue);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-title {
  padding: var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
  min-width: 0;
}

.setting-name {
  display: block;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 2px;
}

.setting-control {
  flex-shrink: 0;
  margin-left: var(--spacing-lg);
}

.setting-select {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.setting-select:hover {
  border-color: var(--border-hover);
}

.setting-select:focus {
  border-color: var(--accent-blue);
  outline: none;
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-primary);
  transition: var(--transition-fast);
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--accent-blue);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle input:focus-visible + .toggle-slider {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Pinned domains */
.pinned-list {
  padding: var(--spacing-sm) 0;
}

.pinned-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all var(--transition-fast);
}

.pinned-item:hover {
  background: var(--bg-hover);
}

.pinned-domain {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.pinned-remove {
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
}

.pinned-remove:hover {
  color: var(--accent-red);
  background: rgba(248, 113, 113, 0.1);
}

.pinned-remove-icon {
  width: 14px;
  height: 14px;
}

.pinned-empty {
  padding: var(--spacing-xl);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* Buttons */
.reset-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--accent-red);
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.4);
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-xl);
}

.save-btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-inverse);
  background: var(--accent-blue);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.save-btn:hover {
  background: var(--accent-purple);
}

.save-btn:active {
  transform: scale(0.98);
}
</style>
