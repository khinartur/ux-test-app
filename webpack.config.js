const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production';
const webpack = require('webpack');

module.exports = {
    //devtool: 'cheap-source-map',
    devtool: 'source-map',
    cache: true,
    entry: './src/index.tsx',
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    output: {
        path: __dirname + '/dist/static',
        publicPath: '/',
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
                        loader: 'awesome-typescript-loader',
                        options: {
                            forceIsolatedModules: true,
                            useCache: true,
                        }
                    }
                ],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'cache-loader',
                    {
                        loader: 'typings-for-scss-modules-loader',
                        options: {
                            sass: true,
                            modules: true,
                            namedExport: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('postcss-preset-env')(),
                            ]
                        }
                    },
                    // {
                    //     loader: "css-loader",
                    //     options: {
                    //         modules: true,
                    //         importLoaders: 1,
                    //         sourceMap: true
                    //     }
                    // },
                ],
            },
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
