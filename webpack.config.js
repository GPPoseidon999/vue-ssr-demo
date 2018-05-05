//解析器
const argv = require('yargs-parser')(process.argv.slice(2));
//通过“通用”配置，我们不必在环境特定的配置中重复代码
const merge = require('webpack-merge');
const { resolve, join, basename } = require("path");
//判断命令行中传过来的参数是线上环境还是线下环境
const _mode = argv.mode || "development";
let _mergeConfig = "";
if(argv.env == "sever"){
    _mergeConfig = require(`./config/webpack.server.js`);
}else{
    _mergeConfig = require(`./config/webpack.${_mode}.js`);
}
//给watch布尔属性值 如果是线上环境不启用监听如果不是简单文件变化重新编译
const _modeflag = (_mode == "production" ? true : false);
const { VueLoaderPlugin } = require('vue-loader')
let _plugins = [new VueLoaderPlugin()];
let webpackConfig = {
    module: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                extractCSS:true
            }
        }, {
            test: /\.js$/,
            loader: 'babel-loader'
        }, {
            test: /\.css$/,
            use: [
                'vue-style-loader',
                'css-loader'
            ]
        }, {
            test: /\.(png|jpg|gif|eot|woff|woff2|ttf|svg|otf)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: _modeflag ? "images/[name].[hash:5].[ext]" : "images/[name].[ext]"
                }
            }]
        }]
    },
    //监听文件变化，当它们修改后会重新编译 默认关闭
    watch: !_modeflag,
    //一组用来定制 Watch 模式的选项
    watchOptions: {
        //对于某些系统，监听大量文件系统会导致大量的 CPU 或内存占用。这个选项可以排除一些巨大的文件夹，例如 node_modules
        ignored: /node_modules/,
        //当第一个文件更改，会在重新构建前增加延迟。这个选项允许 webpack 将这段时间内进行的任何其他更改都聚合到一次重新构建里。以毫秒为单位
        aggregateTimeout: 300,
        //指定毫秒为单位进行轮询
        poll: 1
    },
    optimization: {

    },
    //输出路径
    output: {
        //路径
        path: join(__dirname, './dist/assets'),
        //公共路径
        publicPath: "/",
        //文件名
        filename: "scripts/[name].bundle.js"
    },
    //插件
    plugins: [
        ..._plugins,
    ],
    //设置模块如何被解析
    resolve: {
        //告诉 webpack 解析模块时应该搜索的目录。
        modules: [
            resolve(__dirname, 'node_modules'),
        ],
        //自动解析确定的扩展。默认值为：js json
        extensions: [".js", ".css", ".vue"]
    }
};
module.exports = merge(webpackConfig, _mergeConfig);
