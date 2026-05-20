import { useTestStore } from '@/stores/testStore'
import { useDateFormatter } from './useDateFormatter'
import { storeToRefs } from 'pinia'
import axios from '@/plugins/axios'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useTestOperations() {
  const testStore = useTestStore()
  const { getCurrentTimestamp } = useDateFormatter()
  const { testRunConfig } = storeToRefs(testStore)
  

    
  
  const runTest = async () => {
    const { selectedTest } = testStore
    if (!selectedTest) return

    const { id, title } = selectedTest
    if (!id || !title) return

    await axios.post(
      `${API_BASE_URL}/api/tests/${selectedTest.id}/test_runs`,
      {
         environment: selectedTest.environment,
        runner_mode: testRunConfig.value.runner_mode,
        retries_on_failure: testRunConfig.value.retries,
        tags: selectedTest.tags
      }
    )
    testStore.startPolling(selectedTest.id)
    selectedTest.lastRun = getCurrentTimestamp()

    await testStore.fetchTestRuns(selectedTest.id)
  }

  const runSelectedTest = async () => {
    const { selectedTest } = testStore
    if (!selectedTest) return
    selectedTest.status = 'RUNNING'

    const { id, title } = selectedTest
    if (!id || !title) return

    // ↓ ADDED: optimistically disable run buttons immediately
    testStore.isAnyRunning = true

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/tests/${selectedTest.id}/test_runs`,
        {
          environment: selectedTest.environment,
          runner_mode: testRunConfig.value.runner_mode,
          retries_on_failure: testRunConfig.value.retries,
          tags: selectedTest.tags
        }
      ) 
        testStore.startPolling(selectedTest.id)
        selectedTest.lastRun = getCurrentTimestamp()
        
        await testStore.fetchTestRuns(selectedTest.id)
    } catch (err) {
      // ↓ ADDED: re-enable if request failed
      testStore.isAnyRunning = false
      if (err.response?.status === 409) {
        alert('A test run is already in progress. Please wait.')
      }
    }
  }

  return {
    runTest,
    runSelectedTest
  }
}