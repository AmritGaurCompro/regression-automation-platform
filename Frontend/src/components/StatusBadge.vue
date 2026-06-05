<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'new' },
  size:   { type: String, default: 'md' },
  pulse:  { type: Boolean, default: true },
})

const norm = computed(() => {
  const s = (props.status || 'new').toLowerCase().trim()
  if (['passed', 'pass'].includes(s))         return 'passed'
  if (['failed', 'fail'].includes(s))         return 'failed'
  if (['running', 'in_progress'].includes(s)) return 'running'
  if (s === 'queued')                         return 'queued'
  return 'new'
})

const cfgMap = {
  passed:  { dot: 'bg-status-passed',  badge: 'bg-status-passed  border-status-passed  text-status-passed',  label: 'Passed',  animate: false },
  failed:  { dot: 'bg-status-failed',  badge: 'bg-status-failed  border-status-failed  text-status-failed',  label: 'Failed',  animate: false },
  running: { dot: 'bg-status-running', badge: 'bg-status-running border-status-running text-status-running', label: 'Running', animate: true  },
  queued:  { dot: 'bg-status-queued',  badge: 'bg-status-queued  border-status-queued  text-status-queued',  label: 'Queued',  animate: true  },
  new:     { dot: 'bg-status-new',     badge: 'bg-status-new     border-status-new     text-status-new',     label: 'New',     animate: false },
}
const cfg = computed(() => cfgMap[norm.value])

const sizeClasses = computed(() => ({
  sm: 'text-2xs px-1.5 py-0.5 gap-1',
  md: 'text-xs  px-2   py-1   gap-1.5',
  lg: 'text-sm  px-3   py-1.5 gap-2',
}[props.size] ?? 'text-xs px-2 py-1 gap-1.5'))

const dotSize = computed(() => ({
  sm: 'w-1.5 h-1.5',
  md: 'w-2   h-2',
  lg: 'w-2.5 h-2.5',
}[props.size] ?? 'w-2 h-2'))
</script>

<template>
  <span :class="['inline-flex items-center rounded-full border font-mono font-medium uppercase tracking-wider', cfg.badge, sizeClasses]">
    <span :class="['rounded-full shrink-0', cfg.dot, dotSize, cfg.animate && pulse ? 'animate-pulse' : '']" />
    {{ cfg.label }}
  </span>
</template>