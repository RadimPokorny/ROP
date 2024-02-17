<script setup lang="ts">
import { ref, computed} from "vue";
import {encode} from 'html-entities';
import {decode} from 'html-entities';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

//Hash methods
import {Md5} from 'ts-md5';
import { sha256, sha224 } from 'js-sha256';
import * as CRC32 from "crc-32";
import { genSaltSync, hashSync } from "bcrypt-ts";
import {create} from 'js-md4';
import * as desjs from 'des.js';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

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
  },
  
  {
    label: 'Hashing',
    code: 'ha',
    items: [
      { label: 'MD5', value: 'MD5'},
      { label: 'SHA256', value: 'SHA256'},
      { label: 'LM', value: 'LM'},
      { label: 'NT', value: 'NT'},
      { label: 'CRC', value: 'CRC'},
      { label: 'Bcrypt', value: 'Bcrypt'},
      { label: 'Argon2', value: 'Argon2'}
    ]
  }
]);

const selectedNumber = ref()
const argonsalt = ref()
//Const to disable or enable if hashing is in process

//Setup SALT dropdown values
const numberOptions = Array.from({ length: 20 }, (_, index) => (index + 1).toString());

//Dialog for argon2 default
const visible = ref(false);

//Setup the plain text as default value
selectedType.value = groupedTypes.value[0].items[0];
selectedType2.value = groupedTypes.value[0].items[0];

//Setup the default salt value
selectedNumber.value = 10;

//Setup default Argon2 values
const argonite = ref();
argonite.value = 8;
const argonmem = ref();
argonmem.value = 1024;
const argonlen = ref();
argonlen.value = 24;
const argonpar = ref();
argonpar.value = 1;


const getFilteredGroupedTypesForFirstDropdown = computed(() => {
  // Filter the groupedTypes array to include only items with the code 'co'
  return groupedTypes.value.filter(group => group.code === 'co' || group.code === 'pt');
});

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

  showSalt();
  
}

function showSalt(): void {
  var saltElm: HTMLElement | null = document.getElementById('btn-drop');
  var saltElm2: HTMLElement | null = document.getElementById('btn-argon');

  if (saltElm !== null && selectedType2.value.value === "Bcrypt") {
    saltElm.style.display = 'flex';
  } else if (saltElm !== null) {
    saltElm.style.display = 'none';
  }

  if (saltElm2 !== null && selectedType2.value.value === "Argon2") {
    saltElm2.style.display = 'flex';
  } else if (saltElm2 !== null) {
    saltElm2.style.display = 'none';
  }
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

//Generate salt for the Argon2
function generateSalt(): String {
  var buffer = new Uint8Array(16); // 128 bits
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; //Chracters list
  let randomString = '';

  for (let i = 0; i < buffer.length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  argonsalt.value = randomString;
  return randomString;
}

//Generate hash with values from the dialog
async function DialogHashGenerate(this:any): Promise<void>{
  this.visible = false;
  const result = await argon2.hash({
          pass: value.value,
          salt: generateSalt(),
          time: argonite.value,
          mem: argonmem.value,
          hashLen: argonlen.value,
          parallelism: argonpar.value,
          type: argon2.ArgonType.Argon2d,
        });

        value2.value = result.hashHex;
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
  showSalt();
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

function create_LM_hashed_password_v1(password: string): Buffer {
  // 14 bytes password conversion
  password = password.toUpperCase();
  const passwordBytes: Buffer = Buffer.from(password, 'ascii');

  const passwordBytesPadded: Buffer = Buffer.alloc(14);
  passwordBytesPadded.fill("\0");

  const sourceEnd: number = Math.min(14, passwordBytes.length);
  passwordBytes.copy(passwordBytesPadded, 0, 0, sourceEnd);

  // Dividing into 2 parts with 7 bytes:
  const firstPart: Buffer = passwordBytesPadded.subarray(0, 7);
  const secondPart: Buffer = passwordBytesPadded.subarray(7);

  function encrypt(buf: Buffer): Buffer {
    const key: Buffer = insertZerosEvery7Bits(buf);
    const des = desjs.DES.create({ type: 'encrypt', key: key });
    const magicKey: Buffer = Buffer.from('KGS!@#$%', 'ascii');
    const encrypted: Buffer = des.update(magicKey);
    return Buffer.from(encrypted);
  }

  const firstPartEncrypted: Buffer = encrypt(firstPart);
  const secondPartEncrypted: Buffer = encrypt(secondPart);

  return Buffer.concat([firstPartEncrypted, secondPartEncrypted]);
}

function bytes2binaryArray(buf: Buffer): number[] {
  const hex2binary: Record<string, number[]> = {
    '0': [0, 0, 0, 0],
    '1': [0, 0, 0, 1],
    '2': [0, 0, 1, 0],
    '3': [0, 0, 1, 1],
    '4': [0, 1, 0, 0],
    '5': [0, 1, 0, 1],
    '6': [0, 1, 1, 0],
    '7': [0, 1, 1, 1],
    '8': [1, 0, 0, 0],
    '9': [1, 0, 0, 1],
    'A': [1, 0, 1, 0],
    'B': [1, 0, 1, 1],
    'C': [1, 1, 0, 0],
    'D': [1, 1, 0, 1],
    'E': [1, 1, 1, 0],
    'F': [1, 1, 1, 1]
  };

  const hexString: string = buf.toString('hex').toUpperCase();
  let array: number[] = [];
  for (let i = 0; i < hexString.length; i++) {
    const hexchar: string = hexString.charAt(i);
    array = array.concat(hex2binary[hexchar]);
  }

  return array;
}

function binaryArray2bytes(array: string): Buffer {
  const binary2hex: Record<string, number | string> = {
    '0000': 0,
    '0001': 1,
    '0010': 2,
    '0011': 3,
    '0100': 4,
    '0101': 5,
    '0110': 6,
    '0111': 7,
    '1000': 8,
    '1001': 9,
    '1010': 'A',
    '1011': 'B',
    '1100': 'C',
    '1101': 'D',
    '1110': 'E',
    '1111': 'F'
  };

  const bufArray: Buffer[] = [];

  for (let i = 0; i < array.length; i += 8) {
    if ((i + 7) > array.length)
      break;

    const binString1: string = '' + array[i] + '' + array[i + 1] + '' + array[i + 2] + '' + array[i + 3];
    const binString2: string = '' + array[i + 4] + '' + array[i + 5] + '' + array[i + 6] + '' + array[i + 7];
    const hexchar1: number | string = binary2hex[binString1];
    const hexchar2: number | string = binary2hex[binString2];

    const buf: Buffer = Buffer.from(hexchar1 + '' + hexchar2, 'hex');
    bufArray.push(buf);
  }

  return Buffer.concat(bufArray);
}

function insertZerosEvery7Bits(buf: Buffer): Buffer {
  const binaryArray: number[] = bytes2binaryArray(buf);
  const newBinaryArray: number[] = [];

  for (let i = 0; i < binaryArray.length; i++) {
    newBinaryArray.push(binaryArray[i]);

    if ((i + 1) % 7 === 0) {
      newBinaryArray.push(0);
    }
  }

  return binaryArray2bytes(newBinaryArray.join(''));
}

function create_NT_hashed_password_v1(password: String){
	var buf = Buffer.from(password, 'utf16le');
	var md4 = create();
	md4.update(buf);
	return Buffer.from(md4.digest());
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

async function onChange() {
  let inputValue = (value.value).toString();
  let plainText = "";
  showSalt();

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
        if(/^[01]+$/.test(inputValue)){
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
        }
        else if(inputValue == ""){
          alert("Please fill in the text field.");
          
        }
        else{
          alert("Wrong binary format.");
          value.value = "";
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
      case 'MD5':{
        value2.value = Md5.hashStr(plainText); 
        break;
      }
      case 'SHA256':{
        value2.value = sha256(plainText);
        break;
      }
      case 'NT':{
        value2.value = create_NT_hashed_password_v1(plainText).toString('hex');
        break;
      }
      case 'LM':{
        value2.value = create_LM_hashed_password_v1(plainText).toString('hex');
        break;
      }
      case 'CRC' :{
        value2.value = String(CRC32.str(plainText));
        break;
      }
      case 'Bcrypt' :{
        const saltValue = Number(selectedNumber.value);
        const salt = genSaltSync(saltValue);
        value2.value = hashSync(plainText, salt);
        break;
      }
      case 'Argon2': {
        const result = await argon2.hash({
          pass: inputValue,
          salt: generateSalt(),
          time: argonite.value,
          mem: argonmem.value,
          hashLen: argonlen.value,
          parallelism: argonpar.value,
          type: argon2.ArgonType.Argon2d,
        });

        value2.value = result.hashHex;
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
  <input 
    aria-labelledby="Output Text Area" 
    id="fileInput" 
    type="file" 
    style="display: none" 
    @input="importInput" 
    accept=".txt, .text"
  />
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
                :options="getFilteredGroupedTypesForFirstDropdown" 
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
              class="textarea"
              aria-labelledby="Input Text Area"
            />
            <label>Input</label>
            </span>
        </div>
      </div>
      <div class="column2">
        <div class="dropdown-copy">
          <div class="dropdown-block"></div>
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
          <mdicon alt="trim" name="content-cut" />  
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
            <div id="btn-drop" class="button" >
                <InputNumber 
                  v-tooltip.top="'Enter the number of salts'"
                  style="display: flex !important;  height: 59.59px; " 
                  v-model="selectedNumber" 
                  inputId="minmax-buttons" 
                  mode="decimal" 
                  showButtons 
                    :min="1" 
                    :max="20" 
                  @input="onChange()" 
                  />
            </div>
            <div id="btn-argon" class="button">
              <Button
                label="Par."
                aria-label="par."
                @click="visible = true"
                style="width: 59.2px; height: 59.2px; margin-right: 20px;"
              />
            </div>
            <template>
              <div class="card flex justify-content-center">
                  <Button label="Show" @click="visible = true" />
                  <Dialog v-model:visible="visible" modal header="Argon2" :style="{ width: '26rem' }">
                      <span class="p-text-secondary block mb-5">Enter parameters for hashing</span>
                      <div class="flex align-items-center gap-3 mb-5">
                          <label for="salt" class="font-semibold w-6rem">Salt</label>
                          <span style="display: flex; justify-content: center; align-items: center;" class="p-input-icon-right">
                            <i class="pi pi-cog"  style="margin-top: -11px" @click="generateSalt()"/>
                            <InputText v-model="argonsalt" id="salt" class="flex-auto" autocomplete="off" />
                          </span>
                      </div>
                      <div class="flex align-items-center gap-3 mb-5">
                          <label for="parallelismfactor" class="font-semibold w-6rem">Parallelism Factor</label>
                          <InputText v-model="argonpar" id="parallelismfactor" class="flex-auto" autocomplete="off" />
                      </div>
                      <div class="flex align-items-center gap-3 mb-5">
                          <label for="nemorycost" class="font-semibold w-6rem">Memory Cost</label>
                          <InputText v-model="argonmem" id="nemorycost" class="flex-auto" autocomplete="off" />
                      </div>
                      <div class="flex align-items-center gap-3 mb-5">
                          <label for="iterations" class="font-semibold w-6rem">Iterations</label>
                          <InputText v-model="argonite" id="iterations" class="flex-auto" autocomplete="off" />
                      </div>
                      <div class="flex align-items-center gap-3 mb-5">
                          <label for="hashlength" class="font-semibold w-6rem">Hash Length</label>
                          <InputText v-model="argonlen" id="hashlength" class="flex-auto" autocomplete="off" />
                      </div>
                      <div class="flex justify-content-end gap-2">
                          <Button type="button" label="Cancel" @click="visible = false"></Button>
                          <Button type="button" label="Generate hash" @click="DialogHashGenerate()"></Button>
                      </div>
                  </Dialog>
              </div>
            </template>
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
              class="textarea"
              aria-labelledby="Output Text Area"
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

.p-inputnumber-input{
  position: relative;
  height: 80px !important;
}


.center-dropdown{
  position: relative;
  width: 100%;
  height: auto !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

#btn-drop{
  display: none;
  margin-right: 20px;
}

#btn-argon{
  display: none;
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

@media only screen and (min-width: 950px) and (max-width: 1200px) {
  /* Vaše stylizace pro šířku od 900px do 1100px */
  .dropdown{
    width: 150px !important;
  }

  /* Další stylizace ... */
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
