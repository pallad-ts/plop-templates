function createRootConfigurationGenerator({ updatePackageJson }) {
  return {
    description: "Copy root-level tooling configuration files",
    prompts: [],
    actions: [
      {
        type: "add",
        path: ".editorconfig",
        templateFile: "templates/root-configuration/.editorconfig",
      },
      {
        type: "add",
        path: ".prettierrc.js",
        templateFile: "templates/root-configuration/.prettierrc.js",
      },
      {
        type: "add",
        path: ".yarnrc.yml",
        templateFile: "templates/root-configuration/.yarnrc.yml",
      },
      {
        type: "add",
        path: "vitest.base.config.ts",
        templateFile: "templates/root-configuration/vitest.base.config.ts",
      },
      {
        type: "add",
        path: "tsconfig.json",
        templateFile: "templates/root-configuration/tsconfig.json",
      },
      {
        type: "add",
        path: "eslint.config.js",
        templateFile: "templates/root-configuration/eslint.config.js",
      },
      function updatePackageManager() {
        return updatePackageJson();
      },
    ],
  };
}

module.exports = createRootConfigurationGenerator;
