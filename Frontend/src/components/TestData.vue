<template>
  <div
    class="flex flex-col lg:flex-row mt-0 ml-5 mr-5 gap-4 bg-[#161b26]"
  >
    <!-- Environment -->
    <div class="w-full lg:w-64">
      <label class="mb-1 block text-xs font-medium text-muted-foreground">
        ENVIRONMENT
      </label>
      <select
        class="w-full rounded-lg bg-background px-3 py-2 text-sm"
        :value="environment"
        @change="emit('update:environment', $event.target.value)"
      >
        <option
          v-for="env in environments"
          :key="env.value"
          :value="env.value"
        >
          {{ env.label }}
        </option>
      </select>
    </div>

    <!-- Runner Mode -->
    <div class="w-full lg:w-64">
      <label class="mb-1 block text-xs font-medium text-muted-foreground">
        RUNNER MODE
      </label>
      <select
        class="w-full rounded-lg bg-background px-3 py-2 text-sm"
        :value="runnerMode"
        @change="emit('update:runnerMode', $event.target.value)"
      >
        <option value="headless">Headless (default)</option>
        <option value="headed">Headed</option>
      </select>
    </div>

    <!-- Tags -->
    <div class="w-full lg:w-64">
      <label class="mb-1 block text-xs font-medium text-muted-foreground">
        TAGS
      </label>
      <input
        type="text"
        placeholder="smoke, login, core"
        class="w-full rounded-lg bg-background px-3 py-2 text-sm"
        :value="tags"
        @input="emit('update:tags', $event.target.value)"
      />
    </div>

    <!-- Retries -->
    <div class="w-full lg:w-64">
      <label class="mb-1 block text-xs font-medium text-muted-foreground">
        RETRIES ON FAILURE
      </label>
      <select
        class="w-full rounded-lg bg-background px-3 py-2 text-sm"
        :value="retries"
        @change="emit('update:retries', Number($event.target.value))"
      >
        <option v-for="n in 5" :key="n" :value="n - 1">
          {{ n - 1 }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
defineProps({
  environment: String,
  runnerMode: String,
  tags: String,
  retries: Number,
  environments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:environment',
  'update:runnerMode',
  'update:tags',
  'update:retries'
])
</script>
