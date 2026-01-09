<script setup >
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Separator from './ui/separator/Separator.vue';
import PassFailCountCard from './PassFailCountCard.vue';
import TestCard from './TestCard.vue';
import { computed, ref } from 'vue';
import InformationalTip from './InformationalTip.vue';
import { useTestStore } from '@/stores/testStore';
import { storeToRefs } from 'pinia';
import test from 'node:test';

const testStore = useTestStore();
const { selectedTest, searchQuery } = storeToRefs(testStore);
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date) + ' • ' +
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
}


let testsDesc=ref([
    {
        id: Math.random(),
        title:"Login",
        environment: "QA",
        tags:["smoke","login","core"],
        lastRun: null,
        status: "FAIL"
    },

    {
        id: Math.random(),
        title:"Navigation",
        environment: "DEV",
        tags:["regression","navigation"],
        lastRun: null,
        status: "PASS"
    },

    {
        id: Math.random(),
        title:"Page Load",
        environment: "QA",
        tags:["performance"],
        lastRun: null,
        status: "NEW"
    }
])

testStore.setSelectedTest(testsDesc.value[0] || null);

const filteredTests = computed(() => {
  if (!searchQuery.value.trim()) {
    return testsDesc.value;
  }
  
  const query = searchQuery.value.trim().toLowerCase();
  return testsDesc.value.filter(test => {
    return (
      test.title.toLowerCase().includes(query) ||
      test.environment.toLowerCase().includes(query) ||
      test.tags.some(tag => tag.toLowerCase().includes(query)) 
    );
  });
});

const passCnt = computed(() =>
  testsDesc.value.filter(t => t.status === 'PASS').length
)

const failCnt = computed(() =>
  testsDesc.value.filter(t => t.status === 'FAIL').length
)

const notRunCnt = computed(() =>
  testsDesc.value.filter(t => t.status === 'NEW').length
)


let runTest=(ind)=>{
    testsDesc.value[ind].lastRun=formatDate(new Date());
}

</script>

<template>
    
  <Card class="mt-36 lg:mt-0 w-full lg:w-[25%] rounded-lg overflow-hidden ">
    <CardHeader class="bg-[#1c2333]">
      <CardTitle class="font-bold">Test Scripts</CardTitle>
      <CardDescription class="text-xs text-slate-500 font-semibold">
        {{ filteredTests.length }} of {{ testsDesc.length }} tests
      </CardDescription>
    </CardHeader>
    <Separator/>
    <CardContent class="bg-[#161b26]">
      <PassFailCountCard :passCnt="passCnt" :failCnt="failCnt" :notRunCnt="notRunCnt"/>
      <div v-for="test in filteredTests" :key="test.id">
        <TestCard :desc="test" @click="selectedTest = test" :class="selectedTest?.id === test.id ? 'border-[#6366f1] border-l-[#8b5cf6]' : ''" @action="runTest(testsDesc.indexOf(test))" />
      </div>
    </CardContent>
    <CardFooter class="bg-[#161b26]">
      <InformationalTip/>
    </CardFooter>
  </Card>
</template>
