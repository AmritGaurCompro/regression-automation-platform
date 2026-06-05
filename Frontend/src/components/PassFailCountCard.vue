<script setup>
defineProps({
  passCnt:  { type: Number, required: true },
  failCnt:  { type: Number, required: true },
  runCnt:   { type: Number, required: true },
  queueCnt: { type: Number, required: true }
})
</script>

<template>
  <div class="grid grid-cols-2 gap-3 mt-5">
    <!-- Passed -->
    <div class="rounded-lg bg-[#1c2333] border border-slate-800 px-4 py-3 text-center">
      <p class="text-2xl font-semibold text-slate-100 tabular-nums">{{ passCnt }}</p>
      <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-1">Passed</p>
    </div>

    <!-- Failed -->
    <div class="rounded-lg bg-[#1c2333] border border-slate-800 px-4 py-3 text-center">
      <p class="text-2xl font-semibold text-slate-100 tabular-nums">{{ failCnt }}</p>
      <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-1">Failed</p>
    </div>

    <!-- Running -->
    <div class="rounded-lg bg-[#1c2333] border border-slate-800 px-4 py-3 text-center">
      <p class="text-2xl font-semibold text-slate-100 tabular-nums">{{ runCnt }}</p>
      <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-1">Running</p>
    </div>

    <!-- Queued -->
    <div class="rounded-lg bg-[#1c2333] border border-slate-800 px-4 py-3 text-center">
      <p class="text-2xl font-semibold text-slate-100 tabular-nums">{{ queueCnt }}</p>
      <p class="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-1">Queued</p>
    </div>
  </div>
</template>
