import { defineStore } from 'pinia'
import { ref } from 'vue'
import  axios  from 'axios'


export const useTestStore = defineStore('test', () => {
 
  const selectedTest = ref(null)
  const searchQuery = ref('')
  const tests = ref([])

  /* ---------- FETCH TESTS ---------- */

  async function refreshTestsFromBackend() {
    const res = await axios.get('/api/tests')
    tests.value = res.data
  }

  function setSelectedTest(test) {
    selectedTest.value = test
  }

  function clearSelectedTest() {
    selectedTest.value = null
  }

  /* ---------- search ---------- */

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function clearSearchQuery() {
    searchQuery.value = ''
  }

  return {
    tests,
    selectedTest,
    searchQuery,
    setSelectedTest,
    clearSelectedTest,
    setSearchQuery,
    clearSearchQuery,
    refreshTestsFromBackend
  }
})



