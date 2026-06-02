<template>
  <div
    class="flex items-start justify-between
           rounded-lg bg-[#1c2333] border border-slate-800
           px-6 py-4 gap-4"
  >
    <div class="flex-1 min-w-0">
      <!-- Test Name + Feature Badge -->
      <div class="flex items-center gap-3 flex-wrap">
        <h1 class="text-xl font-bold text-white">
          {{ title?.split('_').slice(0, -1).join('_') || title }}
        </h1>

        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm transition-all"
          :class="
            featureName === 'Standalone'
              ? 'bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border-purple-500/30'
              : 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/30'
          "
        >
          <span
            class="h-2 w-2 rounded-full animate-pulse"
            :class="
              featureName === 'Standalone'
                ? 'bg-purple-400'
                : 'bg-cyan-400'
            "
          />

          <span
            class="text-xs font-semibold uppercase tracking-widest"
            :class="
              featureName === 'Standalone'
                ? 'text-purple-200'
                : 'text-cyan-200'
            "
          >
            {{ featureName }}
          </span>
        </div>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <!-- Tag chips with cross -->
        <span
          v-for="(tag, index) in tags"
          :key="index"
          class="inline-flex items-center gap-1 rounded-md
                 bg-indigo-600/30 border border-indigo-500/40
                 px-2 py-0.5 text-xs text-indigo-200"
        >
          <span class="break-all max-w-[150px]">{{ tag }}</span>
          <button
            type="button"
            class="ml-0.5 text-indigo-300 hover:text-white
                   transition-colors leading-none"
            @click.stop="removeTag(index)"
          >
            ×
          </button>
        </span>

        <span v-if="!tags?.length" class="text-xs text-slate-500">
          No tags — type in the field below and press Enter
        </span>

        <span
          v-if="tags?.length && environment"
          class="mx-1 text-slate-600"
        >
          •
        </span>

        <span v-if="environment" class="text-sm text-slate-400">
          {{ environment }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <button
        :disabled="isThisTestBusy"
        class="rounded-md border px-4 py-2 text-sm
               bg-[#10b981] text-black hover:opacity-90
               disabled:opacity-40 disabled:cursor-not-allowed"
        @click="runTest"
      >
        <span v-if="isThisTestBusy" class="animate-pulse">
          ⏳ Running...
        </span>
        <span v-else>
          ▶ Run Test
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { useTestOperations } from '@/composables/useTestOperations'

const props = defineProps({
  title: String,
  tags: Array,
  environment: String
})

const emit = defineEmits(['removeTag'])

const { runSelectedTest: runTest } = useTestOperations()
const { queuedRuns, selectedTest, tests, features } = storeToRefs(useTestStore())

const isThisTestBusy = computed(() => {
  return selectedTest.value?.status === 'running' ||
         queuedRuns.value.includes(selectedTest.value?.id)
})

const featureName = computed(() => {
  const feature = features.value.find(f => 
    f.tests.some(t => t.id === selectedTest.value?.id)
  )
  return feature?.name || 'Standalone'
})

function removeTag(index) {
  emit('removeTag', index)
}
</script>
