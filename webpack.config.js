var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    cache: true,
    entry: './src/index.tsx',
    resolve: {
        extensions: ['.tsx', '.d.ts', '.js'],
    },
    output: {
        path: __dirname + '/dist/static',
        filename: 'js/index.js',
    },
    devServer: {
        contentBase: [
            __dirname + '/public',
            __dirname + '/dist',
        ],
        port: 7000,
        historyApiFallback: true
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
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/templates/index.html',
            filename: 'index.html',
        })
    ]
};
