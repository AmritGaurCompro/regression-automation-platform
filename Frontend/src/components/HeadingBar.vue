<template>
  <div
    class="flex items-center justify-between
           rounded-lg bg-[#1c2333] border border-slate-800
           px-6 py-4"
           display="flex"
           
  >
    <div>
      <h1 class="text-xl font-bold text-white">
        {{ title }}
      </h1>

      <p class="mt-1 text-sm text-slate-400">
        Tags: {{ tags.join(', ') }}
        <span class="mx-1">•</span>
        Environment: {{ environment }}
      </p>
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

<script>
import { useTestStore } from '@/stores/testStore'

export default {
  name: 'HeadingBar',

  props: {
    title: String,
    tags: Array,
    environment: String
  },

  setup() {
    const testStore = useTestStore()
    return { testStore }
  },

  methods: {
    runTest() {
      const { selectedTest } = this.testStore

      if (!selectedTest) return

      selectedTest.lastRun = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date()) + ' • ' +
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date())
    }
  }
}
</script>
