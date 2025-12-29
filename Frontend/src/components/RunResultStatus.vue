<script setup>
import { computed } from "vue"
import { Badge } from "@/components/ui/badge"

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  runId: String,
  runTime: String,
})
const isPassed = computed(() => props.status === "passed")
const containerClasses = computed(() =>
  isPassed.value
    ? "border-emerald-600/40 from-emerald-900/40 to-emerald-950"
    : "border-red-600/40 from-red-900/40 to-red-950"
)
</script>

<template>
  <div
    class="rounded-xl border px-6 py-5
           bg-gradient-to-b
           flex flex-col gap-4
           sm:flex-row sm:items-center sm:justify-between"
    :class="containerClasses"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full"
        :class="isPassed ? 'bg-emerald-600' : 'bg-red-600'"
      >
        <span class="text-xl text-white">
          {{ isPassed ? "✔" : "✕" }}
        </span>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-white">
          {{ isPassed ? "Test Passed" : "Test Failed" }}
        </h3>
        <p class="text-sm text-slate-400">
          Run {{ runId }} • {{ runTime }}
        </p>
      </div>
    </div>
    <Badge
      :variant="isPassed ? 'success' : 'destructive'"
      class="uppercase tracking-wide self-start sm:self-auto"
    >
      {{ isPassed ? "PASSED" : "FAILED" }}
    </Badge>
  </div>
</template>
