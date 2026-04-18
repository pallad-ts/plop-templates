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
	'@pallad/eslint-config': "^2",
	"@types/node": "^24",
	"vitest": "^4.1.4"
};

async function updateRootPackageJson() {
	const packageDir = process.cwd();

	let packageJson;

	try {
		packageJson = await PackageJson.load(packageDir);
	} catch (error) {
		if (error && error.code === "ENOENT") {
			throw new Error("package.json not found in target package directory");
		}

		throw error;
	}

	packageJson.update({
		packageManager: PACKAGE_MANAGER,
		devDependencies: {
			...(packageJson.content.devDependencies || {}),
			...ROOT_DEV_DEPENDENCIES,
		},
	});

	await packageJson.save();

	return "Updated package manager and devDependencies in package.json";
}

function createRootConfigurationGenerator() {
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
			function updatePackageManagerAndDependencies() {
				return updateRootPackageJson();
			},
		],
	};
}

module.exports = createRootConfigurationGenerator;
