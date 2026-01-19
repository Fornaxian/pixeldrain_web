import { get_endpoint } from "lib/PixeldrainAPI";
import hsl2rgb from "pure-color/convert/hsl2rgb";
import rgb2hex from "pure-color/convert/rgb2hex";

let host_colours: { [key: string]: string } = {}
export const host_colour = (id: string): string => {
	let host_count: number = Object.keys(host_colours).length
	if (host_colours[id] === undefined) {
		host_colours[id] = ""
	} else {
		return host_colours[id]
	}

	const colour_interval = 360 / (host_count + 1)

	var i = 0
	for (const host of Object.keys(host_colours).sort()) {
		host_colours[host] = rgb2hex(hsl2rgb([i * colour_interval, 100, 70]))
		i++
	}

	return host_colours[id]
}

let host_names: { [key: string]: string } = {}
export const host_label = async (id: string): Promise<string> => {
	if (id === "00000000-0000-0000-0000-000000000000") {
		return "task scheduler"
	}
	if (host_names[id] === undefined) {
		return id
	}

	return host_names[id]
}

export const load_host_names = async () => {
	const req = await fetch(get_endpoint() + "/status")
	const j = await req.json()

	for (const peer of j.peers) {
		host_names[peer.id] = peer.hostname
	}
	console.log(host_names)
}
