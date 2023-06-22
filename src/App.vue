<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

</script>

<template>
  
  <div class="content">

    <div class="center">


      <div class="column">

        <div class="component">

          <Dropdown v-model="selectedCity" :options="groupedCities" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Select" class="w-full md:w-14rem">

            <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                    <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`" style="width: 18px" />
                    <div>{{ slotProps.option.label }}</div>
                </div>
            </template>

          </Dropdown>

        </div>

      
        <div class="component">

          <Textarea v-model="value" autoResize rows="5" cols="30" />

          <div class="button">

            <Button icon="pi pi-copy" aria-label="Filter" />

          </div>

        </div>

      </div>

      <div class="column">

        <Button icon="pi pi-arrow-right-arrow-left" aria-label="Filter" />

        <div class="button-submit">

          <Button label="Submit" />

        </div>


      </div>

      
      
      
      <div class="column">

        <div class="component">

          <Dropdown v-model="selectedCity" :options="groupedCities" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Select" class="w-full md:w-14rem">

            <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                    <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`" style="width: 18px" />
                    <div>{{ slotProps.option.label }}</div>
                </div>
            </template>

          </Dropdown>

        </div>

      
        <div class="component">

          <Textarea v-model="value" autoResize rows="5" cols="30" />

          <div class="button">

            <Button icon="pi pi-copy" aria-label="Filter" />

          </div>


        </div>

      </div>
      
      


    </div>

  </div>
  

</template>

<style scoped>
.button{
  margin-left: 50px;
  margin-right: 50px;
  margin-top: 20px;
}

.button-submit{
  margin-top: 25px;
}
.content{
  position: absolute !important;

  width: auto !important;
  height: auto !important;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

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

.component{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: auto;
  height: auto;
  margin: 10px;
}

.column{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 10px;
}

</style>
