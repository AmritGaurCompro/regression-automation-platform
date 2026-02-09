import { useTestStore } from '@/stores/testStore'
import { useDateFormatter } from './useDateFormatter'
import { storeToRefs } from 'pinia'
import axios from 'axios'

export function useTestOperations() {
  const testStore = useTestStore()
  const { getCurrentTimestamp } = useDateFormatter()

  const runTest = async () => {
    const { selectedTest } = testStore
    if (!selectedTest) return

    const { id, title } = selectedTest
    if (!id || !title) return

    selectedTest.lastRun = getCurrentTimestamp()

    await axios.post(
      `/api/tests/${selectedTest.id}/test_runs`,
      {
        environment: selectedTest.environment,
        runner_mode: selectedTest.runner_mode,
        retries_on_failure: selectedTest.retries_on_failure,
        tags: selectedTest.tags
      }
    )
  }

  const runSelectedTest = async () => {
    const { selectedTest } = testStore
    if (!selectedTest) return
    selectedTest.status = 'RUNNING'

    const { id, title } = selectedTest
    if (!id || !title) return

    selectedTest.lastRun = getCurrentTimestamp()

    const res = await axios.post(
      `/api/tests/${selectedTest.id}/test_runs`,
      {
        environment: selectedTest.environment,
        runner_mode: selectedTest.runner_mode,
        retries_on_failure: selectedTest.retries_on_failure,
        tags: selectedTest.tags
      }
    ) 
     console.log('Run created:', res.data.test_run_id)

        // refresh after job runs
      pollStatus(selectedTest.id)
  }

  const pollStatus = async (testId) => {
    console.log("⏳ polling status for test", testId)

    const res = await axios.get('/api/tests')

    const updatedTest = res.data.find(t => t.id === testId)

    if (!updatedTest) return

    console.log("📊 status:", updatedTest.status)

    if (updatedTest.status === 'not_run') {
      // keep polling
      setTimeout(() => pollStatus(testId), 2000)
    } else {
      // finished → update store
      testStore.tests = res.data
      console.log("✅ test finished — store updated")
    }
  }

  return {
    runTest,
    runSelectedTest
  }
}



