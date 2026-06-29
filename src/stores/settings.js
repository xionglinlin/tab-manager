import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingStore = defineStore('settings', () => {
  // 默认设置
  const defaultSettings = {
    columns: 'auto',           // 列数：1/2/3/auto
    showThumbnails: true,      // 显示缩略图
    sleepThreshold: 2,         // 休眠阈值（小时）
    showSleepSuggestions: true, // 显示休眠建议
    language: 'zh-CN',         // 语言
  }

  // 状态
  const settings = ref({ ...defaultSettings })

  // 加载设置
  const loadSettings = async () => {
    try {
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get('settings')
        if (result.settings) {
          settings.value = { ...defaultSettings, ...result.settings }
        }
      } else {
        // 本地开发时使用 localStorage
        const saved = localStorage.getItem('tab-manager-settings')
        if (saved) {
          settings.value = { ...defaultSettings, ...JSON.parse(saved) }
        }
      }
    } catch (err) {
      console.warn('Failed to load settings:', err)
    }
  }

  // 保存设置
  const saveSettings = async (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }

    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ settings: settings.value })
      } else {
        localStorage.setItem('tab-manager-settings', JSON.stringify(settings.value))
      }
    } catch (err) {
      console.warn('Failed to save settings:', err)
    }
  }

  // 重置设置
  const resetSettings = async () => {
    settings.value = { ...defaultSettings }

    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ settings: settings.value })
      } else {
        localStorage.setItem('tab-manager-settings', JSON.stringify(settings.value))
      }
    } catch (err) {
      console.warn('Failed to reset settings:', err)
    }
  }

  return {
    settings,
    loadSettings,
    saveSettings,
    resetSettings
  }
})
