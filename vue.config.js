const path = require('path');
const webpack = require('webpack');
const port = process.env.BLOCKLET_PORT || process.env.PORT || 3000;

module.exports = {
  publicPath: process.env.PUBLIC_PATH || '/',
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        // 这里假设你有 `src/variables.scss  src/scss/mixin.scss` 这两个文件
        path.resolve(__dirname, './src/assets/scss/index.scss'),
        // path.resolve(__dirname, './src/scss/mixin.scss'),
      ],
    },
  },
  // 调整 webpack 配置最简单的方式就是在 vue.config.js中的configureWebpack选项提供一个对象
  //webpack ProvidePlugin创建一个全局变量，在webpack各个模块内都可以使用。
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery', // 创建 '$'、'jQuery'、'window.jQuery' 三个变量指向依赖jquery
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default'], // 创建 'Popper' 变量指向依赖popper.js。
      }),
    ],
  },
  css: {
    loaderOptions: {
      css: {
        // 这里的选项会传递给 css-loader
      },
      postcss: {
        // 这里的选项会传递给 postcss-loader
      },
    },
  },
  devServer: {
    port,
    allowedHosts: 'all',
    client: {
      // If you want to development this blocklet without blocklet-server, you can delete next line, otherwise the hot reload will be failed.
      webSocketURL: 'wss://0.0.0.0/ws',
    },
  },
};
