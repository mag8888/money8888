module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Используем стандартную конфигурацию react-scripts
      return webpackConfig;
    }
  },
  babel: {
    presets: [
      ['@babel/preset-env', {
        targets: {
          browsers: ['>0.2%', 'not dead', 'not op_mini all']
        }
      }],
      ['@babel/preset-react', {
        runtime: 'automatic'
      }]
    ]
  }
};
