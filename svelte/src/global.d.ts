import type { User } from "lib/PixeldrainAPI"
import type { FSPath } from "filesystem/FilesystemAPI"

// Values which the server embeds in the page, see res/template
declare global {
	interface Window {
		api_endpoint: string
		server_hostname: string
		user: User

		// Only on file viewer pages
		viewer_data: any
		user_authenticated: boolean

		// Only on filesystem pages
		initial_node: FSPath

		// Opens the navigation menu which the server renders on some pages
		toggleMenu: () => void

		// Captcha libraries which are loaded on demand
		hcaptcha: any
		captcha_script_loaded: () => void
	}
	const grecaptcha: any
}
