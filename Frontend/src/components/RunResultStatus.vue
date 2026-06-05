<script setup>
import { computed, ref } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

const props = defineProps({
  status: { type: String, default: 'new' },
  runId:  { type: String, default: '#-' },
  runTime: { type: String, default: '-' }
})

const { formatDateTime } = useDateFormatter()

const normalized = computed(() => {
  const s = (props.status || 'new').toUpperCase().trim()
  if (['PASSED', 'PASS'].includes(s)) return 'passed'
  if (['FAILED', 'FAIL'].includes(s)) return 'failed'
  if (['RUNNING', 'IN_PROGRESS'].includes(s)) return 'running'
  return 'new'
})

const iconConfig = computed(() => {
  switch (normalized.value) {
    case 'passed':  return { symbol: '✓', bg: 'bg-emerald-500/20 text-emerald-400', label: 'Test Passed' }
    case 'failed':  return { symbol: '✕', bg: 'bg-red-500/20 text-red-400',         label: 'Test Failed' }
    case 'running': return { symbol: '⟳', bg: 'bg-amber-500/20 text-amber-400',     label: 'Test Running' }
    default:        return { symbol: '○', bg: 'bg-slate-500/20 text-slate-400',      label: 'Not Run Yet' }
  }
})

const runInfo = computed(() => {
  const id = props.runId || '—'
  let time = props.runTime || '—'
  if (time !== '—') {
    try { time = formatDateTime(new Date(time)) } catch { /* use raw */ }
  }
  return `Run ${id} · ${time}`
})
</script>

<template>
  <div class="flex items-center justify-between
              rounded-xl border border-slate-800 bg-[#1c2333]
              px-5 py-4">
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0', iconConfig.bg]">
        <span :class="normalized === 'running' ? 'animate-spin inline-block' : ''">
          {{ iconConfig.symbol }}
        </span>
      </div>

      <!-- Text -->
      <div>
        <p class="text-white font-semibold text-sm">{{ iconConfig.label }}</p>
        <p class="text-slate-500 text-xs mt-0.5">{{ runInfo }}</p>
      </div>
    </div>

    <!-- Badge -->
    <StatusBadge :status="normalized" size="md" />
  </div>
</template>