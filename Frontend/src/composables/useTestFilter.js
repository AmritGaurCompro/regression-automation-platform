import { computed } from 'vue'

export function useTestFilter(tests, searchQuery) {
  const filteredTests = computed(() => {
    if (!searchQuery.value.trim()) {
      return tests.value
    }

    const query = searchQuery.value.trim().toLowerCase()
    return tests.value.filter(test => {
      const titleMatch = test.title?.toLowerCase().includes(query)
      const envMatch = test.environment?.toLowerCase().includes(query)
      const tagMatch = Array.isArray(test.tags) && test.tags.some(tag => tag?.toLowerCase().includes(query))
      return titleMatch || envMatch || tagMatch
    })
  })

  return {
    filteredTests
  }
}
