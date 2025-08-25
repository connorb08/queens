import { build } from "esbuild";

build({
	entryPoints: ["src/index.ts"],
	bundle: true,
	outfile: "dist/index.mjs",
	platform: "node",
	target: ["node22"],
	minify: true,
	format: "esm",
	external: ["@sparticuz/chromium"],
	banner: {
		js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
	},
});
