import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref('dark')
  const systemTheme = ref('dark')

  // 初始化系统主题监听
  const initSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

    mediaQuery.addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light'
      if (currentTheme.value === 'system') {
        applyTheme()
      }
    })
  }

  // 应用主题
  const applyTheme = () => {
    const theme = currentTheme.value === 'system' ? systemTheme.value : currentTheme.value
    document.documentElement.setAttribute('data-theme', theme)
  }

  // 加载主题
  const loadTheme = async () => {
    try {
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get('theme')
        if (result.theme) {
          currentTheme.value = result.theme
        }
      } else {
        // 本地开发时使用 localStorage
        const saved = localStorage.getItem('tab-manager-theme')
        if (saved) {
          currentTheme.value = saved
        }
      }
    } catch (err) {
      console.warn('Failed to load theme:', err)
    }

    initSystemTheme()
    applyTheme()
  }

  // 保存主题
  const saveTheme = async (theme) => {
    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ theme })
      } else {
        localStorage.setItem('tab-manager-theme', theme)
      }
    } catch (err) {
      console.warn('Failed to save theme:', err)
    }
  }

  // 切换主题
  const toggleTheme = () => {
    const themes = ['dark', 'light', 'system']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    currentTheme.value = themes[nextIndex]

    saveTheme(currentTheme.value)
    applyTheme()
  }

  // 监听主题变化
  watch(currentTheme, () => {
    applyTheme()
  })

  return {
    currentTheme,
    systemTheme,
    loadTheme,
    saveTheme,
    toggleTheme,
    applyTheme
  }
})
