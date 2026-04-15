const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PACKAGE_MANAGER = "yarn@4.11.0";
const PACKAGE_SCRIPTS = {
  test: "yarn run -TB vitest run --passWithNoTests",
  lint: "yarn run -TB eslint src/**/*.ts",
  "generate-barrels": "yarn run -TB barrelsby -l replace -L --delete -d ./src",
};

function resolvePackageDir(packagePath = ".") {
  if (typeof packagePath !== "string" || packagePath.trim() === "") {
    throw new Error("Package path is required");
  }

  return path.resolve(process.cwd(), packagePath.trim());
}

function formatPackageJson(packageJsonPath, packageDir) {
  try {
    execFileSync("yarn", ["run", "-TB", "prettier", "--write", packageJsonPath], {
      cwd: packageDir,
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (error) {
    const output = `${error && error.stdout ? error.stdout : ""}\n${
      error && error.stderr ? error.stderr : ""
    }`;
    const prettierMissing =
      /command not found.*prettier/i.test(output) ||
      /prettier: command not found/i.test(output) ||
      /couldn't find a script named\s+"prettier"/i.test(output) ||
      /not found.*prettier/i.test(output) ||
      /prettier.*not found/i.test(output);

    if (error && error.code !== "ENOENT" && !prettierMissing) {
      throw error;
    }

    console.info(
      "[plop-templates] Skipped package.json formatting: prettier is not available. Add prettier to project dependencies to enable this step.",
    );
  }
}

function updatePackageJson({ includeScripts = false, packagePath = "." } = {}) {
  const packageDir = resolvePackageDir(packagePath);
  const packageJsonPath = path.join(packageDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("package.json not found in target package directory");
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.packageManager = PACKAGE_MANAGER;

  if (includeScripts) {
    packageJson.scripts = { ...PACKAGE_SCRIPTS };
  }

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  formatPackageJson(packageJsonPath, packageDir);

  if (includeScripts) {
    return "Updated package manager and scripts in package.json";
  }

  return "Updated package manager in package.json";
}

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
      function updatePackageManager() {
        return updatePackageJson();
      },
    ],
  });

  plop.setGenerator("package-configuration", {
    description: "Copy package-level tooling configuration files",
    prompts: [
      {
        type: "input",
        name: "packagePath",
        message: "Path to package directory",
        validate: (value) => {
          try {
            const packageDir = resolvePackageDir(value);
            const packageJsonPath = path.join(packageDir, "package.json");

            if (!fs.existsSync(packageDir) || !fs.statSync(packageDir).isDirectory()) {
              return "Package directory does not exist";
            }

            if (!fs.existsSync(packageJsonPath)) {
              return "package.json not found in package directory";
            }

            return true;
          } catch (error) {
            return error.message;
          }
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{packagePath}}/eslint.config.js",
        templateFile: "templates/package-configuration/eslint.config.js",
      },
      {
        type: "add",
        path: "{{packagePath}}/tsconfig.json",
        templateFile: "templates/package-configuration/tsconfig.json",
      },
      {
        type: "add",
        path: "{{packagePath}}/vitest.config.js",
        templateFile: "templates/package-configuration/vitest.config.js",
      },
      function updatePackageConfiguration(answers) {
        return updatePackageJson({
          includeScripts: true,
          packagePath: answers.packagePath,
        });
      },
    ],
  });
};
