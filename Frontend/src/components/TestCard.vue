<script setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from './ui/button';
import Badge from './ui/badge/Badge.vue';
import { useDateFormatter } from '@/composables/useDateFormatter';
import { computed } from 'vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'


const props = defineProps({
    tests:{
        type: Object,
        required: true
    }
})
const emit = defineEmits(['action'])

const { formatDateTime } = useDateFormatter()

const { queuedRuns } = storeToRefs(useTestStore())

// ↓ ADDED: check if this specific test is busy
const isThisTestBusy = computed(() => {
  return props.tests?.status === 'running' ||
         queuedRuns.value.includes(props.tests?.id)
})

const queuePosition = computed(() => {
  const pos = queuedRuns.value.indexOf(props.tests.id)
  return pos !== -1 ? pos + 1 : null
})

</script>

<template>
    <Card class="bg-[#1c2333] mt-5 cursor-pointer border-l-[#1e293b] border-l-4 border-r-2 border-t-2 border-b-2 hover:border-sky-500  transition-colors duration-200 ease-out hover:bg-[#1a2740]">
    <CardHeader>
      <CardTitle class="flex justify-between gap-3 items-start flex-wrap">

        <div>
          <p class="animate-pulse" v-if="tests?.status=='failed'">🔴</p>
          <p  v-else-if="tests.status=='passed'">🟢</p>
          <p v-else>🔘</p>

          <p class="text-slate-500 text-xs font-semibold mt-1">{{ tests?.status }}</p>
        </div>

        <div class="flex flex-col gap-3 ">
          <p class="text-wrap">{{ tests?.title?.split('_').slice(0, -1).join('_') || tests?.title }}</p>          <p class="text-xs font-normal">🌐 {{ tests?.environment }}</p>
        </div>

        <p class="text-slate-500 text-xs font-semibold text-wrap" v-if="tests?.lastRun!=null" >{{ formatDateTime(new Date(tests.lastRun)) }}</p>
        <p class="text-slate-500 text-xs font-semibold text-wrap" v-else>Never run</p>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex justify-center gap-2 mt-2 flex-wrap">
        <Badge v-for="(tag, index) in tests?.tags" :key="index" variant="outline" class="bg-black opacity-75 py-1 cursor-pointer">{{ tag }}</Badge>
      </div>
    </CardContent>

    <CardFooter class="flex justify-center gap-3">
      <Button size="sm" class="bg-black opacity-75  hover:bg-transparent hover:border-2 hover:border-gray-700 focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" >View</Button>
      <!-- ↓ CHANGED: added isThisTestBusy disable -->
      <Button
        size="sm"
        :disabled="isThisTestBusy"
        class="bg-black opacity-75  hover:bg-transparent hover:border-2 hover:border-gray-700 focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40 disabled:cursor-not-allowed"
        @click.stop="emit('action')"
      >
        <span v-if="tests?.status === 'running'" class="animate-pulse">⏳ Running...</span>
        <span v-else-if="queuePosition" class="animate-pulse">🕐 Queue #{{ queuePosition }}</span>
        <span v-else>▶ Run</span>
      </Button>
    </CardFooter>
    
  </Card>
</template>