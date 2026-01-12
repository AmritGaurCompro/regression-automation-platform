<template>
  <div
    class="flex items-center justify-between
           rounded-lg bg-[#1c2333] border border-slate-800
           px-6 py-4"
  >
    <div>
      <h1 class="text-xl font-bold text-white">
        {{ title }}
      </h1>

      <div class="mt-1 flex items-center text-sm text-slate-400">
        <!-- Tags -->
        <span>Tags: </span>
        <span v-if="tags?.length" class="ml-1">
          {{ tags.join(', ') }}
        </span>

        <!-- Bullet -->
        <span v-if="tags?.length && environment" class="mx-2">
          • Environment:
        </span>

        <!-- Environment -->
        <span v-if="environment">
          {{ environment }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        class="rounded-md border px-3 py-3 text-sm hover:bg-muted bg-[#10b981]"
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

