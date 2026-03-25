module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@components": "./components",
            "@hooks": "./hooks",
            "@app-types": "./types",
            "@services": "./services",
            "@store": "./store",
            "@pages": "./pages",
            "@constants": "./constants/index",
          },
        },
      ],
    ],
  };
};
