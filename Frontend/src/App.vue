
<script setup>
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
import RunResult from "./components/RunResult.vue"


</script>

<template>
    <header>
    <Navbar/>
    </header>

   <aside class="p-4 pt-24  overflow-y-auto z-40 ">
        <Sidebar/>
    </aside>

   <main>
       <RunResult/>
  </main>

  
    
    
</template>

<style scoped>

</style>
