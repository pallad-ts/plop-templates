const fs = require("fs");
const path = require("path");

function createPackageGenerator({ updatePackageJson }) {
  return {
    description: "Create package scaffold",
    prompts: [
      {
        type: "input",
        name: "packageName",
        message: "Package name",
        filter: (value) => value.trim(),
        validate: (value) => {
          if (typeof value !== "string" || value.trim() === "") {
            return "Package name is required";
          }

          const packageName = value.trim();

          if (!/^[a-z0-9][a-z0-9-]*$/.test(packageName)) {
            return "Package name must use lowercase letters, numbers, and hyphens";
          }

          const packageDir = path.resolve(process.cwd(), "package", packageName);

          if (fs.existsSync(packageDir)) {
            return "Target package directory already exists";
          }

          return true;
        },
      },
      {
        type: "input",
        name: "namespace",
        message: "Namespace (optional, e.g. @pallad/some-namespace)",
        default: "",
        filter: (value) => (typeof value === "string" ? value.trim() : ""),
        validate: (value) => {
          if (typeof value !== "string" || value.trim() === "") {
            return true;
          }

          if (!/^@[a-z0-9-]+\/[a-z0-9-]+$/.test(value.trim())) {
            return "Namespace must look like @scope/name";
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "package/{{packageName}}/package.json",
        templateFile: "templates/package/package.json.hbs",
      },
      {
        type: "add",
        path: "package/{{packageName}}/eslint.config.js",
        templateFile: "templates/package/eslint.config.js",
      },
      {
        type: "add",
        path: "package/{{packageName}}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json",
      },
      {
        type: "add",
        path: "package/{{packageName}}/vitest.config.js",
        templateFile: "templates/package/vitest.config.js",
      },
      {
        type: "add",
        path: "package/{{packageName}}/src/index.ts",
        template: "",
      },
      function updatePackageScaffold(answers) {
        return updatePackageJson({
          includeScripts: true,
          packagePath: path.join("package", answers.packageName),
        });
      },
    ],
  };
}

module.exports = createPackageGenerator;
