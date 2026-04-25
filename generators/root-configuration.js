const fs = require("fs/promises");
const path = require("path");
const PackageJson = require("@npmcli/package-json");

const PACKAGE_MANAGER = "yarn@4.11.0";
const ROOT_DEV_DEPENDENCIES = {
	"@pallad/plop-templates": "^1",
	"@trivago/prettier-plugin-sort-imports": "^6",
	plop: "^4",
	prettier: "^3",
	barrelsby: "^2",
	typescript: "^5",
	eslint: "^9",
	"@pallad/eslint-config": "^2",
	"@types/node": "^24",
	vitest: "^4.1.4",
};

const WORKSPACE_PACKAGE_GLOB = "package/*";

async function ensureRootPackageJsonExists(packageDir) {
	const packageJsonPath = path.join(packageDir, "package.json");

	try {
		await fs.access(packageJsonPath);
		return false;
	} catch (error) {
		if (!error || error.code !== "ENOENT") {
			throw error;
		}
	}

	const currentProjectName = path.basename(packageDir);
	await fs.writeFile(packageJsonPath, `${JSON.stringify({ name: `${currentProjectName}-monorepo` }, null, 2)}\n`);

	return true;
}

function ensureWorkspacePackageGlob(workspaces) {
	if (Array.isArray(workspaces)) {
		return workspaces.includes(WORKSPACE_PACKAGE_GLOB) ? workspaces : [...workspaces, WORKSPACE_PACKAGE_GLOB];
	}

	if (workspaces && typeof workspaces === "object") {
		const packages = Array.isArray(workspaces.packages) ? workspaces.packages : [];

		return {
			...workspaces,
			packages: packages.includes(WORKSPACE_PACKAGE_GLOB) ? packages : [...packages, WORKSPACE_PACKAGE_GLOB],
		};
	}

	return [WORKSPACE_PACKAGE_GLOB];
}

async function updateRootPackageJson() {
	const packageDir = process.cwd();
	const createdPackageJson = await ensureRootPackageJsonExists(packageDir);
	const packageJson = await PackageJson.load(packageDir);
	const workspaces = ensureWorkspacePackageGlob(packageJson.content.workspaces);

	packageJson.update({
		private: true,
		packageManager: PACKAGE_MANAGER,
		devDependencies: {
			...(packageJson.content.devDependencies || {}),
			...ROOT_DEV_DEPENDENCIES,
		},
	});
	packageJson.content.workspaces = workspaces;

	await packageJson.save();

	return `${createdPackageJson ? "Created" : "Updated"} package.json with root workspace configuration`;
}

function createRootConfigurationGenerator() {
	return {
		description: "Copy root-level tooling configuration files",
		prompts: [
			{
				type: "confirm",
				name: "deployNpmPublish",
				message: "Add files related to npm publish?",
				default: false,
			},
		],
		actions: [
			{
				type: "add",
				path: ".editorconfig",
				templateFile: "templates/root-configuration/.editorconfig",
				skipIfExists: true,
			},
			{
				type: "add",
				path: ".prettierrc.js",
				templateFile: "templates/root-configuration/.prettierrc.js",
				skipIfExists: true,
			},
			{
				type: "add",
				path: ".yarnrc.yml",
				templateFile: "templates/root-configuration/.yarnrc.yml",
				skipIfExists: true,
			},
			{
				type: "addMany",
				destination: "config",
				base: "templates/root-configuration/config",
				templateFiles: "templates/root-configuration/config/**",
				skipIfExists: true,
			},
			{
				type: "addMany",
				destination: ".github",
				base: "templates/root-configuration/.github",
				templateFiles: "templates/root-configuration/.github/**",
				skipIfExists: true,
				skip: answers => (answers.deployNpmPublish ? false : "Skipped npm publish workflow"),
			},
			{
				type: "addMany",
				destination: "scripts",
				base: "templates/root-configuration/scripts",
				templateFiles: "templates/root-configuration/scripts/**",
				skipIfExists: true,
				skip: answers => (answers.deployNpmPublish ? false : "Skipped npm publish scripts"),
			},
			function updatePackageManagerAndDependencies() {
				return updateRootPackageJson();
			},
		],
	};
}

module.exports = createRootConfigurationGenerator;
