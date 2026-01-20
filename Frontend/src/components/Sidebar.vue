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

import { ref } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { useTestFilter } from '@/composables/useTestFilter'
import { useTestStats } from '@/composables/useTestStats'
import { useTestOperations } from '@/composables/useTestOperations'

const testStore = useTestStore()
const { selectedTest, searchQuery } = storeToRefs(testStore)
const { runTest: executeTest } = useTestOperations()

const testsDesc = ref([
  {
    id: Math.random(),
    title: 'Login',
    environment: 'QA',
    tags: ['smoke', 'login', 'core'],
    lastRun: null,
    status: 'FAIL',
  },
  {
    id: Math.random(),
    title: 'Navigation',
    environment: 'DEV',
    tags: ['regression', 'navigation'],
    lastRun: null,
    status: 'PASS',
  },
  {
    id: Math.random(),
    title: 'Page Load',
    environment: 'QA',
    tags: ['performance'],
    lastRun: null,
    status: 'NEW',
  },
])

testStore.setSelectedTest(testsDesc.value[0] || null)

const { filteredTests } = useTestFilter(testsDesc, searchQuery)
const { passCnt, failCnt, notRunCnt } = useTestStats(testsDesc)

const runTest = (ind) => {
  const test = testsDesc.value[ind]
  testStore.setSelectedTest(test)
  executeTest(test)
}
</script>

<template>
  <Card class="mt-36 lg:mt-0 w-full lg:w-[25%] rounded-lg overflow-hidden">
    <CardHeader class="bg-[#1c2333]">
      <CardTitle class="font-bold">Test Scripts</CardTitle>
      <CardDescription class="text-xs text-slate-500 font-semibold">
        {{ filteredTests.length }} of {{ testsDesc.length }} tests
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
          :desc="test"
          @click="selectedTest = test"
          :class="selectedTest?.id === test.id ? 'border-[#6366f1] border-l-[#8b5cf6]' : ''"
          @action="runTest(testsDesc.indexOf(test))"
        />
      </div>
    </CardContent>
    <CardFooter class="bg-[#161b26]">
      <InformationalTip />
    </CardFooter>
  </Card>
</template>
