import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTestStore = defineStore('test', () => {
  const selectedTest = ref(null)
  const searchQuery = ref('')

  function setSelectedTest(test) {
    selectedTest.value = test
  }

  function clearSelectedTest() {
    selectedTest.value = null
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function clearSearchQuery() {
    searchQuery.value = ''
  }

  return {
    selectedTest,
    searchQuery,
    setSelectedTest,
    clearSelectedTest,
    setSearchQuery,
    clearSearchQuery
  }
})

