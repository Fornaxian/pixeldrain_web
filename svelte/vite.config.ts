import { defineConfig } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';

const production = process.env.NODE_ENV === "production"

const builddir = "../res/static/svelte"

export default defineConfig({
	mode: production ? "production" : "development",
	// Chunks are loaded relative to the script which imports them
	base: "./",
	build: {
		outDir: builddir,
		emptyOutDir: true,
		minify: production,
		sourcemap: true,
		// Svelte 5 itself needs browsers from 2020, this is the oldest target
		// which still has native modules
		target: ["es2020", "chrome87", "edge88", "firefox78", "safari14"],
		rollupOptions: {
			input: Object.fromEntries([
				"file_viewer",
				"filesystem",
				"user_home",
				"admin_panel",
				"home_page",
				"text_upload",
				"speedtest",
				"login",
			].map(name => [name, `src/${name}.js`])),
			// The entrypoints keep their names so the HTML templates can find
			// them, the chunks they share get a hash in their names
			output: { entryFileNames: "[name].js" },
		},
	},
	plugins: [
		// Svelte can't strip TypeScript enums by itself
		svelte({ preprocess: vitePreprocess({ script: true }), emitCss: false }),

		// Resolves imports relative to the src directory, like "lib/PixeldrainAPI"
		resolve({
			browser: true,
			exportConditions: ['svelte'],
			modulePaths: [process.cwd() + "/src", process.cwd() + "/node_modules"],
			extensions: [".svelte", ".mjs", ".js", ".json", ".mts", ".ts"],
		}),

		// Refresh the browser when the build changes
		!production && livereload({
			watch: builddir,
			port: 5000,
		}),
	],
});
