import Vue from 'vue'
import apiSelector from './api-selector/index.vue';
import apiHelper from './api-helper/index.vue';
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

Vue.config.productionTip = false;
Vue.use(ViewUI);

const apiSelectorFn = h => h(apiSelector, {
    props: {
        apiRoot: 'foo'
    }
});

const apiHelperFn = h => h(apiHelper, {
    props: {
        apiRoot: 'foo'
    }
});

new Vue({ render: apiHelperFn }).$mount('#app');