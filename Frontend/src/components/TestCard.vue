<script setup>
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from './ui/button'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { Trash2, Globe, Clock, Play } from 'lucide-vue-next'
import StatusBadge from '@/components/StatusBadge.vue'

const props = defineProps({
  tests: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action', 'delete'])

const { formatDateTime } = useDateFormatter()
const { queuedRuns } = storeToRefs(useTestStore())

const isThisTestBusy = computed(() =>
  props.tests?.status === 'running' ||
  queuedRuns.value.includes(props.tests?.id)
)

const queuePosition = computed(() => {
  const pos = queuedRuns.value.indexOf(props.tests.id)
  return pos !== -1 ? pos + 1 : null
})
</script>

<template>
  <Card
    class="bg-[#1c2333] mt-3 cursor-pointer
           border border-slate-800 border-l-4 border-l-transparent
           hover:border-l-slate-500 hover:bg-[#1e2d3d]
           transition-all duration-200"
  >
    <CardHeader class="pb-2 px-4 pt-4">
      <CardTitle class="flex items-start justify-between gap-2">
        <!-- Title -->
        <span class="text-sm font-medium text-white leading-snug break-all">
          {{ tests?.title?.split('_').slice(0, -1).join('_') || tests?.title }}
        </span>
        <!-- Status badge -->
        <StatusBadge :status="tests?.status" size="sm" class="shrink-0 mt-0.5" />
      </CardTitle>
    </CardHeader>

    <CardContent class="px-4 pb-2 space-y-2">
      <!-- Meta row -->
      <div class="flex items-center gap-3 text-xs text-slate-500">
        <span class="flex items-center gap-1.5">
          <Globe class="w-3 h-3" />
          <span>{{ tests?.environment || 'QA' }}</span>
        </span>
        <span class="text-slate-700">·</span>
        <span v-if="tests?.lastRun">{{ formatDateTime(new Date(tests.lastRun)) }}</span>
        <span v-else class="italic">Never run</span>
      </div>

      <!-- Tags -->
      <div v-if="tests?.tags?.length" class="flex flex-wrap gap-1">
        <span
          v-for="(tag, index) in tests.tags"
          :key="index"
          class="inline-flex items-center rounded
                 bg-slate-700/40 border border-slate-600/40
                 px-1.5 py-0.5 text-[10px] text-slate-300"
        >
          {{ tag }}
        </span>
      </div>
    </CardContent>

    <CardFooter class="px-4 pb-3 flex justify-end gap-2">
      <Button
        size="sm"
        variant="ghost"
        class="h-8 px-3 text-xs text-slate-400 hover:text-white hover:bg-[#2a3347]"
        @click.stop="emit('delete', tests.id)"
      >
        <Trash2 class="w-3 h-3 mr-1" />
        Delete
      </Button>

      <Button
        size="sm"
        :disabled="isThisTestBusy"
        class="h-8 px-3 text-xs bg-slate-100 hover:bg-white text-slate-900
               disabled:opacity-40 disabled:cursor-not-allowed"
        @click.stop="emit('action')"
      >
        <span v-if="tests?.status === 'running'" class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Running
        </span>
        <span v-else-if="queuePosition" class="flex items-center gap-1">
          <Clock class="w-3 h-3" />
          #{{ queuePosition }}
        </span>
        <span v-else class="flex items-center gap-1">
          <Play class="w-3 h-3" />
          Run
        </span>
      </Button>
    </CardFooter>
  </Card>
</template>