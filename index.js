const createRootConfigurationGenerator = require("./generators/root-configuration");
const createPackageGenerator = require("./generators/package");

module.exports = function registerGenerators(plop) {
  plop.setGenerator("root-configuration", createRootConfigurationGenerator());
  plop.setGenerator("package", createPackageGenerator());
};
