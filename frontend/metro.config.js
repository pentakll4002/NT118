const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v4 cần pipeline Metro cho global.css; thiếu file này dễ kẹt / quay vòng khi bundle.
module.exports = withNativeWind(config, {
  input: './global.css',
  disableTypeScriptGeneration: true,
});
