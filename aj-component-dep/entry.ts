// entry.ts
// import MyButton from './src/components/my-button/MyButton.vue';
import Role from './src/components/permission/Role.vue';

// 导出组件供外部使用
export { default as Role } from './src/components/permission/Role.vue';

// 如果你想注册为自定义元素（Web Component）
// customElements.define('my-button', defineCustomElement(Role));