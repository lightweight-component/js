// 导入 UI 组件
// import * as Components from './components';
// 导入工具函数
// import * as Utils from './utils';

// 导出所有内容
export * from './components';
export * from './utils';
// export * from './pages';

export { default as HtmlEditor } from './components/html-editor/HtmlEditor.vue';
// 或者 export * from './components'; // 统一导出 components 目录下的所有内容

/* Admin */
import HomePage from './pages/admin/Home.vue';
import Login from './pages/admin/Login.vue';

export const admin = { HomePage, Login };

/* System */
import Article from './pages/system/Article.vue';
import DataDict from './pages/system/DataDict.vue';
import Schedule from './pages/system/Schedule.vue';
import ArticleEdit from './pages/system/ArticleEdit.vue';

export const system = { Article, DataDict, Schedule, ArticleEdit };

/* Shop */
import Transaction from './pages/shop/Transaction.vue';

export const shop = { Transaction };

/* IAM */
import App from './pages/iam/App.vue';
import LoginLog from './pages/iam/LoginLog.vue';
import Tenant from './pages/iam/Tenant.vue';
import Token from './pages/iam/Token.vue';
import User from './pages/iam/User.vue';

export const IAM = { App, LoginLog, Tenant, Token, User };

/* Config-widget */
import ListMgr from './components/configurable-widget/list/list.vue';
import ListInfo from './components/configurable-widget/list/info.vue';
import FormMgr from './components/configurable-widget/form/list.vue';
import FormInfo from './components/configurable-widget/form/info/info.vue';
import ListLoader from './components/configurable-widget/list/list-loader.vue';
import FormLoader from './components/configurable-widget/form/form-loader.vue';

export const ConfigWdiget = { ListMgr, ListInfo, FormMgr, FormInfo, ListLoader, FormLoader };
// export { default as ConfigWdigetFormMgr } from './components/configurable-widget/form/list.vue';

// 导入工具函数
export { getQueryParam } from './utils/utils';
