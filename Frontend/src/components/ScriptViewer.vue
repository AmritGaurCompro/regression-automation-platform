<template>
  <div class="mb-4 ml-6 gap-4">
    <button
      class="text-sm font-medium mr-4"
      :class="activeTab === 'raw'
        ? 'text-primary border-b-2 border-primary pb-2'
        : 'text-muted-foreground'"
      @click="activeTab = 'raw'"
    >
      Raw Script
    </button>

    <button
      class="text-sm font-medium"
      :class="activeTab === 'normalized'
        ? 'text-primary border-b-2 border-primary pb-2'
        : 'text-muted-foreground'"
      @click="activeTab = 'normalized'"
    >
      Normalized Preview
    </button>
    <hr class="mr-6" />
  </div>

  <div class="rounded-xl bg-[#161b26] border ml-5 mr-5">
    <!-- Tabs -->
    <div class="flex items-center gap-6 border-b px-6 py-3">
      <div
        v-if="activeTab === 'raw'"
        class="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs"
      >
        📥 Imported from Codegen
        <span class="rounded bg-background px-2 py-0.5">ORIGINAL</span>
      </div>

      <div
        v-else
        class="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-1 text-xs text-amber-400"
      >
        ✨ Normalized & Ready
        <span class="rounded bg-amber-500/20 px-2 py-0.5">
          BASEURL + ENV VARS APPLIED
        </span>
      </div>

      <div class="ml-auto">
        <button
          class="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          @click="onCopy"
        >
          📋 Copy
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
        class="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        @click="$emit('apply-normalization')"
      >
        🔄 Apply Normalization
      </button>

      <button
        class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        @click="$emit('save-script')"
      >
        💾 Save Script
      </button>
    </div>
  </div>

  <Card
    class="ml-4 mr-4 px-2 bg-[#0d1117] border-l-[3px] border-l-[#6366f1]
           border-r-transparent border-b-transparent border-t-transparent rounded-lg"
  >
    <CardHeader class="p-4">
      <CardDescription class="text-xs text-[#64748b] leading-5">
        💡 <span class="font-semibold">Normalization rules:</span> Hardcoded URLs → baseURL from config • Passwords → process.env.TEST_PASSWORD • Enable trace & screenshots on failure
      </CardDescription>
    </CardHeader>
  </Card>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Card,
  CardDescription,
  CardHeader
} from '@/components/ui/card'

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

const displayedScript = computed(() =>
  activeTab.value === 'raw'
    ? props.rawScript
    : props.normalizedScript
)

const onCopy = () => {
  navigator.clipboard.writeText(displayedScript.value)
  emit('copy')
}
</script>

