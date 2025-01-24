/** @type {import("prettier").Config} */
module.exports = {
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	printWidth: 120,
	quoteProps: 'consistent',
	bracketSpacing: true,
	bracketSameLine: true,
	arrowParens: 'avoid',
	endOfLine: 'lf',
	overrides: [
		{
			files: [
				// Web package
				'packages/web/app/**/*.{js,ts,jsx,tsx,vue,svelte,json,yaml,yml,md,php}',
				'packages/web/resources/**/*.{js,ts,jsx,tsx,vue,svelte,json,yaml,yml,md,php}',
				'packages/web/routes/**/*.{js,ts,jsx,tsx,vue,svelte,json,yaml,yml,md,php}',
				'packages/web/config/**/*.{js,ts,jsx,tsx,vue,svelte,json,yaml,yml,md,php}',
				// Queue package
				'packages/queue/src/**/*.{js,ts,jsx,tsx,json,yaml,yml,md}',
				// API package
				'packages/api/src/**/*.{js,ts,jsx,tsx,json,yaml,yml,md}',
			],
		},
	],
};
