<template>
  <div
    class="flex items-center justify-between
           rounded-lg bg-[#1c2333] border border-slate-800
           px-6 py-4"
  >
    <div>
      <h1 class="text-xl font-bold text-white">
        {{ title?.split('_').slice(0, -1).join('_') || title }}
      </h1>

      <div class="mt-1 flex items-center text-sm text-slate-400">
        <span>Tags:</span>
        <span v-if="tags?.length" class="ml-1">
          {{ tags.join(', ') }}
        </span>

        <span v-if="tags?.length && environment" class="mx-2">•</span>

        <span v-if="environment">
          Environment: {{ environment }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        :disabled="isThisTestBusy"
        class="rounded-md border px-4 py-2 text-sm
               bg-[#10b981] text-black hover:opacity-90
               disabled:opacity-40 disabled:cursor-not-allowed"
        @click="runTest"
      >
        <span v-if="isThisTestBusy" class="animate-pulse">⏳ Running...</span>
        <span v-else>▶ Run Test</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'                      // ↓ ADDED
import { useTestStore } from '@/stores/testStore'   // ↓ ADDED
import { storeToRefs } from 'pinia'                 // ↓ ADDED
import { useTestOperations } from '@/composables/useTestOperations'

const props = defineProps({
  title: String,
  tags: Array,
  environment: String
})

const { runSelectedTest: runTest } = useTestOperations()

// ↓ ADDED
const { queuedRuns } = storeToRefs(useTestStore())
const { selectedTest } = storeToRefs(useTestStore())

const isThisTestBusy = computed(() => {
  return selectedTest.value?.status === 'running' ||
         queuedRuns.value.includes(selectedTest.value?.id)
})
</script>