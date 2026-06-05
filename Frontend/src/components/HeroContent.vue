<script setup>
import { computed, watch } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { useTestOperations } from '@/composables/useTestOperations'

import HeadingBar from '@/components/HeadingBar.vue'
import TestData from '@/components/TestData.vue'
import ScriptViewer from '@/components/ScriptViewer.vue'
import RunResult from '@/components/RunResult.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const testStore = useTestStore()
const { selectedTest, testRuns } = storeToRefs(testStore)
const { runSelectedTest } = useTestOperations()

watch(
  () => selectedTest.value?.id,
  async (newId) => { if (newId) await testStore.fetchTestRuns(newId) },
  { immediate: true }
)

const environment = computed({
  get: () => selectedTest.value?.environment || 'QA',
  set: val => {
    if (!selectedTest.value) return
    selectedTest.value.environment = val
    testStore.saveTestMeta(selectedTest.value.id, { environment: val })
  }
})

function removeTagFromHeading(index) {
  if (!selectedTest.value) return
  const newTags = selectedTest.value.tags.filter((_, i) => i !== index)
  testStore.syncTagsToTestsList(selectedTest.value.id, newTags)
  testStore.saveTestMeta(selectedTest.value.id, { tags: newTags })
}

function handleTagsUpdate(newTags) {
  if (!selectedTest.value) return
  testStore.syncTagsToTestsList(selectedTest.value.id, newTags)
  testStore.saveTestMeta(selectedTest.value.id, { tags: newTags })
}

const tags = computed({
  get: () => {
    const t = selectedTest.value?.tags
    if (!t) return []
    if (Array.isArray(t)) return t
    return t.split(',').map(s => s.trim()).filter(Boolean)
  },
  set: val => handleTagsUpdate(Array.isArray(val) ? val : [])
})

const runnerMode = computed({
  get: () => selectedTest.value?.runner_mode || 'headless',
  set: val => {
    selectedTest.value.runner_mode = val
    if (selectedTest.value?.id) testStore.saveTestMeta(selectedTest.value.id, { runner_mode: val })
  }
})

const retries = computed({
  get: () => selectedTest.value?.retries_on_failure ?? 2,
  set: val => {
    selectedTest.value.retries_on_failure = val
    if (selectedTest.value?.id) testStore.saveTestMeta(selectedTest.value.id, { retries_on_failure: val })
  }
})

const rawScriptContent = computed(() => selectedTest.value?.script?.raw || '// No script available')
const normalizedScriptContent = computed(() => selectedTest.value?.script?.normalized || '// No script available')
const scriptFilename = computed(() => selectedTest.value?.script_filename || `${selectedTest.value?.title}.spec.js`)

// Latest run for the inline status strip
const latestRun = computed(() => testRuns.value?.[0] ?? null)
</script>

<template>
  <div class="w-full mt-5 lg:mt-0 lg:ml-10 lg:w-[75%] space-y-5">

    <!-- Nothing selected state -->
    <div
      v-if="!selectedTest"
      class="flex flex-col items-center justify-center h-64
             rounded-xl border border-dashed border-slate-800 text-slate-600"
    >
      <p class="text-lg">← Select a test to get started</p>
    </div>

    <template v-else>
      <!-- 1. Heading -->
      <HeadingBar
        :title="selectedTest.title"
        :tags="tags"
        :environment="selectedTest.environment"
        @removeTag="removeTagFromHeading"
      />

      <!-- 2. Latest run status strip — shown immediately so outcome is always visible -->
      <div
        v-if="latestRun || selectedTest.status !== 'NEW'"
        class="flex items-center justify-between
               rounded-xl border border-slate-800 bg-[#1c2333]
               px-5 py-3 gap-4"
      >
        <div class="flex items-center gap-3">
          <StatusBadge :status="selectedTest.status" size="md" />
          <span class="text-slate-400 text-xs">
            <template v-if="latestRun?.finished_at">
              Finished {{ new Date(latestRun.finished_at).toLocaleString() }}
            </template>
            <template v-else-if="latestRun?.started_at">
              Started {{ new Date(latestRun.started_at).toLocaleString() }}
            </template>
            <template v-else>No run data yet</template>
          </span>
        </div>
        <span v-if="latestRun?.duration" class="text-slate-500 text-xs shrink-0">
          ⏱ {{ latestRun.duration }}
        </span>
      </div>

      <!-- 3. Config (environment, tags, retries) -->
      <TestData
        :environment="environment"
        :tags="tags"
        :runnerMode="runnerMode"
        :retries="retries"
        :environments="[
          { value: 'QA', label: 'QA' },
          { value: 'DEV', label: 'DEV' }
        ]"
        @update:environment="environment = $event"
        @update:tags="handleTagsUpdate($event)"
        @update:runnerMode="runnerMode = $event"
        @update:retries="retries = $event"
      />

      <!-- 4. Script viewer -->
      <ScriptViewer
        :rawScript="rawScriptContent"
        :normalizedScript="normalizedScriptContent"
        :scriptFilename="scriptFilename"
      />

      <!-- 5. Full run result (history, artifacts, error log) -->
      <RunResult :runs="testRuns" />
    </template>
  </div>
</template>