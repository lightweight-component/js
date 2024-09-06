const { defineConfig } = require('@vue/cli-service');
const { console } = require('inspector');
const path = require('path');
console.log(path)

module.exports = defineConfig({
  transpileDependencies: false,
  chainWebpack: (config) => {
    config.externals({
      '@ajaxjs/util': '@ajaxjs/util'
    });
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, '.\\src\\style\\common-functions.less')]
    }
  }
})
