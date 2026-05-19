<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoginDashboard from './components/LoginDashboard.vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import HeroContent from './components/HeroContent.vue'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const route = useRoute()

const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/v1/me`, {
      credentials: 'include'  // ← send cookie with fetch too
    })
    if (res.ok) {
      user.value = await res.json()
    }
  } catch {
    // not logged in
  } finally {
    loading.value = false
  }
})

function handleLogin(userData) {
  user.value = userData
}

async function handleSignout() {
  await fetch(`${API}/api/v1/sign_out`, {
    method: 'DELETE',
    credentials: 'include'
  })
  user.value = null
}
</script>

<template>
  <!-- Let router handle /auth/callback -->
  <RouterView v-if="route.path === '/auth/callback'" />

  <!-- Loading -->
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center bg-[#0b0d12]">
    <p class="text-sm text-muted-foreground animate-pulse">Loading…</p>
  </div>

  <!-- Unauthenticated -->
  <div v-else-if="!user" class="min-h-screen flex items-center justify-center bg-[#0b0d12]">
    <LoginDashboard @login-success="handleLogin" />
  </div>

  <!-- Authenticated -->
  <template v-else>
    <header>
      <Navbar :user="user" @signout="handleSignout" />
    </header>
    <div class="p-4 pt-24 overflow-y-auto z-40">
      <div class="flex flex-col items-start h-fit lg:flex-row">
        <Sidebar />
        <HeroContent />
      </div>
    </div>
    <footer class="mb-4 text-center text-xs text-white/60">
      © 2026 The Gladiators ⚔️
    </footer>
  </template>
</template>