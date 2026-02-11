<script setup>
import { reactive } from "vue"
import RunResultHeader from "./RunResultHeader.vue"
import RunResultStatus from "./RunResultStatus.vue"
import RunResultMeta from "./RunResultMeta.vue"
import ErrorLog from "./ErrorLog.vue"  
import Artifacts from "./Artifacts.vue"
import RunHistory from "./RunHistory.vue"
import { Card, CardHeader, CardContent } from "@/components/ui/card"    
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import { ref } from "vue"
import { computed } from "vue"

const testStore = useTestStore()
const { selectedTest } = storeToRefs(testStore)
const loading = ref(false)
const fetchError = ref(null)
const runs = [
  { id: "#128", status: "fail", environment: "QA", duration: "41s" },
  { id: "#127", status: "pass", environment: "QA", duration: "29s" },
  { id: "#125", status: "pass", environment: "DEV", duration: "33s" },
  { id: "#122", status: "fail", environment: "DEV", duration: "47s" },
] 


const runResult = reactive({
  id: "#128",
  duration: "41s",
  startedAt: "11:05:22",
  finishedAt: "11:06:03",
})

const artifacts = computed(() => selectedTest.value?.artifacts || [])

const errorArtifact = computed(() =>
  artifacts.value.find(a => a.kind === "error_log")
)

const fileArtifacts = computed(() =>
  artifacts.value.filter(a => a.kind !== "error_log")
)
</script>

<template>
  <div class="
 w-full lg:w-[100%] ">
    <RunResultHeader :title="selectedTest?.title"/>
    <div
      class="border border-slate-800
            bg-[#161b26]
             p-6 space-y-6"
    >
      <RunResultStatus
        :status=selectedTest?.status
        :run-id="runResult?.id"
        :run-time=selectedTest?.lastRun
      />
   
      <RunResultMeta
        :environment=selectedTest?.environment
        :duration="runResult?.duration"
        :started-at="runResult?.startedAt"
        :finished-at="runResult?.finishedAt"
      />
      <ErrorLog
  v-if="errorArtifact"
  :error="errorArtifact.metadata"
/>
        <Artifacts
  v-if="fileArtifacts.length"
  :artifacts="fileArtifacts"
/>
         <RunHistory :runs="runs" />
         <Card
  class="bg-[#0d1117] border-l-[3px] border-l-[#6366f1] w-full
         border-r-transparent border-b-transparent border-t-transparent
         rounded-lg"
>
  <CardHeader class="p-4">
    <CardDescription class="text-xs text-[#64748b] leading-5">
      ℹ️ <span class="font-semibold">MVP Note:</span>
      Runs are triggered manually from the Rails UI. Playwright executes
      headlessly and stores exit codes and artifacts. No CI/CD integration
      in this phase.
    </CardDescription>
  </CardHeader>
</Card>    
    </div>
  </div>
</template>
