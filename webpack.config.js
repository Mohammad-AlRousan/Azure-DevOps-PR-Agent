const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      'pr-hub': './src/light-extension.js',
      'pr-actions': './src/light-extension.js',
      'pr-tabs': './src/light-extension.js',
      'dashboard-widget': './src/light-extension.js',
      'settings-hub': './src/light-extension.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    devtool: isProduction ? false : false, // Disable source maps for faster builds
    optimization: {
      minimize: isProduction,
      splitChunks: false // Disable chunk splitting for smaller bundles
    },
    externals: {
      'azure-devops-extension-sdk': 'SDK',
      'azure-devops-extension-api': 'API'
    }
  };
};
