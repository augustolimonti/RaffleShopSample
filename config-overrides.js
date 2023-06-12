const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
module.exports = function override(config) {
	 const fallback = config.resolve.fallback || {
		 "process/browser": require.resolve("process/browser")
	 };

	 config.resolve.fallback = fallback;
	 config.plugins = (config.plugins || []).concat([
	 	new webpack.ProvidePlugin({
	  	process: 'process/browser',
	    Buffer: ['buffer', 'Buffer']
	  }),
		new Dotenv({
	    systemvars: true
	  })
	 ])
	 return config; }
