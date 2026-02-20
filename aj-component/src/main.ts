import { createApp } from 'vue';
import ViewUIPlus from 'view-ui-plus';
import App from './pages/App.vue';
import route from './common/route';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import './style/style.css';

createApp(App).use(ViewUIPlus).use(route).mount('#app');