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

//UI components and icons
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Scissors,
  Settings,
  Upload,
} from 'lucide-vue-next';

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
        { label: 'Bin', value: 'Bin' },
        { label: 'URL encode', value: 'URL-Encode' },
        { label: 'Double URL encode', value: 'Double-URL-Encode' },
        { label: 'HEX literal', value: 'Hex-Literal' }
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

//Separator used to join/split the per-character tokens of ASCII / URL encode / Double URL encode
const separator = ref('');

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

//Find a type item (across all groups) by its raw value, for the shadcn Select v-model
function findTypeItem(val: string) {
  for (const group of groupedTypes.value) {
    const found = group.items.find((item) => item.value === val);
    if (found) return found;
  }
  return undefined;
}

//shadcn Select binds to a plain string value, unlike PrimeVue's whole-object v-model
const selectedTypeValue = computed<string | undefined>({
  get: () => selectedType.value?.value,
  set: (val) => {
    if (!val) return;
    selectedType.value = findTypeItem(val);
    onChange();
  },
});

const selectedType2Value = computed<string | undefined>({
  get: () => selectedType2.value?.value,
  set: (val) => {
    if (!val) return;
    selectedType2.value = findTypeItem(val);
    onChange();
  },
});

//Show the salt stepper / Argon2 options button only for the matching output method
const showSaltStepper = computed(() => selectedType2.value?.value === 'Bcrypt');
const showArgonOptions = computed(() => selectedType2.value?.value === 'Argon2');

//Show the separator field when the output splits its result into per-character tokens
const showSeparatorInput = computed(() =>
  ['ASCII', 'URL-Encode', 'Double-URL-Encode'].includes(selectedType2.value?.value)
);

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

//Opens the hidden file picker for importInput
function triggerFileImport(): void {
  document.getElementById('fileInput')?.click();
}

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
}

//Trim input (output does not have to be trimmed)
function trimInput(): void {
  value.value = value.value.trim();
}

//Function to convert ASCII to plain text
function AsciiToPlain(AsciiString: string, sep: string = '') {
  //Decoding still needs a delimiter to split the codes; fall back to a space when none is set
  var array = AsciiString.split(sep === '' ? ' ' : sep);
  var output = "";
  for(let i = 0; i < array.length; i++){
    var num = Number(array[i]);
    const character = String.fromCharCode(num);
    output += character;
  }
  return output;
}

//Function to convert plain text to ASCII
function PlainToAscii(ptString: string, sep: string = '') {
  var output = "";
  for(let i = 0; i < ptString.length; i++){
    let code = ptString.charCodeAt(i);
    output += code + sep;
  }
  output = sep === '' ? output : output.slice(0, -sep.length);
  return output;
}

//Function to convert plain text to percent-encoded (every character, not just reserved ones)
function PlainToUrlEncode(ptString: string, sep: string = ''): string {
  return ptString
    .split('')
    .map((char) => '%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .join(sep);
}

//Function to convert plain text to double percent-encoded (the '%' of the single encoding gets encoded again)
function PlainToDoubleUrlEncode(ptString: string, sep: string = ''): string {
  return ptString
    .split('')
    .map((char) => ('%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).replace(/%/g, '%25'))
    .join(sep);
}

//Function to convert plain text to a single 0x-prefixed hex literal
function PlainToHexLiteral(ptString: string): string {
  return '0x' + ptString
    .split('')
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
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
  //Automatically adding the separator between ASCII values (space when none is set)
  if(selectedType.value.value == 'ASCII'){
    const sep = separator.value === '' ? ' ' : separator.value;
    if(value.value.length >= 3){
    var lastChars = value.value.substring(value.value.length - 3);
    if(lastChars.includes(sep) == false){
      value.value += sep;
    }
  }
  }
}

//Do when dropdown value is selected
async function onChange() {
  let inputValue = (value.value).toString();
  let plainText = "";

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
        const asciiSep = separator.value === '' ? ' ' : separator.value;
        var controlArray = inputValue.split(asciiSep);
        for(var i =  0; i<controlArray.length;i++){
          if(controlArray[i].length > 3){
            alert('A separator between ASCII values ​​is missing somewhere in the input');
            value.value= "";
            return;
          }
        }
        //Decoding to the character format with a custom method
        plainText = AsciiToPlain(inputValue, separator.value);
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
        outputValue = PlainToAscii(plainText, separator.value);
        value2.value = outputValue;
        }
        break;
      }
      case 'URL-Encode': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        outputValue = PlainToUrlEncode(plainText, separator.value);
        value2.value = outputValue;
        }
        break;
      }
      case 'Double-URL-Encode': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        outputValue = PlainToDoubleUrlEncode(plainText, separator.value);
        value2.value = outputValue;
        }
        break;
      }
      case 'Hex-Literal': {
        if(selectedType.value.value == 'Dec'||selectedType.value.value =='Hex'){
          alert('Please use character decoding method instead of only numeric');
        }
        else{
        outputValue = PlainToHexLiteral(plainText);
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
  <input
    id="fileInput"
    aria-labelledby="Output Text Area"
    type="file"
    class="hidden"
    accept=".txt, .text"
    @input="importInput"
  />
  <TooltipProvider :delay-duration="300">
  <div class="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-8 sm:px-6 lg:px-10">
    <div class="grid w-full max-w-6xl grid-cols-1 items-stretch self-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-4">
      <!-- Input column -->
      <div class="flex min-w-0 flex-col gap-2 md:gap-4">
        <div class="flex flex-row items-center gap-3 max-[440px]:flex-col">
          <Select v-model="selectedTypeValue">
            <SelectTrigger
              class="h-12 flex-1 rounded-full border-1 bg-background px-4 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300 focus:border-primary data-[state=open]:border-primary max-[440px]:w-full"
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup v-for="group in getFilteredGroupedTypesForFirstSelect" :key="group.code">
                <SelectLabel v-if="group.label">{{ group.label }}</SelectLabel>
                <SelectItem v-for="item in group.items" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div class="flex items-center gap-2 max-[440px]:w-full max-[440px]:justify-center">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 shrink-0 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
                  aria-label="Copy input"
                  @click="copyValue"
                >
                  <Check v-if="isCopied" class="h-5 w-5" />
                  <Copy v-else class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zkopírovat vstup</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 shrink-0 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
                  aria-label="Import from file"
                  @click="triggerFileImport"
                >
                  <Upload class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Importovat ze souboru</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div class="flex min-h-0 flex-1 flex-col gap-4">
          <Label for="text-input" class="text-muted-foreground">Input</Label>
          <Textarea
            id="text-input"
            v-model="value"
            aria-labelledby="Input Text Area"
            class="min-h-[280px] flex-1 resize-none rounded-2xl border-1 font-mono text-sm lg:min-h-[380px]"
            @input="areaCheck"
          />
        </div>
      </div>
      <!-- Actions column -->
      <div class="flex flex-row items-center justify-center gap-3 md:h-full md:flex-col">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="h-12 w-12 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
              aria-label="Swap input and output"
              :disabled="isSwapButtonDisabled"
              @click="swapValue()"
            >
              <ArrowLeftRight class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Prohodit vstup a výstup</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="h-12 w-12 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
              aria-label="Reset"
              @click="resetComps"
            >
              <RotateCcw class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Resetovat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="h-12 w-12 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
              aria-label="Trim input"
              @click="trimInput"
            >
              <Scissors class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Oříznout mezery ve vstupu</TooltipContent>
        </Tooltip>
      </div>

      <!-- Output column -->
      <div class="flex min-w-0 flex-col gap-2 md:gap-4">
        <div class="flex flex-row items-center gap-3 max-[440px]:flex-col">
          <div
            class="flex h-12 flex-1 items-center overflow-hidden rounded-full border-1 bg-background transition-colors transition-300 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent focus-within:border-primary max-[440px]:w-full"
          >
            <Select v-model="selectedType2Value">
              <SelectTrigger
                class="h-full flex-1 rounded-none border-0 bg-transparent px-4 hover:bg-transparent focus:bg-transparent focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-transparent"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-for="group in groupedTypes" :key="group.code">
                  <SelectLabel v-if="group.label">{{ group.label }}</SelectLabel>
                  <SelectItem v-for="item in group.items" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <template v-if="showSeparatorInput">
              <div class="h-8 w-px shrink-0 bg-border" />
              <Tooltip>
                <TooltipTrigger as-child>
                  <input
                    id="separator"
                    v-model="separator"
                    maxlength="10"
                    aria-label="Oddělovač"
                    placeholder="oddělovač"
                    class="h-full w-30 shrink-0 bg-transparent pr-4 pl-2 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    @input="onChange()"
                  />
                </TooltipTrigger>
                <TooltipContent>Oddělovač znaků ve výstupu</TooltipContent>
              </Tooltip>
            </template>
          </div>
          <div class="flex items-center gap-2 max-[440px]:w-full max-[440px]:justify-center">
            <div
              v-show="showSaltStepper"
              class="flex h-12 items-center gap-1 rounded-full border-1 bg-background px-1"
            >
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-9 w-9 rounded-full"
                    aria-label="Decrease salt rounds"
                    :disabled="selectedNumber <= 1"
                    @click="selectedNumber = Math.max(1, selectedNumber - 1); onChange()"
                  >
                    <Minus class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snížit počet saltů</TooltipContent>
              </Tooltip>
              <span class="w-5 text-center text-sm tabular-nums">{{ selectedNumber }}</span>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-9 w-9 rounded-full"
                    aria-label="Increase salt rounds"
                    :disabled="selectedNumber >= 20"
                    @click="selectedNumber = Math.min(20, selectedNumber + 1); onChange()"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zvýšit počet saltů</TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  v-show="showArgonOptions"
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 shrink-0 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
                  aria-label="Argon2 options"
                  @click="argon2visible = true"
                >
                  <Settings class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Možnosti Argon2</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 shrink-0 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
                  aria-label="Copy output"
                  @click="copyValue2"
                >
                  <Check v-if="isCopied2" class="h-5 w-5" />
                  <Copy v-else class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zkopírovat výstup</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 shrink-0 rounded-full border-1 hover:border-primary hover:bg-linear-to-t hover:from-primary/20 hover:to-transparent transition-colors transition-300"
                  aria-label="Export output"
                  @click="exportOutput"
                >
                  <Download class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportovat výstup</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div class="flex min-h-0 flex-1 flex-col gap-4">
          <Label for="text-output" class="text-muted-foreground">Output</Label>
          <Textarea
            id="text-output"
            v-model="value2"
            readonly
            aria-labelledby="Output Text Area"
            class="min-h-[280px] flex-1 resize-none rounded-2xl border-1 font-mono text-sm lg:min-h-[380px]"
          />
        </div>
      </div>
    </div>
    <!-- Argon2 hashing options -->
    <Dialog v-model:open="argon2visible">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Argon2</DialogTitle>
          <DialogDescription>Enter parameters for hashing</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <Label for="salt" class="w-36 shrink-0">Salt</Label>
            <div class="flex flex-1 items-center gap-2">
              <Input id="salt" v-model="argonsalt" class="flex-1" autocomplete="off" />
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button type="button" variant="outline" size="icon" aria-label="Generate salt" @click="generateSalt()">
                    <RefreshCw class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vygenerovat salt</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Label for="parallelismfactor" class="w-36 shrink-0">Parallelism Factor</Label>
            <Input id="parallelismfactor" v-model="argonpar" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="memorycost" class="w-36 shrink-0">Memory Cost (KB)</Label>
            <Input id="memorycost" v-model="argonmem" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="iterations" class="w-36 shrink-0">Iterations</Label>
            <Input id="iterations" v-model="argonite" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="hashlength" class="w-36 shrink-0">Hash Length</Label>
            <Input id="hashlength" v-model="argonlen" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" @click="argon2visible = false">Cancel</Button>
          <Button type="button" @click="DialogHashGenerate()">Generate hash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- AES-GCM encryption -->
    <Dialog v-model:open="aesencryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AES-GCM Encryption</DialogTitle>
          <DialogDescription>Enter parameters for encrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="aesinput-en" class="w-28 shrink-0">Input</Label>
            <Input id="aesinput-en" v-model="aesinput" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="aes-vector-en" class="w-28 shrink-0">Vector</Label>
            <Input id="aes-vector-en" v-model="aesvector" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="aes-secret-en" class="w-28 shrink-0">Secret key</Label>
            <Input id="aes-secret-en" v-model="secretkey" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="aesencryption = false; isAesOpenEn = false; selectedType2 = groupedTypes[1].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogAesGenerateEn(); isAesOpenEn = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- AES-GCM decryption -->
    <Dialog v-model:open="aesdecryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AES-GCM Decryption</DialogTitle>
          <DialogDescription>Enter parameters for decrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="aesinput-de" class="w-28 shrink-0">Input</Label>
            <Input id="aesinput-de" v-model="aesinput" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="aes-vector-de" class="w-28 shrink-0">Vector</Label>
            <Input id="aes-vector-de" v-model="aesvector" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="aes-secret-de" class="w-28 shrink-0">Secret key</Label>
            <Input id="aes-secret-de" v-model="secretkey" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="aesdecryption = false; isAesOpenDe = false; selectedType = groupedTypes[0].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogAesGenerateDe(); isAesOpenDe = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- RSA encryption -->
    <Dialog v-model:open="rsaencryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RSA Encryption</DialogTitle>
          <DialogDescription>
            Enter parameters for encrypting. Press button save for new keys and output. Please do not paste keys in
            one line. The key will then have the wrong format.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="rsa-public" class="w-28 shrink-0">Public key</Label>
            <Input id="rsa-public" v-model="rsapublic" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="rsa-private-en" class="w-28 shrink-0">Private key</Label>
            <Textarea id="rsa-private-en" v-model="rsaprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="rsaencryption = false; isAesOpenDe = false; selectedType2 = groupedTypes[1].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogRsaGenerateEn(); isRsaOpenEn = false;">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- RSA decryption -->
    <Dialog v-model:open="rsadecryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RSA Decryption</DialogTitle>
          <DialogDescription>Enter parameters for decrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="rsainput" class="w-28 shrink-0">Input</Label>
            <Input id="rsainput" v-model="rsainput" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="rsa-private-de" class="w-28 shrink-0">Private key</Label>
            <Textarea id="rsa-private-de" v-model="rsaprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="rsadecryption = false; isAesOpenDe = false; selectedType = groupedTypes[0].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogRsaGenerateDe(); isRsaOpenDe = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- RC encryption -->
    <Dialog v-model:open="rcencryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RC Encryption</DialogTitle>
          <DialogDescription>Enter parameters for encrypting. Press button save for new key and output.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="rcinput-en" class="w-28 shrink-0">Input</Label>
            <Input id="rcinput-en" v-model="value" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="rc-secret-en" class="w-28 shrink-0">Secret key</Label>
            <Input id="rc-secret-en" v-model="rcprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="rcencryption = false; isRcOpenEn = false; selectedType2 = groupedTypes[1].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogRcGenerateEn(generateRandomKey(16)); isRcOpenEn = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- RC decryption -->
    <Dialog v-model:open="rcdecryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RC Decryption</DialogTitle>
          <DialogDescription>Enter parameters for decrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="rcinput-de" class="w-28 shrink-0">Input</Label>
            <Input id="rcinput-de" v-model="value" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="rc-secret-de" class="w-28 shrink-0">Secret key</Label>
            <Input id="rc-secret-de" v-model="rcprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="rcdecryption = false; isRcOpenDe = false; selectedType = groupedTypes[0].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogRcGenerateDe(); isRcOpenDe = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- DES encryption -->
    <Dialog v-model:open="desencryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>DES Encryption</DialogTitle>
          <DialogDescription>Enter parameters for encrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="desinput-en" class="w-28 shrink-0">Input</Label>
            <Input id="desinput-en" v-model="value" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="des-secret-en" class="w-28 shrink-0">Secret key</Label>
            <Input id="des-secret-en" v-model="desprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="desencryption = false; isDesOpenEn = false; selectedType2 = groupedTypes[1].items[0];"
          >
            Cancel
          </Button>
          <Button type="button" @click="DialogDesGenerateEn(generateRandomKey(16)); isDesOpenEn = false">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- DES decryption -->
    <Dialog v-model:open="desdecryption">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>DES Decryption</DialogTitle>
          <DialogDescription>Enter parameters for decrypting.</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <Label for="desinput-de" class="w-28 shrink-0">Input</Label>
            <Input id="desinput-de" v-model="value" class="flex-1" autocomplete="off" />
          </div>
          <div class="flex items-center gap-3">
            <Label for="des-secret-de" class="w-28 shrink-0">Secret key</Label>
            <Input id="des-secret-de" v-model="desprivate" class="flex-1" autocomplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            @click="desdecryption = false; isDesOpenDe = false; selectedType = groupedTypes[0].items[0];"
          >
            Cancel
          </Button>
          <Button
            type="button"
            @click="DialogDesGenerateDe(); isDesOpenDe = false; desdecryption = false;"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  </TooltipProvider>
</template>
