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
  const vncOpened = ref(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const testRunConfig = ref({
    runner_mode: 'headless',
    retries: 2
  })

  async function refreshTestsFromBackend() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tests`)
      tests.value = res.data

      console.log('script field from API:', res.data[0]?.script)
      console.log('type:', typeof res.data[0]?.script)

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
      const res = await axios.get(`${API_BASE_URL}/api/tests/${testId}/test_runs`)
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
    vncOpened.value = false

    pollingInterval.value = setInterval(async () => {
      await refreshTestsFromBackend()
      await fetchTestRuns(testId)

      const updatedTest = tests.value.find(t => t.id === testId)
      if (!updatedTest) return
      setSelectedTest(updatedTest)

      // Auto-open VNC URL if available and not already opened
      if (!vncOpened.value && updatedTest.vnc_url) {
        vncOpened.value = true
        window.open(updatedTest.vnc_url, '_blank')
      }

      // Stop polling when passed
      if (updatedTest.status === 'passed') {
        stopPolling()
        return
      }

      // Stop polling when failed and trace artifact available
      if (updatedTest.status === 'failed') {
        const traceArtifact = updatedTest.artifacts?.find(
          a => a.kind === 'trace'
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
      vncOpened.value = false
    }
  }

  return {
    tests,
    selectedTest,
    searchQuery,
    runEndTime,
    testRunConfig,
    testRuns,
    vncOpened,
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



