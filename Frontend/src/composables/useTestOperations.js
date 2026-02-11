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
    testStore.startPolling(selectedTest.id)
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
      testStore.startPolling(selectedTest.id)
  }

  return {
    runTest,
    runSelectedTest
  }
}



