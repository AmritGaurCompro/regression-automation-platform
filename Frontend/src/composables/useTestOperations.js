import { useTestStore } from '@/stores/testStore'
import { useDateFormatter } from './useDateFormatter'

export function useTestOperations() {
  const testStore = useTestStore()
  const { getCurrentTimestamp } = useDateFormatter()

  const runTest = (test) => {
    if (!test) return

    test.lastRun = getCurrentTimestamp()
  }

  const runSelectedTest = () => {
    const { selectedTest } = testStore
    if (!selectedTest) return

    selectedTest.lastRun = getCurrentTimestamp()
  }

  return {
    runTest,
    runSelectedTest
  }
}
