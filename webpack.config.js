module.exports = {
    entry: '.\\jsx\\main\\mundoDodgeBall.jsx',
    output: {
        path: __dirname + '\\js',
        filename: 'mundoDodgeBall.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude:/(node_modules)/,
                use: ['babel-loader']
            }
        ]
    }
}