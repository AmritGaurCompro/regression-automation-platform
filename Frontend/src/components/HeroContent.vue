<script setup>
import { computed } from 'vue'
import { selectedTest } from '@/utils/SelectedTestInfo'

import HeadingBar from '@/components/HeadingBar.vue'
import TestData from '@/components/TestData.vue'
import ScriptViewer from '@/components/ScriptViewer.vue'
import RunResult from '@/components/RunResult.vue'

/* Derived state from selectedTest */
const environment = computed({
  get: () => selectedTest.value?.environment || '',
  set: val => (selectedTest.value.environment = val)
})

const tags = computed({
  get: () => selectedTest.value?.tags.join(', ') || '', 
  set: val => {
    selectedTest.value.tags = val
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }
})

const runnerMode = 'headless'
const retries = 2

const rawScriptContent = `test('login flow', async ({ page }) => {
  await page.goto('https://staging.example.com')
})`

const normalizedScriptContent = `test('login flow', async ({ page }) => {
  await page.goto('/')
})`

const handleRunTest = () => {
  console.log('Run test', selectedTest.value)
}
</script>

<template>
  <div class="w-full mt-5 lg:mt-0 lg:ml-10 lg:w-[75%] rounded-xl space-y-6 bg-[#161b26]">
    <HeadingBar
      v-if="selectedTest"
      :title="selectedTest.title"
      :tags="selectedTest.tags"
      :environment="selectedTest.environment"
      @run="handleRunTest"
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
    />

    <ScriptViewer
      :rawScript="rawScriptContent"
      :normalizedScript="normalizedScriptContent"
    />
    <RunResult />
  </div>
</template>
