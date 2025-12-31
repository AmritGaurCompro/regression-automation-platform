<template>
  <div
    class="flex items-center justify-between
           rounded-lg bg-[#1c2333] border border-slate-800
           px-6 py-4"
           display="flex"
           
  >
    <!-- Left: Title + Meta -->
    <div>
      <h1 class="text-xl font-semibold text-white">
        {{ title }}
      </h1>

      <p class="mt-1 text-sm text-slate-400">
        Tags: {{ tags.join(', ') }}
        <span class="mx-1">•</span>
        Environment: {{ environment }}
      </p>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-3">
      <button
        class="rounded-md border px-3 py-1 text-sm hover:bg-muted bg-[rgb(13_17_23)]"
        @click="$emit('copy')"
      >
        📋 Copy
      </button>

      <button
        class="rounded-md border px-3 py-1 text-sm hover:bg-muted bg-[rgb(13_17_23)]"
        @click="$emit('run')"
      >
        ▶ Run Test
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeadingBar',

  props: {
    title: {
      type: String,
      required: true
    },
    tags: {
      type: Array,
      default: () => []
    },
    environment: {
      type: String,
      required: true
    }
  }
}
</script>
