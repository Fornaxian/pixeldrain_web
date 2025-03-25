import svelte from 'rollup-plugin-svelte';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { sveltePreprocess } from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

const builddir = "../res/static/svelte"
export default [
	"file_viewer",
	"filesystem",
	"user_home",
	"user_file_manager",
	"admin_panel",
	"home_page",
	"text_upload",
	"speedtest",
	"upload_history",
	"login",
].map((name, index) => ({
	input: `src/${name}.js`,
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: `${builddir}/${name}.js`,
	},
	plugins: [
		sveltePreprocess(),

		svelte({
			preprocess: sveltePreprocess(),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production,
			},
			emitCss: false,
		}),

		babel({
			extensions: [".js", ".ts", ".svelte"],
			babelHelpers: "bundled",
		}),

		// If you have external dependencies installed from npm, you'll most
		// likely need these plugins. In some cases you'll need additional
		// configuration - consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			exportConditions: ['svelte'],
			extensions: ['.svelte'],
		}),
		commonjs(),
		nodeResolve(),
		typescript({
			compilerOptions: { lib: ["es2015", "dom"] },
			verbatimModuleSyntax: true,
		}),

		// Watch the `public` directory and refresh the browser on changes when
		// not in production
		!production && livereload({
			watch: `${builddir}/${name}.*`,
			port: 5000 + index,
		}),

		// If we're building for production (npm run build instead of npm run
		// dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: false
	},
}));
