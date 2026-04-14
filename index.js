module.exports = function registerGenerators(plop) {
  plop.setGenerator("root-configuration", {
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
    ],
  });

  plop.setGenerator("package-configuration", {
    description: "Copy package-level tooling configuration files",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "eslint.config.js",
        templateFile: "templates/package-configuration/eslint.config.js",
      },
      {
        type: "add",
        path: "tsconfig.json",
        templateFile: "templates/package-configuration/tsconfig.json",
      },
      {
        type: "add",
        path: "vitest.config.js",
        templateFile: "templates/package-configuration/vitest.config.js",
      },
    ],
  });
};
