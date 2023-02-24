const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const config = {
	entry: {
		app: './src/js/app.js',
		dom: './src/js/dom.js',
		chess: './src/js/chess.js',
		jQuery_tasks: './src/js/jQuery_tasks.js'
	},
	output: {
		path: path.resolve( __dirname, 'dist' ),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			},

		]
	},
	plugins: [
		new MiniCssExtractPlugin()
	]
};

module.exports = config;
