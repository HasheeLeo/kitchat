module.exports = (api) => {
  api.cache(true);

  return {
    plugins: [
      ['babel-plugin-root-import', {
        'rootPathSuffix': 'src/js'
      }]
    ],
    presets: ['module:metro-react-native-babel-preset'],
  }
};
