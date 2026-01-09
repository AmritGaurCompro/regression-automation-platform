import { computed } from 'vue'

export function useTestStats(tests) {
  const passCnt = computed(() =>
    tests.value.filter(t => t.status === 'PASS').length
  )

  const failCnt = computed(() =>
    tests.value.filter(t => t.status === 'FAIL').length
  )

  const notRunCnt = computed(() =>
    tests.value.filter(t => t.status === 'NEW').length
  )

  const totalCnt = computed(() => tests.value.length)

  return {
    passCnt,
    failCnt,
    notRunCnt,
    totalCnt
  }
}
