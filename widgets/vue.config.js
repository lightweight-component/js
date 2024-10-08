const { defineConfig } = require('@vue/cli-service');
// const { console } = require('inspector');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, '.\\src\\style\\common-functions.less')]
    }
  }
})
