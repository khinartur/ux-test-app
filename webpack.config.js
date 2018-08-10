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
};
