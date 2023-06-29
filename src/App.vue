<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { ref } from "vue";


const selectedType = ref();
const selectedType2 = ref();
const groupedTypes = ref([
    {
        label: 'Coding',
        code: 'co',
        items: [
            { label: 'Base64', value: 'Base64' },
            { label: 'URL', value: 'URL' },
            { label: 'ASCII', value: 'ASCII' },
            { label: 'HTML', value: 'HTML' },
            { label: 'Hex', value: 'Hex' },
            { label: 'Dec', value: 'Dec' },
            { label: 'Bin', value: 'Bin' }
        ]
    },
    {
        label: 'Hashing',
        code: 'ha',
        items: [
            { label: 'MD', value: 'MD' },
            { label: 'SHA', value: 'SHA' },
            { label: 'LM', value: 'LM' },
            { label: 'NT', value: 'NT' },
            { label: 'CRC', value: 'CRC' },
            { label: 'Bcrypt', value: 'Bcrypt' }, 
            { label: 'Argon2', value: 'Argon2' }
        ]
    },
    {
        label: 'Encrypting',
        code: 'en',
        items: [
            { label: 'AES', value: 'AES' },
            { label: 'RC', value: 'RC' },
            { label: 'RSA', value: 'RSA' },
            { label: 'DES', value: 'DES' }
        ]
    }
]);

const value = ref("");
const value2 = ref("");

const handleClick = (): void => {
  if (value.value) {
    value2.value = value.value;
  } else {
    alert("No input text.");
  }
};

</script>






<template>
  
  <div class="content">

    <div class="center">


      <div class="column">

        <div class="component">

          <Dropdown v-model="selectedType" :options="groupedTypes" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Select" class="w-full md:w-14rem">

            <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                    <div>{{ slotProps.option.label }}</div>
                </div>
            </template>

          </Dropdown>

        </div>

      
        <div class="component">

          <span class="p-float-label">
            <Textarea v-model="value" autoResize rows="5" cols="30" />
            <label>Input</label>
            </span>

          <div class="button">

            <Button icon="pi pi-copy" aria-label="Filter" />

          </div>

        </div>

      </div>

      <div class="column">

        <Button icon="pi pi-arrow-right-arrow-left" aria-label="Filter" />

        <div class="button-submit">

          <Button label="Submit" @click="handleClick"/>

        </div>


      </div>

      
      
      
      <div class="column">

        <div class="component">

          <Dropdown v-model="selectedType2" :options="groupedTypes" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Select" class="w-full md:w-14rem">

            <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                    <div>{{ slotProps.option.label }}</div>
                </div>
            </template>

          </Dropdown>

        </div>

      
        <div class="component">

          <span class="p-float-label">
          <Textarea v-model="value2" autoResize rows="5" cols="30" />
          <label>Output</label>
          </span>

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
