/** @type {import("prettier").Config} */
module.exports = {
	semi: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'es5',
	printWidth: 250,
	// Only process these specific paths and file types
	overrides: [
		{
			files: [
				// Only process our source files, not vendor
				'packages/web/app/**/*.{js,ts,jsx,tsx,vue,json,yaml,yml,md}',
				'packages/web/resources/**/*.{js,ts,jsx,tsx,vue,json,yaml,yml,md}',
				'packages/web/routes/**/*.{js,ts,jsx,tsx,vue,json,yaml,yml,md}',
				'packages/web/config/**/*.{js,ts,jsx,tsx,vue,json,yaml,yml,md}',
				// Add any other source directories you want to process
			],
		},
	],
}
