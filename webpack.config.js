const path = require('path');

module.exports = (env, options) => {
    return {
        entry: './src/index.js',
        module: {
            rules: [
                {
                    test: /\.zip$/i,
                    type: 'asset/resource'
                },
            ],
        },
        output: {
            path: path.resolve(__dirname, 'out/js'),
            filename: 'index.js',
        },
    }
};