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
import ScrollArea from './ui/scroll-area/ScrollArea.vue'

const testStore = useTestStore()

const { tests, selectedTest, searchQuery } = storeToRefs(testStore)

const { runSelectedTest } = useTestOperations()

onMounted(async () => {
  await testStore.refreshTestsFromBackend()

  if (tests.value.length > 0) {
    testStore.setSelectedTest(tests.value[0])
  }
})

const { filteredTests } = useTestFilter(tests, searchQuery)
const { passCnt, failCnt, runCnt } = useTestStats(tests)

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
        :runCnt="runCnt"
      />
      
      <ScrollArea class="h-[28rem] w-full mt-5">
        <div class="pr-3">
          <div v-for="test in filteredTests" :key="test.id">
          <TestCard
            :tests="test"
            @click="testStore.setSelectedTest(test)"
            :class="selectedTest?.id === test.id ? 'border-[#6366f1] border-l-[#8b5cf6]' : ''"
            @action="handleRunTest(test)"
          />
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

    </CardContent>
    <CardFooter class="bg-[#161b26]">
      <InformationalTip />
    </CardFooter>
  </Card>
</template>
