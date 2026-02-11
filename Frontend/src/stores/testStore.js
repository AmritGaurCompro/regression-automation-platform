import { defineStore } from 'pinia'
import { ref } from 'vue'
import  axios  from 'axios'


export const useTestStore = defineStore('test', () => {
 
  const selectedTest = ref(null)
  const searchQuery = ref('')
  const tests = ref([])
  const pollingInterval = ref(null)
  const runEndTime = ref(null)


   async function refreshTestsFromBackend() {
    try {
      const res = await axios.get('/api/tests')
      tests.value = res.data
    } catch (err) {
      console.error("Failed to refresh tests:", err)
    }
  }

 function setSelectedTest(test) {
  selectedTest.value = {
    ...test,
    artifacts: test.artifacts || []
  }
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
    let attempts = 0
     pollingInterval.value = setInterval(async () => {
     await refreshTestsFromBackend()
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
    refreshTestsFromBackend,
    setSelectedTest,
    clearSelectedTest,
    setSearchQuery,
    clearSearchQuery,
    startPolling,
    stopPolling
  }
})



