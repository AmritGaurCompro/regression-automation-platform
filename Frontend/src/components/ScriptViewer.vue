<template>
  <div class="mb-3 flex items-center gap-6 border-b border-slate-800">
    <button
      class="text-sm font-medium pb-2 -mb-px border-b-2 transition-colors"
      :class="activeTab === 'raw'
        ? 'text-white border-white'
        : 'text-muted-foreground border-transparent hover:text-white'"
      @click="activeTab = 'raw'"
    >
      Raw Script
    </button>

    <button
      class="text-sm font-medium pb-2 -mb-px border-b-2 transition-colors"
      :class="activeTab === 'normalized'
        ? 'text-white border-white'
        : 'text-muted-foreground border-transparent hover:text-white'"
      @click="activeTab = 'normalized'"
    >
      Normalized Preview
    </button>
  </div>
  <div class="rounded-xl border border-slate-800 bg-[#1c2333]">
    <!-- Tabs -->
    <div class="flex items-center gap-6 border-b px-6 py-3">
      <div
        v-if="activeTab === 'raw'"
        class="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs text-slate-400"
      >
        Imported from Codegen
        <span class="rounded bg-background px-2 py-0.5">ORIGINAL</span>
      </div>
      <div
        v-else
        class="inline-flex items-center gap-2 rounded-md bg-slate-700/40 px-3 py-1 text-xs text-slate-300"
      >
        Normalized &amp; Ready
        <span class="rounded bg-slate-600/40 px-2 py-0.5">
          {{ normalizationApplied ? 'BASEURL + ENV VARS APPLIED' : 'PREVIEW ONLY' }}
        </span>
      </div>
      <div class="ml-auto">
        <button
          class="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          @click="onCopy"
        >
          {{ copyText }}
        </button>
      </div>
    </div>

    <!-- Code -->
    <pre class="overflow-auto px-6 py-4 text-sm bg-[rgb(13_17_23)]">
      <code>{{ displayedScript }}</code>
    </pre>

    <!-- Footer -->
    <div
      v-if="activeTab === 'normalized'"
      class="flex justify-end gap-3 border-t px-6 py-4"
    >
      <button
        v-if="!resetNormalization"
        class="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        @click="applyNormalization"
      >
        Apply Normalization
      </button>
      <button
        v-else
        class="rounded-md border px-4 py-2 text-sm hover:bg-muted opacity-50 cursor-not-allowed"
        disabled
      >
        Normalization Applied
      </button>
      <button
        class="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
        @click="saveToFile"
      >
        Save Script
      </button>
    </div>
  </div>

  <Card
    v-if="activeTab === 'normalized'"
    class="mt-4 px-2 bg-[#0d1117] border-l-[3px] border-l-slate-600
           border-r-transparent border-b-transparent border-t-transparent rounded-lg"
  >
    <CardHeader class="p-4">
      <CardDescription class="text-xs text-[#64748b] leading-5">
        <span class="font-semibold">Normalization rules:</span>
        Hardcoded URLs → baseURL from config •
        Passwords → process.env.TEST_PASSWORD •
        Enable trace & screenshots on failure
      </CardDescription>
    </CardHeader>
  </Card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'

import {
  Card,
  CardDescription,
  CardHeader
} from '@/components/ui/card'

const testStore = useTestStore()

const { resetNormalization } = storeToRefs(testStore)

const props = defineProps({
  rawScript: {
    type: String,
    required: true
  },
  normalizedScript: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['copy', 'apply-normalization', 'save-script'])

const activeTab = ref('raw')

const displayedScript = computed(() => {
  if (activeTab.value === 'raw') {
    return props.rawScript
  }
  // Show normalized only if Apply Normalization was clicked
  // otherwise show raw script in normalized tab too
  return resetNormalization.value ? props.normalizedScript : props.rawScript
})

const applyNormalization = () => {
  resetNormalization.value = true
  emit('apply-normalization')
}


let copyText=ref("Copy")

const onCopy = () => {

  copyText.value = "Copied!"

  setTimeout(()=>{
    copyText.value = "Copy"
  },2000)

  navigator.clipboard.writeText(displayedScript.value)
  emit('copy')
}

// Reset normalization when switching back to raw tab
const resetNormalizationFun = () => {
  resetNormalization.value = false
}

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'raw') {
    resetNormalizationFun()
  }
})

const saveToFile = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `script-${timestamp}.js`

  const blob = new Blob([displayedScript.value], {
    type: 'text/javascript;charset=utf-8'
  })

  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}

</script>