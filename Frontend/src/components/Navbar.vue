<script setup >

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'


import Input from './ui/input/Input.vue';
import {  Search } from 'lucide-vue-next';
import Button from './ui/button/Button.vue';
import Separator from './ui/separator/Separator.vue';
import { useTestStore } from '@/stores/testStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue'
import RecordTestModal from '@/components/RecordTestModal.vue'

const testStore = useTestStore();
const { searchQuery } = storeToRefs(testStore);
const recordModalRef = ref(null)

const openRecordModal = () => {
  recordModalRef.value?.show()
}

</script>

<template>
  
    <nav class="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div class="p-2 gap-3 flex flex-col justify-start w-full items-start flex-wrap lg:flex-row lg:justify-between lg:items-center">
            <div class="p-2 flex gap-7 pt-3">
                <Avatar class="ml-2 mt-1">
                    <AvatarImage src="https://github.com/shadcn.png" alt="logo" />
                    <AvatarFallback>logo</AvatarFallback>
                </Avatar>

                <div class="flex flex-col gap-1">
                    <h4 class="font-semibold">Playwright Regression Suite</h4>
                    <div class="text-xs text-slate-500 font-semibold">
                      <p>Codegen • Normalize • Replay • Debug</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-2 relative flex items-center w-11/12 lg:w-5/12 px-3">
                <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input v-model="searchQuery" placeholder="Search by name, tag, or environment..." class="flex flex-1 pl-10 p-5 px-9 bg-[#161b26] focus:bg-gray-800" />
            </div>

            <div class="lg:mr-3">
                <Button class="bg-red-500 m-3 px-3 py-5 rounded-md hover:bg-red-600 focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white animate-pulse transition-all duration-200 ease-out
    hover:-translate-y-0.5 focus-visible:-translate-y-0.5 " @click="openRecordModal">● Record New</Button>
                <Button class="px-3 py-5 rounded-md focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white hover:-translate-y-0.5 focus-visible:-translate-y-0.5">📥 Import</Button>
                <RecordTestModal ref="recordModalRef" />
            </div>
        </div>
     
    </nav>
    <Separator class="my-2 " />
 

</template>
