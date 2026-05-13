import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'


export const useTestStore = defineStore('test', () => {
  const selectedTest = ref(null)
  const searchQuery = ref('')
  const tests = ref([])
  const testRuns = ref([])
  const pollingInterval = ref(null)
  const activePollingTestIds = ref([])
  const terminalStatusCycles = ref({})
  const runEndTime = ref(null)
  const vncOpened = ref(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const resetNormalization = ref(false)


  // Test run configuration - shared between Sidebar and TestData
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
      if (import.meta.env.DEV && err.response?.status && ![500].includes(err.response.status)) {
        console.warn(`refreshTestsFromBackend failed: ${err.response?.status}`)
      }
    }
  }

  async function fetchTestRuns(testId) {
  if (!testId) return

  const selectedTestExists = tests.value.find(t => t.id === testId)
  if (!selectedTestExists) return

  try {
    const res = await axios.get(`${API_BASE_URL}/api/tests/${testId}/test_runs`)
    testRuns.value = res.data
  } catch (err) {
    if (import.meta.env.DEV && err.response?.status && ![404, 500].includes(err.response.status)) {
      console.warn(`fetchTestRuns test ${testId} failed:`, err.response?.status)
    }
  }
}


function addTest(newTest) {
    const exists = tests.value.find(t => t.id === newTest.id)
    if (!exists) {
      tests.value.push({
        id: newTest.id,
        title: newTest.title,
        status: 'NEW',
        environment: null,
        lastRun: null,
        startedAt: null,
        finishedAt: null,
        duration: null,
        tags: [],
        artifacts: [],
        script: { raw: null, normalized: null }
      })
    }
  }

  function setSelectedTest(test) {
    resetNormalization.value = false
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
    if (!testId) return

    if (!activePollingTestIds.value.includes(testId)) {
      activePollingTestIds.value = [...activePollingTestIds.value, testId]
    }

    if (pollingInterval.value) return

    vncOpened.value = false

    pollingInterval.value = setInterval(async () => {
      try {
        await refreshTestsFromBackend()

        if (selectedTest.value?.id) {
          await fetchTestRuns(selectedTest.value.id)
        }

        const retainedIds = []

        for (const id of activePollingTestIds.value) {
          const updatedTest = tests.value.find(t => t.id === id)
          if (!updatedTest) continue

          if (selectedTest.value?.id === id) {
            setSelectedTest(updatedTest)
          }

          // Auto-open VNC URL if available and not already opened
          if (!vncOpened.value && updatedTest.vnc_url) {
            vncOpened.value = true
            window.open(updatedTest.vnc_url, '_blank')
          }

          const normalizedStatus = (updatedTest.status || '').toLowerCase()
          const isTerminal = normalizedStatus === 'passed' || normalizedStatus === 'failed'

          if (!isTerminal) {
            terminalStatusCycles.value[id] = 0
            retainedIds.push(id)
            continue
          }

          // Keep polling terminal tests for a few cycles so delayed artifact uploads appear.
          const nextCycles = (terminalStatusCycles.value[id] || 0) + 1
          terminalStatusCycles.value[id] = nextCycles

          if (nextCycles < 8) {
            retainedIds.push(id)
          } else {
            delete terminalStatusCycles.value[id]
          }
        }

        activePollingTestIds.value = retainedIds

        if (activePollingTestIds.value.length === 0) {
          stopPolling()
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Polling error:', error.message)
        }
      }
    }, 2000)
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      runEndTime.value = new Date()
      vncOpened.value = false
    }

    activePollingTestIds.value = []
    terminalStatusCycles.value = {}
  }

  

  return {
    tests,
    selectedTest,
    searchQuery,
    runEndTime,
    testRunConfig,
    testRuns,

    resetNormalization,

    vncOpened,
    refreshTestsFromBackend,
    fetchTestRuns,
    addTest,
    setSelectedTest,
    updateTestRunConfig,
    clearSelectedTest,
    setSearchQuery,
    clearSearchQuery,
    startPolling,
    stopPolling
  }
})



