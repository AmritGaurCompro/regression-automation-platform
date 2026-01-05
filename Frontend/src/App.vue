
<script setup>
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
import RunResult from "./components/RunResult.vue"
import HeroContent from './components/HeroContent.vue'


</script>

<template>
    <header>
    <Navbar/>
    </header>
   <div class="p-4 pt-24  overflow-y-auto z-40 ">
    <div class="flex flex-col items-start h-fit lg:flex-row">
      <Sidebar/>
      <HeroContent/>
    </div>     
    </div>
</template>

<style scoped>

</style>
