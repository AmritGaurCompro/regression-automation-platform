// stores/testStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/plugins/axios.js'

export const useTestStore = defineStore('test', () => {
  const selectedTest = ref(null)
  const searchQuery = ref('')
  const tests = ref([])
  const features = ref([])  // ← new
  const testRuns = ref([])
  const pollingInterval = ref(null)
  const runEndTime = ref(null)
  const vncOpened = ref(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const resetNormalization = ref(false)
  const isAnyRunning = ref(false)
  const queuedRuns = ref([])

  const testRunConfig = ref({
    runner_mode: 'headless',
    retries: 2
  })

  async function refreshTestsFromBackend() {
    try {
      const [testsRes, runningRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tests`),
        axios.get(`${API_BASE_URL}/api/test_runs/any_running`)
      ])

      tests.value = testsRes.data
      isAnyRunning.value = runningRes.data.running
      queuedRuns.value = runningRes.data.queued

      if (selectedTest.value) {
        const updated = testsRes.data.find(t => t.id === selectedTest.value.id)
        if (updated) {
          selectedTest.value = updated
        }
      }
    } catch (err) {
      console.error("Failed to refresh tests:", err)
    }
  }

  // ← new
  async function refreshFeaturesFromBackend() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/features`)
      features.value = res.data
    } catch (err) {
      console.error("Failed to refresh features:", err)
    }
  }

  // ← new
  async function runFeature(featureId, config = {}) {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/features/${featureId}/run_all`, {
        environment:        config.environment || 'QA',
        runner_mode:        config.runner_mode || 'headless',
        retries_on_failure: config.retries || 0
      })
      return res.data
    } catch (err) {
      console.error("Failed to run feature:", err)
      throw err
    }
  }

  // ← new
  async function deleteFeature(featureId) {
    try {
      await axios.delete(`${API_BASE_URL}/api/features/${featureId}`)
      features.value = features.value.filter(f => f.id !== featureId)
    } catch (err) {
      console.error("Failed to delete feature:", err)
      throw err
    }
  }

  async function deleteTest(testId) {
    try {
      await axios.delete(`${API_BASE_URL}/api/tests/${testId}`)
      tests.value = tests.value.filter(t => t.id !== testId)
    } catch (err) {
      console.error("Failed to delete test:", err)
      throw err
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
    stopPolling()
    vncOpened.value = false

    pollingInterval.value = setInterval(async () => {
      await refreshTestsFromBackend()
      await refreshFeaturesFromBackend()  // ← new: keep features in sync
      await fetchTestRuns(testId)

      const updatedTest = tests.value.find(t => t.id === testId)
      if (!updatedTest) return
      setSelectedTest(updatedTest)

      if (!vncOpened.value && updatedTest.vnc_url) {
        vncOpened.value = true
        window.open(updatedTest.vnc_url, '_blank')
      }

      if (updatedTest.status === 'passed') {
        stopPolling()
        return
      }

      if (updatedTest.status === 'failed') {
        const traceArtifact = updatedTest.artifacts?.find(a => a.kind === 'trace')
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
    features,          // ← new
    selectedTest,
    searchQuery,
    runEndTime,
    testRunConfig,
    testRuns,
    resetNormalization,
    vncOpened,
    isAnyRunning,
    queuedRuns,
    refreshTestsFromBackend,
    refreshFeaturesFromBackend,  // ← new
    runFeature,                  // ← new
    deleteFeature,               // ← new
    deleteTest,                  // ← new
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