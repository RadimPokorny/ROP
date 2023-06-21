<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="center">
    <h1>Hello world</h1>
    <p class="">This is my new page</p>
    <div class="container">
      <h1 class="">Click here</h1>
    </div>
  </div>
  

</template>

<style scoped>

.container{
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  width: 300px;
  height: 80px;
  border-radius: 20px;
}

</style>
