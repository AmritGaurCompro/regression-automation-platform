<script setup>
import { reactive } from "vue"
import RunResultHeader from "./RunResultHeader.vue"
import RunResultStatus from "./RunResultStatus.vue"
import RunResultMeta from "./RunResultMeta.vue"
import ErrorLog from "./ErrorLog.vue"  
import Artifacts from "./Artifacts.vue"
import RunHistory from "./RunHistory.vue"
import { Card, CardHeader, CardContent } from "@/components/ui/card"    


const runs = [
  { id: "#128", status: "fail", environment: "QA", duration: "41s" },
  { id: "#127", status: "pass", environment: "QA", duration: "29s" },
  { id: "#125", status: "pass", environment: "DEV", duration: "33s" },
  { id: "#122", status: "fail", environment: "DEV", duration: "47s" },
] 
const runResult = reactive({
  status: "failed",
  id: "#128",
  time: "Dec 16, 2025 at 11:06 AM",
  environment: "QA",
  duration: "41s",
  startedAt: "11:05:22",
  finishedAt: "11:06:03",
  error: {
    type: "LOCATOR TIMEOUT",
    message: `
✖ main flow
waiting for getByRole('button', { name: 'Continue' }) to be visible
Timeout 30s exceeded.

Possible causes:
• UI element changed (button text/role modified)
• Slow backend response
• Wrong environment baseURL

Next steps:
→ Open trace.zip in Playwright Trace Viewer
→ Check screenshot for actual UI state
`,
  },
})
</script>

<template>
  <div class="px-6">
    <RunResultHeader />
    <div
      class="border border-slate-800
             bg-gradient-to-b from-slate-900 to-slate-950
             p-6 space-y-6"
    >
      <RunResultStatus
        :status="runResult.status"
        :run-id="runResult.id"
        :run-time="runResult.time"
      />
      <RunResultMeta
        :environment="runResult.environment"
        :duration="runResult.duration"
        :started-at="runResult.startedAt"
        :finished-at="runResult.finishedAt"
      />
      <ErrorLog :error="runResult.error" />
        <Artifacts />
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
