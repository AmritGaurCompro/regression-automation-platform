import { computed } from 'vue'

export function useTestStats(tests) {
  const passCnt = computed(() =>
    tests.value.filter(t => t.status === 'passed').length
  )

  const failCnt = computed(() =>
    tests.value.filter(t => t.status === 'failed').length
  )

  const notRunCnt = computed(() =>
    tests.value.filter(t => t.status === 'not_run').length
  )

  const totalCnt = computed(() => tests.value.length)

  return {
    passCnt,
    failCnt,
    notRunCnt,
    totalCnt
  }
}
