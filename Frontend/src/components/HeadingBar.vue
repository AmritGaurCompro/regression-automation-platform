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
        class="rounded-md border px-4 py-2 text-sm
               bg-[#10b981] text-black hover:opacity-90"
        @click="runTest"
      >
        ▶ Run Test
      </button>
    </div>
  </div>
</template>

<script setup>
import { useTestOperations } from '@/composables/useTestOperations'

defineProps({
  title: String,
  tags: Array,
  environment: String
})

const { runSelectedTest: runTest } = useTestOperations()

</script>


