<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { ref, computed } from "vue";
import { beforeAll } from 'vitest';
import {encode} from 'html-entities';
import {decode} from 'html-entities';
import mdiVue from 'mdi-vue/v2';
import * as mdijs from '@mdi/js';
import { afterEach } from 'node:test';
import { saveAs } from 'file-saver';


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
selectedType.value = groupedTypes.value[0].items[0];
selectedType2.value = groupedTypes.value[0].items[0];

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

function importInput(event: any) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  if (file) {
    //Getting the file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    //Alowed file types
    const allowedExtensions = ['txt', 'text'];
    //Checks if is allowed
    if (allowedExtensions.includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = function () {
        value.value = String(reader.result); 
      };
      reader.readAsText(file);
    } else {
      alert("Forbidden file type.");
      fileInput.value = "";
    }
  }
}


function exportOutput() {
  if (value2.value) {
    const blob = new Blob([value2.value], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'output.txt'); // Change the filename as needed
  } else {
    alert("No output text to save.");
  }
}

//Reset both textareas 
function resetComps(): void {
  value.value =  "";
  value2.value = "";
  selectedType.value = groupedTypes.value[0].items[0];
  selectedType2.value = groupedTypes.value[0].items[0];
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

function areaCheck() {

  //Automatically adding space between ASCII values
  if(selectedType.value.value == 'ASCII'){
    if(value.value.length >= 3){
    var lastChars = value.value.substring(value.value.length - 3);
    if(lastChars.includes(' ') == false){
      value.value += " ";
    }
  }
  }
}

function onChange() {
  let inputValue = (value.value).toString();
  let plainText = "";

  if(selectedType.value.value == selectedType2.value.value){
    alert('Same method in input and output')
  }
  else{
    //Input switch - Converting a specific value to plain text
    switch(selectedType.value.value) {
      case 'Base64': {
        //Decoding to the character format with the JavaScript method
        plainText = atob(inputValue);
        break;
      }
      case 'URL': {
        //Decoding to the character format with the JavaScript method
        plainText = decodeURI(inputValue);
        break;
      }
      case 'ASCII': {
        var controlArray = inputValue.split(' ');
        for(var i =  0; i<controlArray.length;i++){
          if(controlArray[i].length > 3){
            alert('A space between ASCII values ​​is missing somewhere in the input');
            value.value= "";  
            return;
          }
        }
        //Decoding to the character format with a custom method
        plainText = AsciiToPlain(inputValue);
        break;
      }
      case 'HTML': {
        //Decoding to the character format with the JavaScript external method
        plainText = decode(inputValue);
        break;
      }
      case 'Hex': {
        //Decoding to the number format
        var numberArray = value.value.split(' ');

        for(let i = 0; i<numberArray.length;++i){

          if(numberArray[i] != ""){
            plainText += parseInt(numberArray[i], 16).toString() + " ";
          }
        }
        plainText = plainText.slice(0,-1);
        break;
      }
      case 'Dec': {
        plainText = inputValue;
        break;
      }
      case 'Bin': {
        //Checks if the number is binary
        //Decoding to the number format
        if(selectedType2.value.value == 'Dec' || selectedType2.value.value == 'Hex'){
           var numberArray = inputValue.split(' ');
          var convertErrorMessage = "";

          for(let i = 0; i<numberArray.length;++i){
            if (/^[01]+$/.test(numberArray[i])) {
              plainText += parseInt(numberArray[i], 2).toString() + " ";
            }
            else{
              convertErrorMessage += +numberArray[i]+" ";
              value.value = value.value.replace(numberArray[i], "");
            }
          }
          
          if(convertErrorMessage != ""){
            alert(convertErrorMessage + "cannot be converted.");
          }
          
          //Decoding to the character format
          plainText = plainText.slice(0,-1);
        }
        else{
          plainText = BinToPlain(value.value);
        }


        break;
      }
      default: {
        plainText = inputValue;
        break;
      }
    }
    
    let outputValue = "";
    //Output switch - Converting a plain text converted from the first switch 
    switch(selectedType2.value.value) {
      case 'Base64': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
          //Encoding to the characters with the JavaScript method
          outputValue = btoa(plainText);
          value2.value = outputValue;
        }
        break;
      }
      case 'URL': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        //Encoding to the characters with the JavaScript method
        outputValue = encodeURI(plainText);
        value2.value = outputValue;
        }
        break;
      }
      case 'ASCII': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        //Encoding to the characters with a custom method
        outputValue = PlainToAscii(plainText);
        value2.value = outputValue;
        }
        break;
      }
      case 'HTML': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        //Encoding to the characters with the JavaScript external method
        outputValue = encode(inputValue);
        value2.value = outputValue;
        }
        break;
      }
      case 'Hex': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Bin'){
          var inputNumbers = plainText.split(' ');
          
          for(let i = 0; i<inputNumbers.length;++i){
            if(inputNumbers[i] != ""){
              outputValue += Number(inputNumbers[i]).toString(16)+ " ";
            }
          }
          outputValue = outputValue.slice(0,-1);
          value2.value = outputValue;
        }
        else alert('Please use Decimal or Binary format to encode to the Hexadecimal value');
        break;
      }
      case 'Dec': {
        if(selectedType.value.value == 'Bin' || selectedType.value.value == 'Hex'){
          value2.value = plainText;
        }
        else {
          alert('Please use Hexadecimal or Binary format to encode to the Decimal value');
        }
        break;
      }
      case 'Bin': {
        //Encoding to the number
        if(selectedType.value.value == 'Dec' || selectedType.value.value == 'Hex'){
          var inputNumbers = plainText.split(' ');
          
          for(let i = 0; i<inputNumbers.length;++i){
            if(inputNumbers[i] != ""){
              
              let num = Number(inputNumbers[i]);
              
              if (num < 0) {
                let binaryNum = num.toString(2);
                outputValue += binaryNum + " ";
              } 
              else {
                outputValue += num.toString(2) + " ";
              }
            }
          }
          outputValue = outputValue.slice(0,-1);
        }
        //Encoding to the characters with a custom method
        else outputValue = PlainToBin(plainText);
        value2.value = outputValue;
        break;
      }
      default: {
        if(selectedType.value.value == 'Hex' || selectedType.value.value == 'Dec'){
          alert('Choose numeric encoding method please');
        }
        else value2.value = plainText;
        break;
      }
    }
  }

}

const isSwapButtonDisabled = computed(() => {
  return value2.value === "";
});
</script>

<template>
  <!-- Hidden file input for importFile dialog -->
  <input id="fileInput" type="file" style="display: none" @input="importInput" accept=".txt, .text"/>
  <header class="header">
    <p class="title">Web user interface to support penetration testing</p>
  </header>
  <div class="content">
    <div class="center">
      <div class="column1">
        <div class="center-dropdown">
          <div class="dropdown-copy">
            <div class="dropdown-block">
              <Dropdown 
                @change="onChange()"
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
            </div>
            <div class="button-block">
              <div class="button">
                <Button
                  :icon="isCopied ? 'pi pi-check' : 'pi pi-copy'"
                  aria-label="Filter"
                  @click="copyValue"
                />
              </div>
              <div style="margin-left: 20px;" class="button">
                <Button
                  icon="pi pi-file-export"
                  aria-label="Filter"
                  onclick="document.getElementById('fileInput').click()"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="component">
          <span class="p-float-label">
            <Textarea 
              v-model="value" 
              rows="30" 
              cols="50" 
              @input ="areaCheck"
            />
            <label>Input</label>
            </span>
        </div>
      </div>
      <div class="column2">
        <div class="dropdown-copy">
          <div class="dropdonw-block"></div>
          <div class="button-block"></div>
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
            @click="trimInput"
            class="trim-btn"
          >
          <mdicon name="content-cut" />  
          </Button>
          
        </div>
      </div>
      <div class="column3">
        <div class="dropdown-copy">
          <div class="dropdown-block">
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
          </div>
          <div class="button-block">
            <div class="button">
              <Button
                :icon="isCopied2 ? 'pi pi-check' : 'pi pi-copy'"
                aria-label="Filter"
                @click="copyValue2"
              />
            </div>
            <div style="margin-left: 20px;" class="button">
              <Button
                icon="pi pi-file-import"
                aria-label="Export"
                @click="exportOutput"
              />
            </div>
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
}

.button-block{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
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
  width: 59.2px;
  height: 59.2px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.p-button.p-button-icon-only {
  color: $color_1;
  height: 3.7rem;
  width: 3.7rem;
  padding: .714rem;
  min-width: 3rem;
}

.dropdown{
  margin: 20px;
  margin-left: 0px;
}

.p-float-label input:focus ~ label, .p-float-label input.p-filled ~ label, .p-float-label textarea:focus ~ label, .p-float-label textarea.p-filled ~ label, .p-float-label .p-inputwrapper-focus ~ label, .p-float-label .p-inputwrapper-filled ~ label
{
  font-size: 16px;
}

@media only screen and (max-width: 950px) {
  .dropdown-copy{
    flex-direction: column;
    height: 178.78px !important;
  }

  .column1, .column3{
    .button-block{
      min-width: 295px;
    }
  }

  .button{
    margin-top: 0px;
  }

  .column1{
    margin-left: 20px;
  }

  .column3{
    margin-right: 20px;
  }

  .column1, .column3  {
    @extend .column;
    width: auto !important;
  }

  .dropdown{
    margin-left: 20px;
  }
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
    background-color: #1E1E1E;
    .component{
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .column1, .column3{
    width: 90%;
    margin-left: 20px;
    margin-right: 20px;
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

  .column2{
    .dropdown-copy{
      flex-direction: column;
      height: 99.2px !important;
    }
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
