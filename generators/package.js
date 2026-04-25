const path = require("path");
const PackageJson = require("@npmcli/package-json");

const PACKAGE_MANAGER = "yarn@4.11.0";
const PACKAGE_SCRIPTS = {
	test: "yarn run -TB vitest run --passWithNoTests",
	lint: "yarn run -TB eslint src/**/*.ts",
	"build:clean": "yarn run -TB tsc --build --clean tsconfig.build.json",
	entrysmith: "yarn run generate-barrels && yarn run -TB entrysmith fix",
	prepare: "yarn run entrysmith",
	prepublish: "yarn run compile",
	compile: "yarn run entrysmith && yarn run build:clean && yarn run -TB tsc --build tsconfig.build.json",
	"generate-barrels": "yarn run -TB barrelsby -l replace -L --delete -d ./src",
};

async function updatePackageScaffoldPackageJson(packageDir) {
	const packageJson = await PackageJson.load(packageDir);

	packageJson.update({
		packageManager: PACKAGE_MANAGER,
		scripts: { ...PACKAGE_SCRIPTS },
	});

	await packageJson.save();

	return "Updated package manager and scripts in package.json";
}

function createPackageGenerator() {
	return {
		description: "Create package scaffold",
		prompts: [
			{
				type: "input",
				name: "packageName",
				message: "Package name",
				filter: value => value.trim(),
				validate: value => {
					if (typeof value !== "string" || value.trim() === "") {
						return "Package name is required";
					}

					const packageName = value.trim();

					if (!/^[a-z0-9][a-z0-9-]*$/.test(packageName)) {
						return "Package name must use lowercase letters, numbers, and hyphens";
					}

					return true;
				},
			},
			{
				type: "input",
				name: "namespace",
				message: "Namespace (optional, e.g. @pallad/some-namespace)",
				default: "",
				filter: value => (typeof value === "string" ? value.trim() : ""),
				validate: value => {
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
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/eslint.config.js",
				templateFile: "templates/package/eslint.config.js",
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/tsconfig.json",
				templateFile: "templates/package/tsconfig.json",
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/tsconfig.build.json",
				templateFile: "templates/package/tsconfig.build.json",
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/vitest.config.js",
				templateFile: "templates/package/vitest.config.js",
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/entrysmith.config.js",
				templateFile: "templates/package/entrysmith.config.js",
				skipIfExists: true,
			},
			{
				type: "add",
				path: "package/{{packageName}}/src/index.ts",
				template: "",
				skipIfExists: true,
			},
			function updatePackageScaffold(answers) {
				const packageDir = path.resolve(process.cwd(), "package", answers.packageName);
				return updatePackageScaffoldPackageJson(packageDir);
			},
		],
	};
}

module.exports = createPackageGenerator;
