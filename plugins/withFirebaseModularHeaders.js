const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to fix the "non-modular header inside framework module"
 * build error for @react-native-firebase when using `useFrameworks: "static"`.
 *
 * Instead of adding a new post_install block (which causes a duplicate error),
 * this injects the fix INTO the existing post_install block.
 */
module.exports = function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfileContents = fs.readFileSync(podfilePath, "utf8");

      // Only add if not already present
      if (
        !podfileContents.includes(
          "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"
        )
      ) {
        const snippet = `
    # [withFirebaseModularHeaders] Fix non-modular header includes for Firebase
    installer.pods_project.targets.each do |target|
      if target.name.start_with?("RNFB") || target.name.start_with?("Firebase")
        target.build_configurations.each do |build_config|
          build_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end`;

        // Inject into the existing post_install block, right after "post_install do |installer|"
        podfileContents = podfileContents.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${snippet}`
        );

        fs.writeFileSync(podfilePath, podfileContents);
      }

      return config;
    },
  ]);
};
