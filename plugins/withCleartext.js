const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withCleartext(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];
    app.$["android:usesCleartextTraffic"] = "true";
    return config;
  });
};
