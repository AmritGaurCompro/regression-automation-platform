<script setup>
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import ArtifactItem from "./ArtifactItem.vue"

const artifacts = [
  {
    id: 1,
    title: "Screenshot (on failure)",
    path: "shared/run_artifacts/run_128/failure.png",
    icon: "🖼️",
  },
  {
    id: 2,
    title: "Trace File",
    path: "shared/run_artifacts/run_128/trace.zip",
    icon: "📊",
  },
  {
    id: 3,
    title: "Console Logs",
    path: "shared/run_artifacts/run_128/console.log",
    icon: "📝",
  },
]
</script>

<template>
  <Card
    v-if="artifacts.length"
    class="border-slate-800
           bg-gradient-to-b from-slate-900 to-slate-950"
  >
    <CardHeader
      class="flex flex-row items-center justify-between"
    >
      <CardTitle class="flex items-center gap-2 text-white">
        📦 Artifacts
      </CardTitle>

      <Badge variant="info" class="uppercase tracking-wide">
        {{ artifacts.length }} files generated
      </Badge>
    </CardHeader>
    <CardContent class="space-y-4">
      <ArtifactItem
        v-for="item in artifacts"
        :key="item.id"
        :title="item.title"
        :path="item.path"
        :icon="item.icon"
      />
    </CardContent>
  </Card>
</template>
