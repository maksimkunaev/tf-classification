const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'
const ComponentDirectoryPlugin = require("component-directory-webpack-plugin");
const PreloadWebpackPlugin = require('preload-webpack-plugin');

const paths = {
    appSrc: path.resolve(__dirname, './src'),
};

module.exports = {
    devtool: 'source-map',
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'main.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'less-loader',
                        options: {
                            modifyVars: {
                                'primary-color': '#000',
                                'link-color': '#000',
                                'border-radius-base': '2px',
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(js|jsx)/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-react"],
                            plugins: [
                                "@babel/plugin-transform-runtime",
                                "@babel/plugin-syntax-dynamic-import",
                                "@babel/plugin-proposal-object-rest-spread",
                                ["import", {
                                    "libraryName": "antd",
                                    style: 'css'
                                }],
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                ["@babel/plugin-proposal-class-properties", { "loose" : true }]
                            ],
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  "css-loader"
                ]
            },
            {
                test: /\.styl$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        }
                    },
                    'stylus-loader'
                ]
            },
            {
                test: /\.(eot|woff|woff2|ttf|jpg|png|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'static/[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                exclude: paths.modules,
                oneOf: [
                    {
                        issuer: /\.jsx?$/,
                        use: [
                            {
                                loader: 'babel-loader'
                            },
                            {
                                loader: 'svg-react-loader',
                            }
                        ]
                    },
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name].[ext]',
                            outputPath: 'images/'
                        }
                    }
                ]
            },

        ]
    },
    node: {
      fs: 'empty'
    },
    resolve: {
        plugins: [new ComponentDirectoryPlugin()],
        extensions: ['.js', '.jsx'],
        modules: [paths.appSrc, 'node_modules'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new PreloadWebpackPlugin({
            rel: 'preload',
            as(entry) {
                if (/\.css$/.test(entry)) return 'style';
                if (/\.woff$/.test(entry)) return 'font';
                if (/\.png$/.test(entry)) return 'image';
                return 'script';
            }
        }),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new CopyPlugin([
            {
                from: path.join(__dirname, '/src/assets'),
                to: path.join(__dirname, '/dist/assets')
            }
        ])
    ]
}
