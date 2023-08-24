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
    }
]);

const value = ref("");
const value2 = ref("");

function swapValue(): void {
  const third = value.value;
  value.value = value2.value;
  value2.value = third;
}

const isCopied = ref(false);
const isCopied2 = ref(false);

function copyValue(): void {
  if (value.value) {
    navigator.clipboard.writeText(value.value);
    // Set the isCopied flag to true after successful copying
    isCopied.value = true; 
    setTimeout(() => {
      // Reset the isCopied flag after 1 second
      isCopied.value = false; 
    }, 1000);
  } else {
    alert("No input text.");
  }
}

function copyValue2(): void {
  if (value2.value) {
    navigator.clipboard.writeText(value2.value);
    // Set the isCopied flag to true after successful copying
    isCopied2.value = true; 
    setTimeout(() => {
      // Reset the isCopied flag after 1 second
      isCopied2.value = false; 
    }, 1000);
  } else {
    alert("No input text.");
  }
}

function resetComps(): void {
  value.value =  "";
  value2.value = "";
}
</script>

<template>
  <header class="header">
    <p class="title">Web user interface to support penetration testing</p>
  </header>
  <div class="content">
    <div class="center">
      <div class="column">
        <div class="dropdown-copy">
          <Dropdown 
            v-model="selectedType" 
            :options="groupedTypes" 
            filter 
            optionLabel="label" 
            optionGroupLabel="label" 
            optionGroupChildren="items" 
            placeholder="Select" 
            style="width: 200px;">
            <template #optiongroup="slotProps">
              <div class="flex align-items-center">
                  <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Dropdown>
          <div class="button">
            <Button
              :icon="isCopied ? 'pi pi-check' : 'pi pi-copy'"
              aria-label="Filter"
              @click="copyValue"
            />
          </div>
        </div>
        <div class="component">
          <span class="p-float-label">
            <Textarea 
              v-model="value" 
              autoResize 
              rows="7" 
              cols="50" 
            />
            <label>Input</label>
            </span>
        </div>
      </div>
      <div class="column">
        <Button 
          icon="pi pi-arrow-right-arrow-left" 
          aria-label="Filter" 
          @click="swapValue"
          class="swap-btn"
        />
        <Button 
          aria-label="Reset" 
          label="Reset"
          @click="resetComps"
          class="reset-btn"
        />
      </div>
      <div class="column">
        <div class="dropdown-copy">
          <Dropdown 
            v-model="selectedType2" 
            :options="groupedTypes" 
            filter
            optionLabel="label" 
            optionGroupLabel="label" 
            optionGroupChildren="items" 
            placeholder="Select" 
            style="width: 200px;">
            <template #optiongroup="slotProps">
              <div class="flex align-items-center">
                  <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Dropdown>
          <div class="button">
            <Button
              :icon="isCopied2 ? 'pi pi-check' : 'pi pi-copy'"
              aria-label="Filter"
              @click="copyValue2"
            />
          </div>
        </div>
        <div class="component">
          <span class="p-float-label">
          <Textarea 
            v-model="value2" 
            autoResize 
            rows="7" 
            cols="50" 
            disabled 
          />
          <label>Output</label>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">  
$color_1: white;
$background-color_1: #f16736;
.button {
	margin: 20px;
}
.button-submit {
	margin-top: 25px;
}
.content {
	position: absolute !important;
	width: auto !important;
	height: auto !important;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}
.container {
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: $background-color_1;
	color: $color_1;
	width: 300px;
	height: 80px;
	border-radius: 20px;
}
.component {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: auto;
	height: auto;
	margin: 10px;
}
.dropdown-copy {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	width: auto;
	height: auto;
	margin: 10px;
}
.column {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	margin: 10px;
}
.reset-btn{
  margin-top: 50px;
}
.swap-btn{
  margin-top: 65px;
}
</style>
