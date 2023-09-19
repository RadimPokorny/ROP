<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed } from "vue";
import { beforeAll } from 'vitest';

const selectedType = ref();
const selectedType2 = ref();
const groupedTypes = ref([
      {
        code: 'pt',
        items:[
          { label: 'Plain text', value: 'plain-text' }
        ]
      },

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


//Setup the plain text as default value
selectedType.value = groupedTypes.value[0].items.find(item => item.value === 'plain-text');
selectedType2.value = groupedTypes.value[0].items.find(item => item.value === 'plain-text');

const value = ref("");
const value2 = ref("");

function swapValue(): void {
  //Swap dropdown value
  const tempType = selectedType.value;
  selectedType.value = selectedType2.value;
  selectedType2.value = tempType;

  //Swap textarea value
  const tempValue = value.value;
  value.value = value2.value;
  value2.value = tempValue;
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

//Reset both textareas 
function resetComps(): void {
  value.value =  "";
  value2.value = "";
  selectedType.value = groupedTypes.value[0].items.find(item => item.value === 'plain-text');
  selectedType2.value = groupedTypes.value[0].items.find(item => item.value === 'plain-text');
}

function trimInput(): void {
  value.value = value.value.trim();
}

//Function to convert ASCII to plain text
function AsciiToPlain(AsciiString: string) {
  var array = AsciiString.split(' ');
  var output = "";
  for(let i = 0; i < array.length; i++){
    var num = Number(array[i]);
    const character = String.fromCharCode(num);
    output += character;
  }
  return output;
}

//Function to convert plain text to ASCII
function PlainToAscii(ptString: string) {
  var output = "";
  for(let i = 0; i < ptString.length; i++){
    let code = ptString.charCodeAt(i);
    output += code + " ";
  }
  output = output.slice(0,-1);
  return output;
}

//Function to convert hexadecimal to plain text
function hexToPlain(hexString: string) {
  var hex = hexString.toString();
  var str = "";
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

//Function to convert plain text to hexadecimal
function PlainToHex(ptString: string) {
  var hex = '';
  for (var i = 0; i < ptString.length; i++) {
    hex += ptString.charCodeAt(i).toString(16);
  }
  return hex;
}

//Function to convert plain text to binary
function PlainToBin(ptString: string){
  let bin = '';
  bin = ptString.split('').map(char => {
    return char.charCodeAt(0).toString(2);
  }).join(' ');
  return bin;
}

//Function to convert binary to plain text
function BinToPlain(binaryString: string): string {
  const Array = binaryString.split(' ');
  let plainText = '';

  for (let i = 0; i < Array.length; i++) {
    const Char = Array[i];
    const decimalValue = parseInt(Char, 2);

    //Asking if the value is in 0 - 127 range
    if (decimalValue >= 0 && decimalValue <= 127) {
      plainText += String.fromCharCode(decimalValue);
    }
  }
  return plainText;
}

function onChange() {
  
  let inputValue = (value.value).toString();
  let plainText = "";

  //Input switch - Converting a specific value to plain text
  switch(selectedType.value.value) {
    case 'Base64': {
      plainText = atob(inputValue);
      break;
    }
    case 'URL': {
      plainText = decodeURI(inputValue);
      break;
    }
    case 'ASCII': {
      plainText = AsciiToPlain(inputValue);
      break;
    }
    case 'HTML': {
      plainText = inputValue.replace("<p>", "");
      plainText = plainText.replace("</p>", "");
      break;
    }
    case 'Hex': {
      plainText = hexToPlain(inputValue);
      break;
    }
    case 'Dec': {
      plainText = AsciiToPlain(inputValue);
      break;
    }
    case 'Bin': {
      plainText = BinToPlain(inputValue);
      break;
    }
    default: {
      plainText = inputValue;
      break;
    }
  }
  
 let outputValue = "";

  //Output switch - Converting a plain text from the first switch 
  switch(selectedType2.value.value) {
    case 'Base64': {
      outputValue = btoa(plainText);
      value2.value = outputValue;
      break;
    }
    case 'URL': {
      outputValue = encodeURI(plainText);
      value2.value = outputValue;
      break;
    }
    case 'ASCII': {
      outputValue = PlainToAscii(plainText);
      value2.value = outputValue;
      break;
    }
    case 'HTML': {
      value2.value = "<p>" + plainText + "</p>";
      break;
    }
    case 'Hex': {
      outputValue = PlainToHex(plainText);
      value2.value = outputValue;
      break;
    }
    case 'Dec': {
      outputValue = PlainToAscii(plainText);
      value2.value = outputValue;
      break;
    }
    case 'Bin': {
      outputValue = PlainToBin(plainText);
      value2.value = outputValue;
      break;
    }
    default: {
      value2.value = plainText;
      break;
    }
  }

}

const isSwapButtonDisabled = computed(() => {
  return value2.value === "";
});
</script>

<template>
  <header class="header">
    <p class="title">Web user interface to support penetration testing</p>
  </header>
  <div class="content">
    <div class="center">
      <div class="column1">
        <div class="center-dropdown">
          <div class="dropdown-copy">
            <Dropdown 
              class="dropdown"
              v-model="selectedType" 
              :options="groupedTypes" 
              filter 
              optionLabel="label" 
              optionGroupLabel="label" 
              optionGroupChildren="items" 
              placeholder="Select" 
              style="width: 250px;">
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
        </div>
        <div class="component">
          <span class="p-float-label">
            <Textarea 
              v-model="value" 
              rows="30" 
              cols="50" 
            />
            <label>Input</label>
            </span>
        </div>
      </div>
      <div class="column2">
        <div class="dropdown-copy">
        </div>
        <div class="component">
          <Button 
          icon="pi pi-arrow-right-arrow-left" 
          aria-label="Filter" 
          @click="swapValue()"
          class="swap-btn"
          :disabled="isSwapButtonDisabled"
          />
          <Button 
            aria-label="Reset" 
            icon="pi pi-replay" 
            @click="resetComps"
            class="reset-btn"
          />
          <Button 
            aria-label="Trim" 
            icon="pi pi-eraser" 
            @click="trimInput"
            class="trim-btn"
          />
        </div>
      </div>
      <div class="column3">
        <div class="dropdown-copy">
          <Dropdown 
            class="dropdown"
            v-model="selectedType2" 
            :options="groupedTypes" 
            filter
            @change="onChange()"
            optionLabel="label" 
            optionGroupLabel="label" 
            optionGroupChildren="items" 
            placeholder="Select" 
            style="width: 250px;">
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
              rows="30" 
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

.header {
	position: absolute;
	background-color:$background-color_1;
  color:$color_1;
	padding: 20px; 
	text-align: center;
	width: 100%;
	height: 60px;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

.title {
	font-size: 24px;
	color: $color_1;
}

.button {
	margin-top: 20px;
  margin-bottom: 20px;
}

.content {
	position: absolute !important;
	display: flex;
	align-items: center;
	flex-direction: column;
  width: 100%;
  height: 100%;
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
  justify-content: center;
	align-items: center;
  width: 100%;
  height: 40%;
}

.p-inputtextarea:disabled{
  opacity: 1;
}

.center-dropdown{
  position: relative;
  width: 100%;
  height: auto !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dropdown-copy {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	width: auto;
	height: auto;
  //calculated margin for dropdown and copy button 
  margin-left: -20px;
}

.column {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
  height: 100%; 
}

.column1, .column3  {
  @extend .column;
  width: 40%;
}

.column2  {
  @extend .column;
  width: 3.7rem;
  margin-right: 20px;
  margin-left: 20px;

  //Empty class used for responsivity
  .dropdown-copy{
    height: 99.2px;
  }
}

Textarea {
  position: relative;
  width: 100%;
  height: 100%;
}
.reset-btn{
  margin-top: 20px;
}

.trim-btn{
  margin-top: 20px;
}

.p-button.p-button-icon-only {
  color: $color_1;
  height: 3.7rem;
  width: 3.7rem;
  padding: .714rem;
}

.dropdown{
  margin: 20px;
}

@media only screen and (max-width: 798px) {
  .center{
    flex-direction: column;
    height: auto !important;
    margin-top: 60px;
  }

  .swap-btn{
    transform: rotate(90deg); 
  }
  .component{
    height: auto !important;
  }
  .column2{
    flex-direction: row;
    width: 100%;
    margin-top: 15px;   
    
  .component{
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

  .column1, .column3{
    width: 90%;
  }

  .reset-btn{
    margin-top: 0px;
    margin-right: 0px;
    margin-left: 10px;
  }

  .trim-btn{
    margin-top: 0px;
    margin-right: 0px;
    margin-left: 20px;
  }

  .swap-btn{
    margin-top: 0px;
    margin-right: 10px; 
  }

}

@media only screen and (max-width: 798px) {
  .header{
    height: 120px;
  }
  .content{
    margin-top: 125px;
  }
}
</style>
