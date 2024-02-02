declare module "*.vue" {
    import { defineComponent } from "vue";
    const component: ReturnType<typeof defineComponent>;
    export default component;
  
}

declare module 'file-saver';
declare module 'bcrypt-ts';
declare module 'js-md4';
declare module 'des.js';

declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}