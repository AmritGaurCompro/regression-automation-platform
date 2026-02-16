<script setup >
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ref } from 'vue';

defineProps({
    passCnt:{
        type: Number,
        required: true
    },
    failCnt:{
        type: Number,
        required: true
    },
    notRunCnt:{
        type: Number,
        required: true
    }
})


</script>

<template>

<div class="flex flex-col items-center lg:flex-row gap-3 flex-wrap">

  <Card class="mt-5 rounded-lg overflow-hidden w-full lg:w-1/3 bg-[#1c2333] h-28 flex-wrap">
    <CardHeader>
      <CardTitle class="text-center text-[#10b981] text-2xl font-bold ">{{ passCnt }}</CardTitle>
    </CardHeader>
     
    <CardFooter class="text-xs text-slate-500 font-semibold justify-center text-wrap">
     PASSED
    </CardFooter>
  </Card>
  
  <Card class="mt-5 rounded-lg overflow-hidden w-full lg:w-1/3 bg-[#1c2333] h-28">
    <CardHeader>
      <CardTitle class="text-center text-[#ef4444] text-2xl font-bold">{{ failCnt }}</CardTitle>
    </CardHeader>
     
    <CardFooter class="text-xs text-slate-500 font-semibold justify-center text-wrap">
     FAILED
    </CardFooter>
  </Card>

  <Card class="mt-5 rounded-lg overflow-hidden w-full  lg:w-1/3 bg-[#1c2333] h-28">
    <CardHeader>
      <CardTitle class="text-center text-slate-500 text-2xl font-bold ">{{ notRunCnt }}</CardTitle>
    </CardHeader>
     
    <CardFooter class="text-xs text-slate-500 font-semibold justify-center text-nowrap">
     RUNNING
    </CardFooter>
  </Card>

  </div>
</template>
