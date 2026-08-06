<script setup lang="ts">
//Coding and general methods
import { ref, computed} from "vue";
import {encode} from 'html-entities';
import {decode} from 'html-entities';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

window.Buffer = window.Buffer || Buffer;

//Hash methods
import {Md5} from 'ts-md5';
import { sha256, sha224 } from 'js-sha256';
import * as CRC32 from "crc-32";
import { genSaltSync, hashSync } from "bcrypt-ts";
import {create} from 'js-md4';
import * as desjs from 'des.js';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

//Encryption methods
import aes from 'js-crypto-aes';
import * as CryptoJS from 'crypto-js';
import rsa from 'js-crypto-rsa';
import {pem2jwk,jwk2pem} from 'pem-jwk'


//Object with all methods for dropdowns and references in the code
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
  },
  {
    label: 'Encrypting',
    code: 'cr',
    items: [
      { label: 'AES-GCM', value: 'AES-GCM'},
      { label: 'RC', value: 'RC'},
      { label: 'RSA', value: 'RSA'},
      { label: 'DES', value: 'DES'}
    ]
  }
]);

//AES definitions
const AESformats = ref();
const AEStextformat = ref([
    { name: 'Base64', value: 'Base64' },
    { name: 'Hex', value: 'Hex' }
]);

const selectedNumber = ref();
const argonsalt = ref();
//Const to disable or enable if hashing is in process

//Setup SALT dropdown values
const numberOptions = Array.from({ length: 20 }, (_, index) => (index + 1).toString());

//Dialog for argon2 default
var argon2visible = ref();

//Dialog for AES default
var aesencryption = ref(false);
var aesdecryption = ref(false);

//dialog for RSA default
var rsaencryption = ref(false);
var rsadecryption = ref(false);

//dialog for RC default
var rcencryption = ref(false);
var rcdecryption = ref(false);

//dialog for DES default
var desencryption = ref(false);
var desdecryption = ref(false);



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


//setup default AES values
const aesinput = ref();
aesinput.value = "";
const secretkey = ref();
secretkey.value = "";
const outputtype = ref();
outputtype.value = "Base64";
const aesvector = ref();
aesvector.value = "";

//setup default RSA values
const rsainput = ref();
rsainput.value = "";
const rsapublic = ref();
rsapublic.value = "";
const rsaprivate = ref();
rsaprivate.value = "";

//setup default RC values
const rcinput = ref();
rsainput.value = "";
const rcprivate = ref();
rsaprivate.value = "";

//setup default AES values
const desinput = ref();
desinput.value = "";
const desprivate = ref();
desprivate.value = "";


const getFilteredGroupedTypesForFirstSelect = computed(() => {
  // Filter the groupedTypes array to include only items with the code 'co'
  return groupedTypes.value.filter(group => group.code === 'co' || group.code === 'pt' || group.code === 'cr');
});


//Initialize the input and output
const value = ref("");
const value2 = ref("");
var inputvalue = ref();


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


//Show salt if the chosen method is Bcrypt
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

//Variables for checking if input or output is copied
const isCopied = ref(false);
const isCopied2 = ref(false);

//Copy input
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

//Copy output
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
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; //Characters list
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
    argon2visible.value = false;

    if (
        isNaN(argonite.value) ||
        isNaN(argonmem.value) ||
        isNaN(argonlen.value) ||
        isNaN(argonpar.value)
    ) {
        alert('Please enter valid numbers.');
        return;
    }

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
//Generate AES encrypted string
async function DialogAesGenerateEn(this: any): Promise<void> {
  
  const keyLength = secretkey.value.length;

  if (keyLength !== 16 && keyLength !== 32) {
    alert('Invalid key length. Key length must be 16 or 32 bytes.');
  }
  else if(aesvector.value.length !== 12){
    alert('Invalid vector length. Key length must be 12 bytes.');
  }
  else{
  const msg = new TextEncoder().encode(aesinput.value);
  const key = new TextEncoder().encode(secretkey.value);
  const iv = new TextEncoder().encode(aesvector.value);
  const encrypted = await aes.encrypt(msg, key, {name: 'AES-GCM', iv, tagLength: 16});
  const decrypted = await aes.decrypt(encrypted, key, {name: 'AES-GCM', iv, tagLength: 16});

  value2.value = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted))));

  value.value = aesinput.value;
    
  selectedType2.value = groupedTypes.value[1].items[0];
  aesencryption.value = false;
  }
  
  
}

//Generate RSA encrypted output
async function DialogRsaGenerateEn(this: any): Promise <void> {


  rsa.generateKey(2048).then( (key) => {
    // now you get the JWK public and private keys
    const publicKey = key.publicKey;
    rsapublic.value = jwk2pem(publicKey);
    const privateKey = key.privateKey;
    rsaprivate.value = jwk2pem(privateKey);

    const msg = new TextEncoder().encode(value.value);

    rsa.encrypt(
    msg,
    publicKey,
    'SHA-256', // optional, for OAEP. default is 'SHA-256'
  ).then( (encrypted) => {
    // now you get an encrypted message in Uint8Array
    value2.value = arrayBufferToBase64(encrypted);
    return rsa.decrypt(
      encrypted,
      privateKey,
      'SHA-256', // optional, for OAEP. default is 'SHA-256'
    );
    }).then( (decrypted) => {
    });
  })
  selectedType2.value = groupedTypes.value[1].items[0];

}

//Fix pem key
function fixPrivateKeyFormat(privateKey: string): string {
  const trimmedKey = privateKey.trim();
  const endKeyIndex = trimmedKey.lastIndexOf("-----END RSA PRIVATE KEY-----");

  if (endKeyIndex !== -1) {
    const keyPart = trimmedKey.substring(0, endKeyIndex).trim();
    const endKeyPart = trimmedKey.substring(endKeyIndex).trim();

    return `${keyPart}\n${endKeyPart}`;
  }

  return trimmedKey;
}

//Decrypt RSA string
async function DialogRsaGenerateDe(this: any): Promise <void> {
  try{
  const encrypted = base64Decode(rsainput.value);
  
  const pemKey = fixPrivateKeyFormat(rsaprivate.value);
  
  const privateKey = await pemToJwk(pemKey);

rsa.decrypt(
    encrypted,
    privateKey,
    'SHA-256', // optional, for OAEP. default is 'SHA-256'
).then( (decrypted) => {
  value2.value = new TextDecoder('utf-8').decode(decrypted);
});
}
catch(error){
  alert('Wrong key or input format. The key is probably only on one line. Try fixing it to multiple lines for PEM format.');
}
selectedType2.value = groupedTypes.value[0].items[0];
selectedType  .value = groupedTypes.value[0].items[0];
}

async function pemToJwk(pemKey: string): Promise<JsonWebKey> {
  return await pem2jwk(pemKey);
}

//Generage encrypted string
async function DialogRcGenerateEn(this:any, dynamicKey: string ): Promise <void>{
  rcprivate.value = dynamicKey;
  const encrypted = CryptoJS.RC4.encrypt(value.value, dynamicKey);
  value2.value = encrypted.toString();
  selectedType2.value = groupedTypes.value[1].items[0];
}

//Decrypt encrypted string
async function DialogRcGenerateDe(this:any): Promise<void> {
  try {
    const pastedKey = rcprivate.value;
    const decrypted = CryptoJS.RC4.decrypt(value.value, pastedKey);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    selectedType.value = groupedTypes.value[0].items[0];
    value2.value = decryptedText;
    rcdecryption.value = false;
  } catch (error: any) {
    if (error.message === 'Malformed UTF-8 data') {
      alert('Wrong key format.');
    } else {
      alert('Something went wrong.');
    }
  }
}

//Encrypt string to the DES base64 output
async function DialogDesGenerateEn(this:any, dynamicKey: string): Promise <void>{
  desprivate.value = dynamicKey;
  const encryptedData = CryptoJS.DES.encrypt(value.value, dynamicKey).toString();
  value2.value = encryptedData;
  selectedType2.value = groupedTypes.value[1].items[0];
}

//Decrypt DES string to the plaintext output
async function DialogDesGenerateDe(this:any): Promise <void>{
  const decryptedData = CryptoJS.DES.decrypt(value.value, desprivate.value).toString(CryptoJS.enc.Utf8);
  value2.value = decryptedData;
  selectedType.value = groupedTypes.value[0].items[0];
  desdecryption.value = false;
}

//generate a key for RC and DES
function generateRandomKey(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomKey = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomKey += characters.charAt(randomIndex);
    }
    return randomKey;
}

// Decode Base64 to Uint8Array
function base64Decode(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

//ArrayBuffer to Base64
function arrayBufferToBase64(buffer: Uint8Array): string {
  const uint8Array = new Uint8Array(buffer);
  const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binaryString);
}

//Decrypt AES input
async function DialogAesGenerateDe(this: any): Promise<void> {
  if (secretkey.value.length != 16) {
    alert('Private key must have 16 characters');
  } else if (aesvector.value.length != 12) {
    alert('Vector must have 12 characters');
  } else {    
    // Convert Uint8Array to a regular array
    const msg = new TextEncoder().encode(aesvector.value);
    const data = Uint8Array.from(atob(aesinput.value), c => c.charCodeAt(0))
    const key = new TextEncoder().encode(secretkey.value);
    const iv = new TextEncoder().encode(aesvector.value);
    const encrypted = await aes.encrypt(msg, key, {name: 'AES-GCM', iv, tagLength: 16});
    const decrypted = await aes.decrypt(data, key, {name: 'AES-GCM', iv, tagLength: 16});
    value2.value = new TextDecoder('utf-8').decode(decrypted);
    aesdecryption.value = false;
  }
}

//Hexadecimal to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const hexArray = hex.match(/.{1,2}/g);
  if (!hexArray) {
    throw new Error('Invalid hexadecimal string');
  }

  return new Uint8Array(hexArray.map(byte => parseInt(byte, 16)));
}



//Checks if AES is once opened
var isAesOpenEn = ref();
isAesOpenEn.value = false;

var isAesOpenDe = ref();
isAesOpenDe.value = false;

//Checks if RSA is once opened

var isRsaOpenEn = ref();
isRsaOpenEn.value = false;

var isRsaOpenDe = ref();
isRsaOpenDe.value = false;

//Checks if RC is once opened

var isRcOpenEn = ref();
isRcOpenEn.value = false;

var isRcOpenDe = ref();
isRcOpenDe.value = false;

//checks if AES is once opened

var isDesOpenEn = ref();
isDesOpenEn.value = false;

var isDesOpenDe = ref();
isDesOpenDe.value = false;

//Gets the file content for value.value
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

//Exports the file with value2.value
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

//Trim input (output does not have to be trimmed)
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

//Create LM hashed string
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


//Function for LM and NT hash (Do not edit)
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

//Function for LM and NT hash (Do not edit)
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

//Function for LM and NT hash (Do not edit)
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

//Generate NT hash
function create_NT_hashed_password_v1(password: String){
	var buf = Buffer.from(password, 'utf16le');
	var md4 = create();
	md4.update(buf);
	return Buffer.from(md4.digest());
}

//Function for additional functions. Basically cheking textarea everytime when action
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

//Do when dropdown value is selected
async function onChange() {
  let inputValue = (value.value).toString();
  let plainText = "";
  showSalt();

  if(selectedType.value.value == selectedType2.value.value){
    alert('Same method in input and output')
  }
  else{
    aesinput.value = value.value;
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
            alert(convertErrorMessage + "Cannot be converted.");
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
      case 'AES-GCM':{
          aesdecryption.value = true;
        break;
      }
      case 'RSA':{
          rsadecryption.value = true;
        break;
      }
      case 'RC':{
          rcdecryption.value = true;
        break;
      }
      case 'DES':{
          desdecryption.value = true;
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
      case 'AES-GCM':{
          aesencryption.value = true;
        break;
      }
      case 'RSA':{
          rsaencryption.value = true;
        break;
      }
      case 'RC':{
          rcencryption.value = true;
        break;
      }
      case 'DES':{
        desprivate.value = generateRandomKey(16);
          desencryption.value = true;
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
  <input aria-labelledby="Output Text Area" id="fileInput" type="file" style="display: none" @input="importInput"
    accept=".txt, .text" />
  <Card class="w-full text-white text-center mt-[20px]" style="background-color: var(--p-primary-color)">
    <template #title>Web user interface to support penetration testing</template>
    <template #content>
      <p class="m-0">
        Developed by Radim Pokorný, supervised by Ing. Willi Lazarov
      </p>
    </template>
  </Card>
  <div class="content">
    <div class="center">
      <div class="column1">
        <div class="center-dropdown">
          <div class="dropdown-copy">
            <div class="dropdown-block">
              <Select @change="onChange()" class="dropdown" v-model="selectedType"
                :options="getFilteredGroupedTypesForFirstSelect" filter optionLabel="label" optionGroupLabel="label"
                optionGroupChildren="items" placeholder="Select" style="width: 250px;">
                <template #optiongroup="slotProps">
                  <div class="flex align-items-center">
                    <div>{{ slotProps.option.label }}</div>
                  </div>
                </template>
              </Select>
            </div>
            <div class="button-block">
              <div class="button">
                <Button style="font-size: 2rem":icon="isCopied ? 'pi pi-check' : 'pi pi-copy'" aria-label="Filter" @click="copyValue"
                  class="w-[59.2px] h-[59.2px]" />
              </div>
              <div style="margin-left: 20px;" class="button">
                <Button icon="pi pi-file-export" aria-label="Filter"
                  onclick="document.getElementById('fileInput').click()" class="w-[59.2px] h-[59.2px]" />
              </div>
            </div>
          </div>
        </div>
        <div class="component">
          <FloatLabel variant="on">
            <Textarea id="text-input" v-model="value" rows="30" cols="50" @input="areaCheck" class="textarea"
              aria-labelledby="Input Text Area" />
            <label for="text-input">Input</label>
          </FloatLabel>
        </div>
      </div>
      <div class="column2">
        <div class="dropdown-copy">
          <div class="dropdown-block"></div>
          <div class="button-block"></div>
        </div>
        <div class="component">
          <Button icon="pi pi-arrow-right-arrow-left" aria-label="Filter" @click="swapValue()"
            class="swap-btn w-[59.2px] h-[59.2px]" :disabled="isSwapButtonDisabled" />
          <Button aria-label="Reset" icon="pi pi-replay" @click="resetComps" class="reset-btn w-[59.2px] h-[59.2px]" />
          <Button aria-label="Trim" icon="pi pi-star" @click="trimInput" class="trim-btn w-[59.2px] h-[59.2px]" />

        </div>
      </div>
      <div class="column3">
        <div class="dropdown-copy">
          <div class="dropdown-block">
            <Select class="dropdown" v-model="selectedType2" :options="groupedTypes" filter @change="onChange()"
              optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Select"
              style="width: 250px;">
              <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                  <div>{{ slotProps.option.label }}</div>
                </div>
              </template>
            </Select>
          </div>
          <div class="button-block">
            <div id="btn-drop" class="button">
              <InputNumber class="flex h-[59.2px] w-[59.2px]" v-tooltip.top="'Enter the number of salts'"
                v-model="selectedNumber" inputId="stacked-buttons" mode="decimal" showButtons :min="1" :max="20"
                @input="onChange()" />
            </div>
            <div id="btn-argon" class="button" style="margin-right: 20px;">
              <Button icon="pi pi-cog" aria-label="Options" @click="argon2visible = true"
                style="width: 59.2px !important; height: 59.2px;" />
            </div>
            <template>
              <div class="card flex justify-content-center">
                <Button label="Show" @click="argon2visible = true" />
                <Dialog :closable="false" v-model:visible="argon2visible" modal header="Argon2"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for hashing</span>
                  <div class="flex align-items-center gap-3 mb-5">
                    <label for="salt" class="font-semibold w-6rem">Salt</label>
                    <span style="display: flex; justify-content: center; align-items: center;"
                      class="p-input-icon-right">
                      <i class="pi pi-cog mr-2" @click="generateSalt()" />
                      <InputText v-model="argonsalt" id="salt" class="flex-auto" autocomplete="off" />
                    </span>
                  </div>
                  <div class="flex align-items-center gap-3 mb-5">
                    <label for="parallelismfactor" class="font-semibold w-6rem">Parallelism Factor</label>
                    <InputText v-model="argonpar" id="parallelismfactor" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-5">
                    <label for="memorycost" class="font-semibold w-6rem">Memory Cost (KB)</label>
                    <InputText v-model="argonmem" id="memorycost" class="flex-auto" autocomplete="off" />
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
                    <Button type="button" label="Cancel" @click="argon2visible = false"></Button>
                    <Button type="button" label="Generate hash" @click="DialogHashGenerate()"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="aesencryption" modal header="AES-GCM Encryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for encrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="aesinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="aesinput" v-model="aesinput" class="flex-auto" autocomplete="off" />
                  </div>
                  <div id="aes-vector" class="flex align-items-center gap-3 mb-3">
                    <label for="aes-vector" class="font-semibold w-6rem">Vector</label>
                    <InputText v-model="aesvector" id="aes-vector" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="aes-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="secretkey" id="aes-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="aesencryption = false; isAesOpenEn = false; selectedType2 = groupedTypes[1].items[0];"></Button>
                    <Button type="button" label="Save" @click="DialogAesGenerateEn(); isAesOpenEn = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="aesdecryption" modal header="AES-GCM Decryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for decrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="aesinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="aesinput" v-model="aesinput" class="flex-auto" autocomplete="off" />
                  </div>
                  <div id="aes-vector" class="flex align-items-center gap-3 mb-3">
                    <label for="aes-vector" class="font-semibold w-6rem">Vector</label>
                    <InputText v-model="aesvector" id="aes-vector" class="flex-auto" autocomplete="off" />

                  </div>

                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="aes-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="secretkey" id="aes-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="aesdecryption = false; isAesOpenDe = false; selectedType = groupedTypes[0].items[0];"></Button>
                    <Button type="button" label="Save" @click="DialogAesGenerateDe(); isAesOpenDe = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="rsaencryption" modal header="RSA Encryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for encrypting. Press button save for new
                    keys and output. Please do not paste keys in one line. The key will then have the wrong format
                  </span>
                  <div id="aes-vector" class="flex align-items-center gap-3 mb-2">
                    <label for="rsa-public" class="font-semibold w-6rem">Public key</label>
                    <InputText v-model="rsapublic" id="rsa-public" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="rsa-private" class="font-semibold w-6rem">Private key</label>
                    <Textarea v-model="rsaprivate" id="rsa-private" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="rsaencryption = false; isAesOpenDe = false; selectedType2 = groupedTypes[1].items[0];"></Button>
                    <Button type="button" label="Save" @click="DialogRsaGenerateEn(); isRsaOpenEn = false;"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="rsadecryption" modal header="RSA Decryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for decrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="rsainput" class="font-semibold w-6rem">Input</label>
                    <InputText id="rsainput" v-model="rsainput" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="rsa-private" class="font-semibold w-6rem">Private key</label>
                    <Textarea v-model="rsaprivate" id="rsa-private" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="rsadecryption = false; isAesOpenDe = false; selectedType = groupedTypes[0].items[0];"></Button>
                    <Button type="button" label="Save" @click="DialogRsaGenerateDe(); isRsaOpenDe = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="rcencryption" modal header="RC Encryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for encrypting. Press button save for new
                    key and output</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="rcinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="rcinput" v-model="value" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="rc-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="rcprivate" id="rc-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="rcencryption = false; isRcOpenEn = false; selectedType2 = groupedTypes[1].items[0];"></Button>
                    <Button type="button" label="Save"
                      @click="DialogRcGenerateEn(generateRandomKey(16)); isRcOpenEn = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="rcdecryption" modal header="RC Decryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for decrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="rcinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="rcinput" v-model="value" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="rc-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="rcprivate" id="rc-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="rcdecryption = false; isRcOpenDe = false; selectedType = groupedTypes[0].items[0];"></Button>
                    <Button type="button" label="Save" @click="DialogRcGenerateDe(); isRcOpenDe = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="desencryption" modal header="DES Encryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for encrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="desinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="desinput" v-model="value" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="des-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="desprivate" id="des-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="desencryption = false; isDesOpenEn = false; selectedType2 = groupedTypes[1].items[0];"></Button>
                    <Button type="button" label="Save"
                      @click="DialogDesGenerateEn(generateRandomKey(16)); isDesOpenEn = false"></Button>
                  </div>
                </Dialog>
                <Dialog :closable="false" v-model:visible="desdecryption" modal header="DES Decryption"
                  :style="{ width: '26rem' }">
                  <span class="p-text-secondary block mb-5">Enter parameters for decrypting.</span>
                  <div class="flex align-items-center gap-3 mb-3">
                    <label for="desinput" class="font-semibold w-6rem">Input</label>
                    <InputText id="desinput" v-model="value" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex align-items-center gap-3 mb-2">
                    <label for="des-secret" class="font-semibold w-6rem">Secret key</label>
                    <InputText v-model="desprivate" id="des-secret" class="flex-auto" autocomplete="off" />
                  </div>
                  <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" text severity="secondary"
                      @click="desdecryption = false; isDesOpenDe = false; selectedType = groupedTypes[0].items[0];"></Button>
                    <Button type="button" label="Save"
                      @click="DialogDesGenerateDe(); isDesOpenDe = false; desdecryption = false;"></Button>
                  </div>
                </Dialog>
              </div>
            </template>
            <div class="button">
              <Button :icon="isCopied2 ? 'pi pi-check' : 'pi pi-copy'" aria-label="Filter" @click="copyValue2"
                class="w-[59.2px] h-[59.2px]" />
            </div>
            <div style="margin-left: 20px;" class="button">
              <Button icon="pi pi-file-import" aria-label="Export" @click="exportOutput"
                class="w-[59.2px] h-[59.2px]" />
            </div>
          </div>
        </div>
        <div class="component">
          <FloatLabel variant="on">
            <Textarea id="text-output" v-model="value2" rows="30" cols="50" class="textarea"
              aria-labelledby="Output Text Area" disabled />
            <label for="text-output">Output</label>
          </FloatLabel>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

$background-color_1: #f16736;
// Custom colors
$primary-orange: #ff7c4b;
$primary-grey: #212121;
$primary-grey-dark: #1c1c1c;
$panel-container: rgba(0, 0, 0, .3);
$panel-dialog: rgba(0, 0, 0, .4);
$grey-border: rgba(255, 255, 255, .12);
$grey-row-unread: rgba(255, 255, 255, .15);
$grey-splitter: rgba(255, 255, 255, .3);
$grey-paginator: rgba(255, 255, 255, .6);
$grey-select: rgba(255, 255, 255, .87);
$ghost: #c8ebfb;
$editor-toolbar: #a2a2a2;

.p-select{
  background: $primary-grey-dark !important;
}

.p-textarea:disabled{
  background: $primary-grey-dark !important;
}

.p-textarea{
  background:$primary-grey !important;
}

.p-select-overlay{
  background: $primary-grey-dark !important;
}

.p-dialog{
  background: $primary-grey-dark !important;
}

.p-dialog-header, .p-dialog-content{
  background: transparent !important ;
}

*:focus {
  outline: none;
}

.button {
	margin-top: 20px;
  margin-bottom: 20px;
  max-width: 59.2px !important
}

.content {
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

.pi {
  font-size: 1.5rem !important;
}

.p-inputnumber-input{
  position: relative;
  width: 59.2px !important;
}

.p-inputnumber-button{
  width: 20px !important;
}

.p-inputnumber-stacked,
.p-inputnumber-clear-icon .p-inputnumber-horizontal .p-inputnumber-clear-icon {
  inset-inline-end: 0 !important;
}

.p-card .p-card-content {
  padding: 0 0 !important;
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

.p-button{
  color: white !important;
}

.p-button.p-button-icon-only {
  height: 3.7rem;
  width: 3.7rem;
  padding: .714rem;
  min-width: 3rem;
}

.dropdown{
  margin: 20px;
  margin-left: 0px;
  height: 59.2px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-float-label input:focus ~ label, .p-float-label input.p-filled ~ label, .p-float-label textarea:focus ~ label, .p-float-label textarea.p-filled ~ label, .p-float-label .p-inputwrapper-focus ~ label, .p-float-label .p-inputwrapper-filled ~ label
{
  font-size: 16px;
}

.p-floatlabel-on:has(input:focus) label,
.p-floatlabel-on:has(input.p-filled) label,
.p-floatlabel-on:has(input:-webkit-autofill) label,
.p-floatlabel-on:has(textarea:focus) label,
.p-floatlabel-on:has(textarea.p-filled) label,
.p-floatlabel-on:has(.p-inputwrapper-focus) label,
.p-floatlabel-on:has(.p-inputwrapper-filled) label {
  background: none !important;
}
@media only screen and (min-width: 950px) and (max-width: 1200px) {
  .dropdown{
    width: 150px !important;
  }
}

@media only screen and (max-width: 950px) {
  .p-card{
    margin-top: 2rem;
  }
  #app{
    margin: 0 auto;
  }

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
    .component{
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .column1, .column3{
    width: 100%;
    margin-left: 0px;
    margin-right: 0px;
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
</style>
