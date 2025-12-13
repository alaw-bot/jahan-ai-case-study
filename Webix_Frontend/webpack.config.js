const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js', // The entry point of your app
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Cleans the dist folder before each build
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'], // Handling CSS files
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Uses your HTML as a template
        }),
    ],
    devServer: {
        static: './dist',
        open: true, // Automatically opens the browser
        hot: true,  // Refreshes when you save changes
    },
};