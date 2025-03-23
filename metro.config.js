const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add resolution for Firebase subpath exports
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];
// Configure resolver to prioritize React Native modules for Firebase
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

// Export with NativeWind configuration
module.exports = withNativeWind(config, { input: "./global.css" });
