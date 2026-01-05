<script setup>
import { Button } from "@/components/ui/button"
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="rounded-t-xl 
           border border-slate-800 px-6 py-5
           flex items-center justify-between bg-[#1c2333]
"
  >
    <div>
      <h2 class="text-xl font-semibold text-white">
        Latest Run Results
      </h2>
      <p class="text-sm text-slate-400 mt-1">
        Results for:
        <span class="text-slate-300">
          {{ title }}
        </span>
      </p>
    </div>

  
    <Button
      variant="outline"
      class="flex items-center gap-2
             bg-slate-900 text-slate-200
             border-slate-700 hover:bg-slate-800 focus-visible:outline-none
              focus-visible:ring-white"
    >
      🔄 Re-run
    </Button>
</div>
</template>
