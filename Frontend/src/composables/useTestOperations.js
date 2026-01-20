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

    // ✅ ID in URL, title in body
    await axios.post(`/api/test/${id}`, {
      title: title
    })
  }

  const runSelectedTest = async () => {
    const { selectedTest } = testStore
    if (!selectedTest) return

    const { id, title } = selectedTest
    if (!id || !title) return

    selectedTest.lastRun = getCurrentTimestamp()

    // ✅ ID in URL, title in body
    await axios.post(`/api/test/${id}`, {
      title: title
    })
  }

  return {
    runTest,
    runSelectedTest
  }
}
