<script setup>
import { ref } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Input from './ui/input/Input.vue'
import { Search, Settings, Check, Download } from 'lucide-vue-next'
import Button from './ui/button/Button.vue'
import Separator from './ui/separator/Separator.vue'
import { useTestStore } from '@/stores/testStore'
import { storeToRefs } from 'pinia'
import ImportTestModal from './ImportTestModal.vue'

const emit = defineEmits(['signout'])
const testStore = useTestStore()
const { searchQuery } = storeToRefs(testStore)
const importModalRef = ref(null)

// Download feedback
const downloadLabel = ref('Local Setup')
const downloadDone = ref(false)

const openImportModal = () => importModalRef.value?.show()

const downloadLocalSetup = () => {
  const getOS = () => {
    if (navigator.userAgentData) {
      const p = navigator.userAgentData.platform.toLowerCase()
      if (p.includes('win')) return 'windows'
      if (p.includes('mac')) return 'mac'
      return 'linux'
    }
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) return 'windows'
    if (ua.includes('mac')) return 'mac'
    return 'linux'
  }

  const os = getOS()

  const scripts = {
    windows: {
      content: `@echo off
echo 🚀 Setting up Playwright Regression Suite...
:: 1. Install Chocolatey if not present
echo 📦 Checking Chocolatey...
where choco >nul 2>&1
if errorlevel 1 (
  echo 📦 Installing Chocolatey...
  powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
)
:: 2. Install Node.js
where node >nul 2>&1
if errorlevel 1 ( choco install nodejs --version="22.22.3" -y )
:: 3. Install Playwright
npx playwright --version >nul 2>&1
if errorlevel 1 ( npm install playwright && npx playwright install )
:: 4. Start recording
npx playwright codegen --output "%USERPROFILE%\\Desktop\\my-test.spec.js"
pause`,
      filename: 'local-setup.bat',
      type: 'text/plain',
      label: 'Windows'
    },
    mac: {
      content: `#!/bin/bash
echo "🚀 Setting up Playwright..."
command -v brew &>/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
command -v node &>/dev/null || brew install node@22
npx playwright --version &>/dev/null || (npm install playwright && npx playwright install)
npx playwright codegen --output ~/Desktop/my-test.spec.js`,
      filename: 'local-setup-mac.sh',
      type: 'text/x-sh',
      label: 'macOS'
    },
    linux: {
      content: `#!/bin/bash
echo "🚀 Setting up Playwright..."
command -v node &>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs)
npx playwright --version &>/dev/null || (npm install playwright && npx playwright install && sudo npx playwright install-deps)
npx playwright codegen --output ~/Desktop/my-test.spec.js`,
      filename: 'local-setup-linux.sh',
      type: 'text/x-sh',
      label: 'Linux'
    }
  }

  const { content, filename, type, label } = scripts[os]
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  // Feedback
  downloadLabel.value = `Downloaded for ${label}`
  downloadDone.value = true
  setTimeout(() => {
    downloadLabel.value = 'Local Setup'
    downloadDone.value = false
  }, 3000)
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-[#161b26] border-b border-slate-800">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-3">

      <!-- Brand -->
      <div class="flex items-center gap-4 shrink-0">
        <Avatar class="mt-0.5">
          <AvatarImage src="https://github.com/shadcn.png" alt="logo" />
          <AvatarFallback>PRS</AvatarFallback>
        </Avatar>
        <div>
          <h4 class="font-semibold text-sm leading-tight">Playwright Regression Suite</h4>
          <p class="text-[11px] text-slate-500">Codegen · Normalize · Replay · Debug</p>
        </div>
      </div>

      <!-- Search -->
      <div class="relative flex-1 max-w-xl w-full mx-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
        <Input
          v-model="searchQuery"
          placeholder="Search by name, tag, or environment…"
          class="pl-9 bg-[#1c2333] border-slate-800 focus:border-slate-600 focus:bg-[#1c2333]"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 shrink-0">
        <!-- Local Setup + Import — combined on one row -->
        <div class="flex items-center justify-center gap-2">
          <!-- Local Setup — no pulse, shows confirmation feedback -->
          <Button
            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#1c2333] border border-slate-700 text-white
                   hover:bg-[#2a3347] hover:border-slate-600 transition-all duration-200"
            :class="downloadDone ? 'border-slate-500 text-white' : ''"
            @click="downloadLocalSetup"
          >
            <Check v-if="downloadDone" class="w-4 h-4" />
            <Settings v-else class="w-4 h-4" />
            {{ downloadLabel }}
          </Button>

          <!-- Import — single highlight, no pulse -->
          <Button
            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-white
                   text-slate-900 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
            @click="openImportModal"
          >
            <Download class="w-4 h-4" />
            Import
          </Button>
          <ImportTestModal ref="importModalRef" />
        </div>

        <!-- Sign out — own row on smaller viewports -->
        <Button
          class="px-3 py-2 text-sm bg-[#1c2333] border border-slate-700
                 text-slate-300 hover:bg-[#2a3347] hover:text-white hover:border-slate-600 transition-all duration-200"
          @click="emit('signout')"
        >
          Sign out
        </Button>
      </div>
    </div>
  </nav>
  <Separator />
</template>