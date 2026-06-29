import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingStore } from './settings'

export const useTabStore = defineStore('tabs', () => {
  // 状态
  const allTabs = ref([])
  const groupedTabs = ref({})
  const pinnedDomains = ref([])
  const duplicateTabs = ref({})
  const sleepSuggestions = ref([])
  const currentWindowId = ref(null)
  const isLoading = ref(false)
  const lastLoadTime = ref(0)

  // 设置状态
  const settingStore = useSettingStore()

  // 防抖定时器
  let loadTabsTimer = null
  const DEBOUNCE_DELAY = 300 // 300ms 防抖

  // 计算属性
  const stats = computed(() => {
    const totalTabs = allTabs.value.length
    const totalDomains = Object.keys(groupedTabs.value).length
    const totalDuplicates = Object.values(duplicateTabs.value).reduce((sum, tabs) => sum + tabs.length, 0)
    const totalSleep = sleepSuggestions.value.length

    return {
      totalTabs,
      totalDomains,
      totalDuplicates,
      totalSleep
    }
  })

  const pinnedGroups = computed(() => {
    const groups = {}
    pinnedDomains.value.forEach(domain => {
      if (groupedTabs.value[domain]) {
        groups[domain] = groupedTabs.value[domain]
      }
    })
    return groups
  })

  const otherGroups = computed(() => {
    const groups = {}
    Object.entries(groupedTabs.value).forEach(([domain, tabs]) => {
      if (!pinnedDomains.value.includes(domain)) {
        groups[domain] = tabs
      }
    })
    return groups
  })

  // 防抖加载标签页
  const debouncedLoadTabs = () => {
    if (loadTabsTimer) {
      clearTimeout(loadTabsTimer)
    }
    loadTabsTimer = setTimeout(() => {
      loadTabs()
    }, DEBOUNCE_DELAY)
  }

  // 获取所有标签页
  const loadTabs = async () => {
    // 防止重复加载
    if (isLoading.value) {
      console.log('Already loading, skipping...')
      return
    }

    // 限制加载频率（最少 500ms 间隔）
    const now = Date.now()
    if (now - lastLoadTime.value < 500) {
      console.log('Too soon, skipping...')
      return
    }

    isLoading.value = true
    lastLoadTime.value = now

    try {
      console.log('Starting to load tabs...')

      // 获取当前窗口 ID
      if (chrome?.windows) {
        const currentWindow = await chrome.windows.getCurrent()
        currentWindowId.value = currentWindow.id
      }

      // 获取所有标签页
      if (chrome?.tabs) {
        const tabs = await chrome.tabs.query({})
        console.log('Raw tabs count:', tabs.length)

        // 限制处理的标签页数量（最多 500 个）
        const limitedTabs = tabs.slice(0, 500)

        allTabs.value = limitedTabs
          .filter(t => {
            const url = t.url || ''
            return (
              !url.startsWith('chrome://') &&
              !url.startsWith('chrome-extension://') &&
              !url.startsWith('moz-extension://') &&
              !url.startsWith('resource://') &&
              !url.startsWith('about:') &&
              !url.startsWith('edge://') &&
              !url.startsWith('brave://')
            )
          })
          .map(t => ({
            id: t.id,
            url: t.url,
            title: t.title,
            windowId: t.windowId,
            active: t.active,
            favIconUrl: t.favIconUrl,
            lastAccessed: t.lastAccessed || Date.now(),
          }))

        console.log('Filtered tabs count:', allTabs.value.length)
      } else {
        // 本地开发时使用模拟数据
        allTabs.value = getMockTabs()
      }

      // 加载置顶域名
      await loadPinnedDomains()

      // 按域名分组
      groupTabsByDomain()

      // 检测重复标签页
      detectDuplicates()

      // 生成休眠建议
      generateSleepSuggestions()

      console.log(`Loaded ${allTabs.value.length} tabs, ${Object.keys(groupedTabs.value).length} domains`)
    } catch (err) {
      console.error('Failed to load tabs:', err)
      // 出错时不要清空数据，保持之前的状态
    } finally {
      isLoading.value = false
    }
  }

  // 加载置顶域名
  const loadPinnedDomains = async () => {
    try {
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get('pinnedDomains')
        pinnedDomains.value = result.pinnedDomains || []
      } else {
        const saved = localStorage.getItem('tab-manager-pinned-domains')
        pinnedDomains.value = saved ? JSON.parse(saved) : []
      }
    } catch (err) {
      console.warn('Failed to load pinned domains:', err)
    }
  }

  // 保存置顶域名
  const savePinnedDomains = async () => {
    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ pinnedDomains: pinnedDomains.value })
      } else {
        localStorage.setItem('tab-manager-pinned-domains', JSON.stringify(pinnedDomains.value))
      }
    } catch (err) {
      console.warn('Failed to save pinned domains:', err)
    }
  }

  // 置顶域名
  const pinDomain = async (domain) => {
    if (!pinnedDomains.value.includes(domain)) {
      pinnedDomains.value.push(domain)
      await savePinnedDomains()
    }
  }

  // 取消置顶
  const unpinDomain = async (domain) => {
    const index = pinnedDomains.value.indexOf(domain)
    if (index > -1) {
      pinnedDomains.value.splice(index, 1)
      await savePinnedDomains()
    }
  }

  // 按域名分组
  const groupTabsByDomain = () => {
    try {
      const groups = {}
      const seenUrls = new Set() // 用于去重

      allTabs.value.forEach(tab => {
        let domain = '其他'
        try {
          if (tab.url) {
            const url = new URL(tab.url)
            domain = url.hostname || '其他'
          }
        } catch {
          domain = '其他'
        }

        if (!groups[domain]) {
          groups[domain] = []
        }

        // 去重：同一个 URL 只保留第一个
        if (tab.url && seenUrls.has(tab.url)) {
          // 标记为重复，但不添加到分组中
          // 注意：不要修改原始 tab 对象，避免 Vue 响应式问题
          return
        }

        if (tab.url) {
          seenUrls.add(tab.url)
        }
        groups[domain].push(tab)
      })

      // 按标签数量排序
      const sortedEntries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
      groupedTabs.value = Object.fromEntries(sortedEntries)
    } catch (err) {
      console.error('Failed to group tabs by domain:', err)
      groupedTabs.value = {}
    }
  }

  // 检测重复标签页
  const detectDuplicates = () => {
    try {
      const urlMap = {}

      allTabs.value.forEach(tab => {
        if (tab.url) {
          if (!urlMap[tab.url]) {
            urlMap[tab.url] = []
          }
          urlMap[tab.url].push(tab)
        }
      })

      const duplicates = {}
      Object.entries(urlMap).forEach(([url, tabs]) => {
        if (tabs.length > 1) {
          try {
            // 按域名分组
            const domain = new URL(url).hostname
            if (!duplicates[domain]) {
              duplicates[domain] = []
            }
            duplicates[domain].push(...tabs.slice(1)) // 保留第一个，其余为重复
          } catch (err) {
            // URL 解析失败，跳过
            console.warn('Failed to parse URL for duplicates:', url, err)
          }
        }
      })

      duplicateTabs.value = duplicates
    } catch (err) {
      console.error('Failed to detect duplicates:', err)
      duplicateTabs.value = {}
    }
  }

  // 生成休眠建议
  const generateSleepSuggestions = () => {
    const threshold = (settingStore.settings.sleepThreshold || 2) * 60 * 60 * 1000 // 转换为毫秒
    const now = Date.now()

    const suggestions = allTabs.value
      .filter(tab => {
        const lastAccessed = tab.lastAccessed || 0
        return (now - lastAccessed) > threshold && !tab.active
      })
      .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
      .slice(0, 10) // 最多显示 10 个建议

    sleepSuggestions.value = suggestions
  }

  // 关闭标签页
  const closeTab = async (tabId) => {
    try {
      if (chrome?.tabs) {
        await chrome.tabs.remove(tabId)
      }
      await loadTabs()
    } catch (err) {
      console.error('Failed to close tab:', err)
    }
  }

  // 关闭域名分组
  const closeDomainGroup = async (domain) => {
    const tabs = groupedTabs.value[domain] || []
    const tabIds = tabs.map(t => t.id)

    try {
      if (chrome?.tabs && tabIds.length > 0) {
        await chrome.tabs.remove(tabIds)
      }
      await loadTabs()
      return tabIds.length
    } catch (err) {
      console.error('Failed to close domain group:', err)
      return 0
    }
  }

  // 关闭重复标签页
  const closeDuplicates = async (domain) => {
    const duplicates = duplicateTabs.value[domain] || []
    const tabIds = duplicates.map(t => t.id)

    try {
      if (chrome?.tabs && tabIds.length > 0) {
        await chrome.tabs.remove(tabIds)
      }
      await loadTabs()
      return tabIds.length
    } catch (err) {
      console.error('Failed to close duplicates:', err)
      return 0
    }
  }

  // 跳转到标签页
  const focusTab = async (tabId) => {
    try {
      if (chrome?.tabs) {
        const tab = await chrome.tabs.get(tabId)
        await chrome.windows.update(tab.windowId, { focused: true })
        await chrome.tabs.update(tabId, { active: true })
      }
    } catch (err) {
      console.error('Failed to focus tab:', err)
    }
  }

  // 合并窗口
  const mergeWindows = async () => {
    try {
      if (chrome?.tabs && chrome?.windows) {
        const currentWindow = await chrome.windows.getCurrent()
        const allTabs = await chrome.tabs.query({})
        const tabsToMove = allTabs.filter(t => t.windowId !== currentWindow.id)

        for (const tab of tabsToMove) {
          await chrome.tabs.move(tab.id, { windowId: currentWindow.id, index: -1 })
        }

        await loadTabs()
      }
    } catch (err) {
      console.error('Failed to merge windows:', err)
    }
  }

  // 导出标签页
  const exportTabs = () => {
    const lines = allTabs.value.map(tab => `${tab.title}\t${tab.url}`)
    return lines.join('\n')
  }

  // 模拟数据（本地开发用）
  const getMockTabs = () => {
    return [
      {
        id: 1,
        url: 'https://github.com/linuxdeepin/dde-file-manager',
        title: 'dde-file-manager: Deepin File Manager',
        windowId: 1,
        active: true,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 5,
      },
      {
        id: 2,
        url: 'https://github.com/linuxdeepin/dde-file-manager/issues/123',
        title: 'Issue #123: Bug report - file manager crash',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 30,
      },
      {
        id: 3,
        url: 'https://github.com/linuxdeepin/dde-file-manager/pull/456',
        title: 'PR #456: Feature - add new file type support',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 60,
      },
      {
        id: 4,
        url: 'https://www.youtube.com/watch?v=abc123',
        title: '如何学习 C++ 编程',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 120,
      },
      {
        id: 5,
        url: 'https://www.youtube.com/watch?v=def456',
        title: 'Qt 入门教程',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 180,
      },
      {
        id: 6,
        url: 'https://stackoverflow.com/questions/123456',
        title: 'Qt signals and slots - how to connect',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 240,
      },
      {
        id: 7,
        url: 'https://claude.ai/chat/abc123',
        title: '对话 1',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 300,
      },
      {
        id: 8,
        url: 'https://claude.ai/chat/abc123',
        title: '对话 1',
        windowId: 1,
        active: false,
        favIconUrl: '',
        lastAccessed: Date.now() - 1000 * 60 * 360,
      },
    ]
  }

  return {
    allTabs,
    groupedTabs,
    pinnedDomains,
    duplicateTabs,
    sleepSuggestions,
    stats,
    pinnedGroups,
    otherGroups,
    isLoading,
    loadTabs,
    debouncedLoadTabs,
    loadPinnedDomains,
    savePinnedDomains,
    pinDomain,
    unpinDomain,
    closeTab,
    closeDomainGroup,
    closeDuplicates,
    focusTab,
    mergeWindows,
    exportTabs
  }
})
