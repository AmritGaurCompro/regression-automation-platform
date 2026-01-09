<script setup>
import { computed, ref } from "vue"
import { Badge } from "@/components/ui/badge"

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => {
      try {
        return ["PASS", "FAIL", "PENDING", null, undefined].includes(value)
      } catch {
        return false
      }
    },
  },
  runId: String,
  runTime: String,
})

const error = ref(null)

const getStatusValue = () => {
  try {
    const normalizedStatus = props.status?.toUpperCase?.()?.trim?.()
    if (!normalizedStatus) return "PENDING"
    if (["PASS", "FAIL"].includes(normalizedStatus)) {
      return normalizedStatus
    }
    return "PENDING"
  } catch (err) {
    error.value = "Error processing status"
    return "PENDING"
  }
}

const isPassed = computed(() => {
  try {
    return getStatusValue() === "PASS"
  } catch {
    return false
  }
})

const containerClasses = computed(() => {
  try {
    return isPassed.value
      ? "border-emerald-600/40 from-emerald-900/40 to-emerald-950"
      : "border-red-600/40 from-red-900/40 to-red-950"
  } catch {
    return "border-slate-600/40 from-slate-900/40 to-slate-950"
  }
})

const getStatusText = () => {
  try {
    const status = getStatusValue()
    if (status === "PASS") return "Test Passed"
    if (status === "FAIL") return "Test Failed"
    return "Not Run Yet"
  } catch {
    return "Status Unknown"
  }
}

const getBadgeText = () => {
  try {
    const status = getStatusValue()
    if (status === "PASS") return "PASSED"
    if (status === "FAIL") return "FAILED"
    return "PENDING"
  } catch {
    return "ERROR"
  }
}

const getRunInfo = () => {
  try {
    const id = props.runId ?? "—"
    const time = props.runTime ?? "—"
    return `Run ${id} • ${time}`
  } catch {
    return "Run info unavailable"
  }
}
</script>

<template>
  <div v-if="error" class="rounded-xl border border-red-600/40 bg-red-900/20 px-6 py-5 text-red-300">
    {{ error }}
  </div>

  <div
    v-else
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
          {{ getStatusText() }}
        </h3>
        <p class="text-sm text-slate-400">
          {{ getRunInfo() }}
        </p>
      </div>
    </div>
    <Badge
      :class="{
        'bg-emerald-600': isPassed,
        'bg-red-600': !isPassed,
      }"
      class="uppercase tracking-wide self-start sm:self-auto"
    >
      {{ getBadgeText() }}
    </Badge>
  </div>
</template>