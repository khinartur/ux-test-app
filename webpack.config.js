const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    cache: true,
    entry: './src/index.tsx',
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    output: {
        path: __dirname + '/dist/static',
        filename: 'js/index.js',
    },
    devServer: {
        contentBase: [
            __dirname + '/dist',
        ],
        port: 7000,
        historyApiFallback: true,
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    // 'postcss-loader',
                    'sass-loader',
                ],
            },
            // {
            //     test: /\.scss$/,
            //     use: ExtractTextPlugin.extract({
            //         use: [
            //             {
            //                 loader: "style-loader"
            //             },
            //             {
            //                 loader: "css-loader",
            //                 options: {
            //                     sourceMap: true
            //                 }
            //             },
            //             {
            //                 loader: "sass-loader",
            //                 options: {
            //                     sourceMap: true
            //                 }
            //             }
            //         ],
            //     })
            // },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/templates/index.html',
            filename: 'index.html',
        }),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        }),
    ]
};
