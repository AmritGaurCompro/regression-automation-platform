<script setup>
import { computed, ref } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'

import HeadingBar from '@/components/HeadingBar.vue'
import TestData from '@/components/TestData.vue'
import ScriptViewer from '@/components/ScriptViewer.vue'
import RunResult from '@/components/RunResult.vue'

const testStore = useTestStore()
const { selectedTest } = storeToRefs(testStore)

// Test-level properties (from Test model)
const environment = computed({
  get: () => selectedTest.value?.environment || '',
  set: val => (selectedTest.value.environment = val)
})

const tags = computed({
  get: () => selectedTest.value?.tags?.join(', ') || '', 
  set: val => {
    selectedTest.value.tags = val
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }
})

// Test run configuration (for creating new test_run)
const runnerMode = computed({
  get: () => selectedTest.value?.runner_mode || 'headless',
  set: val => (selectedTest.value.runner_mode = val)
})

const retries = computed({
  get: () => selectedTest.value?.retries_on_failure ?? 2,
  set: val => (selectedTest.value.retries_on_failure = val)
})

const rawScriptContent = computed(() => selectedTest.value?.script || '// No script available')
const scriptFilename = computed(() => selectedTest.value?.script_filename || `${selectedTest.value?.title}.spec.js`)
</script>

<template>
  <div class="w-full mt-5 lg:mt-0 lg:ml-10 lg:w-[75%] rounded-xl space-y-6 bg-[#161b26]">
    <HeadingBar
      v-if="selectedTest"
      :title="selectedTest.title"
      :tags="selectedTest.tags"
      :environment="selectedTest.environment"
      @runTest="runSelectedTest"
    />

    <TestData
      v-if="selectedTest"
      :environment="environment"
      :tags="tags"
      :runnerMode="runnerMode"
      :retries="retries"
      :environments="[
        { value: 'QA', label: 'QA' },
        { value: 'DEV', label: 'DEV' }
      ]"
      @update:environment="environment = $event"
      @update:tags="tags = $event"
      @update:runnerMode="runnerMode = $event"
      @update:retries="retries = $event"
    />

    <ScriptViewer
      v-if="selectedTest"
      :rawScript="rawScriptContent"
      :scriptFilename="scriptFilename"
    />
    
    <RunResult v-if="selectedTest" />
  </div>
</template>
