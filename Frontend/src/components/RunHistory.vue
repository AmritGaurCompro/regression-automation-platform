<script setup>
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

defineProps({
  runs: {
    type: Array,
    required: true,
  },
})

const statusVariant = (status) =>
  status === "pass" ? "success" : "destructive"
</script>

<template>
  <Card
    class="border-slate-800
           bg-gradient-to-b from-slate-900 to-slate-950"
  >
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2 text-white">
        📅 Run History
      </CardTitle>

      <Button
        variant="outline"
        class="border-slate-700 text-slate-300 focus-visible:outline-none
              focus-visible:ring-white"
      >
        View All
      </Button>
    </CardHeader>

    <CardContent class="p-0">
      <div
        class="hidden md:grid grid-cols-4 px-6 py-3
               text-xs font-semibold uppercase
               text-slate-400
               border-b border-slate-800"
      >
        <span>Run ID</span>
        <span>Status</span>
        <span>Environment</span>
        <span class="text-right">Duration</span>
      </div>
      <div
        v-for="run in runs"
        :key="run.id"
        class="border-b border-slate-800 last:border-none"
      >
        <div
          class="hidden md:grid grid-cols-4 px-6 py-4
                 items-center
                 hover:bg-slate-900/40 transition"
        >
          <span class="font-medium text-white">
            {{ run.id }}
          </span>

          <Badge :variant="statusVariant(run.status)" class="w-fit">
            {{ run.status.toUpperCase() }}
          </Badge>

          <span class="text-slate-200">
            {{ run.environment }}
          </span>

          <span class="text-right text-slate-200">
            {{ run.duration }}
          </span>
        </div>
        <div class="md:hidden px-4 py-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-white">
              {{ run.id }}
            </span>

            <Badge :variant="statusVariant(run.status)">
              {{ run.status.toUpperCase() }}
            </Badge>
          </div>

          <div class="flex justify-between text-sm text-slate-300">
            <span>Environment</span>
            <span>{{ run.environment }}</span>
          </div>

          <div class="flex justify-between text-sm text-slate-300">
            <span>Duration</span>
            <span>{{ run.duration }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
