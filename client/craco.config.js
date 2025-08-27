/* eslint-disable */
// CRACO config to avoid eval-based devtool for CSP
module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      // CRA uses eval-based devtool in development (cheap-module-source-map / eval). Replace to be CSP-safe.
      if (env === 'development') {
        webpackConfig.devtool = 'source-map';
      }
      return webpackConfig;
    }
  }
};


