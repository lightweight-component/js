// import * as sys_config from './util/system/config';
// import * as util from './util/utils';
// import { setBaseHeadParams } from './util/xhr';

import Fast_iViewTable from './iView-ext/fast-iview-table/list';
import iViewListCommon from './iView-ext/fast-iview-table/fast-iview-table.vue';
import ApiSelector from './api-selector/index.vue';
import ApiHelper from './api-helper/index.vue';
import DataSource from './data-source/data-source';
import TableSelector from './table-selector/table-selector.vue';
import IAM from './iam/iam';

/**
 * 暴露各个组件
 */
export default {
    ApiHelper, ApiSelector, Fast_iViewTable, iViewListCommon, DataSource, TableSelector, IAM
};