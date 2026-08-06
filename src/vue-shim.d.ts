declare module "*.vue" {
    import { defineComponent } from "vue";
    const component: ReturnType<typeof defineComponent>;
    export default component;
  
}

declare module 'file-saver';
declare module 'bcrypt-ts';
declare module 'js-md4';
declare module 'des.js';
declare module 'argon2-browser/dist/argon2-bundled.min.js';
declare module 'crypto-js/aes';
declare module 'node-rsa';
declare module 'crypto-js';
declare module 'crypto-browserify';
declare module 'pem-jwk'
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}