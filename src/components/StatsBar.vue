<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-number">{{ stats.totalTabs }}</span>
      <span class="stat-label">个标签</span>
    </div>
    <div class="stat-divider">·</div>
    <div class="stat-item">
      <span class="stat-number">{{ stats.totalDomains }}</span>
      <span class="stat-label">个域名</span>
    </div>
    <div class="stat-divider">·</div>
    <div class="stat-item" :class="{ 'has-duplicates': stats.totalDuplicates > 0 }">
      <span class="stat-number">{{ stats.totalDuplicates }}</span>
      <span class="stat-label">个重复</span>
    </div>
    <div class="stat-divider">·</div>
    <div class="stat-item" :class="{ 'has-sleep': stats.totalSleep > 0 }">
      <span class="stat-number">{{ stats.totalSleep }}</span>
      <span class="stat-label">个休眠建议</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalTabs: 0,
      totalDomains: 0,
      totalDuplicates: 0,
      totalSleep: 0
    })
  }
})
</script>

<style scoped>
.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  animation: fadeInUp var(--transition-normal) 100ms both;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-divider {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.has-duplicates .stat-number {
  color: var(--accent-yellow);
}

.has-sleep .stat-number {
  color: var(--accent-purple);
}
</style>
