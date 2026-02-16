<script setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import Separator from './ui/separator/Separator.vue'
import PassFailCountCard from './PassFailCountCard.vue'
import TestCard from './TestCard.vue'
import InformationalTip from './InformationalTip.vue'

import { onMounted } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { useTestFilter } from '@/composables/useTestFilter'
import { useTestStats } from '@/composables/useTestStats'
import { useTestOperations } from '@/composables/useTestOperations'

const testStore = useTestStore()

// ✅ reactive store refs
const { tests, selectedTest, searchQuery } = storeToRefs(testStore)

// ✅ composables
const { runSelectedTest } = useTestOperations()

// ✅ fetch tests from backend when sidebar loads
onMounted(async () => {
  await testStore.refreshTestsFromBackend()

  if (tests.value.length > 0) {
    testStore.setSelectedTest(tests.value[0])
  }
})

// ✅ filters + stats now use store tests
const { filteredTests } = useTestFilter(tests, searchQuery)
const { passCnt, failCnt, notRunCnt } = useTestStats(tests)

// ✅ run handler
const handleRunTest = async (test) => {
  testStore.setSelectedTest(test)
  await runSelectedTest()
}
</script>

<template>
  <Card class="mt-36 lg:mt-0 w-full lg:w-[25%] rounded-lg overflow-hidden">
    <CardHeader class="bg-[#1c2333]">
      <CardTitle class="font-bold">Test Scripts</CardTitle>
      <CardDescription class="text-xs text-slate-500 font-semibold">
        {{ filteredTests.length }} of {{ tests.length }} tests
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent class="bg-[#161b26]">
      <PassFailCountCard
        :passCnt="passCnt"
        :failCnt="failCnt"
        :notRunCnt="notRunCnt"
      />
      <div v-for="test in filteredTests" :key="test.id">
        <TestCard
          :tests="test"
          @click="testStore.setSelectedTest(test)"
          :class="selectedTest?.id === test.id ? 'border-[#6366f1] border-l-[#8b5cf6]' : ''"
          @action="handleRunTest(test)"
        />
      </div>
    </CardContent>
    <CardFooter class="bg-[#161b26]">
      <InformationalTip />
    </CardFooter>
  </Card>
</template>
