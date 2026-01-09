import { computed } from 'vue'

export function useTestFilter(tests, searchQuery) {
  const filteredTests = computed(() => {
    if (!searchQuery.value.trim()) {
      return tests.value
    }

    const query = searchQuery.value.trim().toLowerCase()
    return tests.value.filter(test => {
      return (
        test.title.toLowerCase().includes(query) ||
        test.environment.toLowerCase().includes(query) ||
        test.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })
  })

  return {
    filteredTests
  }
}
