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
declare module 'js-crypto-aes';
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}