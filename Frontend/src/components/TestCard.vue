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



defineProps({
    tests:{
        type: Object,
        required: true
    }
})
const emit = defineEmits(['action'])

const { formatDateTime } = useDateFormatter()

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
          <p class="text-wrap ">{{  tests?.title }}</p>
          <p class="text-xs font-normal">🌐 {{ tests?.environment }}</p>
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
      <Button size="sm" class="bg-black opacity-75  hover:bg-transparent hover:border-2 hover:border-gray-700 focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" @click.stop="emit('action')">▶ Run</Button>
    </CardFooter>
    
  </Card>
</template>

