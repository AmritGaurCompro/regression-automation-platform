// stores/testStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useTestStore = defineStore('test', () => {
  const selectedTest = ref(null)
  const searchQuery = ref('')
  const tests = ref([])
  const testRuns = ref([])
  const pollingInterval = ref(null)
  const runEndTime = ref(null)
  
  // Test run configuration - shared between Sidebar and TestData
  const testRunConfig = ref({
    runner_mode: 'headless',
    retries: 2
  })

  async function refreshTestsFromBackend() {
    try {
      const res = await axios.get('/api/tests')
      tests.value = res.data
      
      if (selectedTest.value) {
        const updated = res.data.find(t => t.id === selectedTest.value.id)
        if (updated) {
          selectedTest.value = updated
        }
      }
    } catch (err) {
      console.error("Failed to refresh tests:", err)
    }
  }

  async function fetchTestRuns(testId) {
  if (!testId) return

  try {
    const res = await axios.get(`/api/tests/${testId}/test_runs`)
    testRuns.value = res.data
  } catch (err) {
    console.error("Failed to fetch test runs:", err)
  }
}

  function setSelectedTest(test) {
    selectedTest.value = test
  }

  function updateTestRunConfig(config) {
    testRunConfig.value = { ...testRunConfig.value, ...config }
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

  function startPolling(testId) {
    stopPolling()
     pollingInterval.value = setInterval(async () => {
     await refreshTestsFromBackend()
     await fetchTestRuns(testId)
     const updatedTest = tests.value.find(t => t.id === testId)
      if (!updatedTest) return
      setSelectedTest(updatedTest)
      if (updatedTest.status === "passed") {
        stopPolling()
        return
      }
       if (updatedTest.status === "failed") {
         const traceArtifact = updatedTest.artifacts?.find(
         a => a.kind === "trace"
  )
  if (traceArtifact && traceArtifact.url) {
    stopPolling()
    return
  }
}
    }, 3000)
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      runEndTime.value = new Date()
    }
  }

  return {
    tests,
    selectedTest,
    searchQuery,
    runEndTime,
    testRunConfig,
    testRuns,
    refreshTestsFromBackend,
    fetchTestRuns,
    setSelectedTest,
    updateTestRunConfig,
    clearSelectedTest,
    setSearchQuery,
    clearSearchQuery,
    startPolling,
    stopPolling
  }
})



