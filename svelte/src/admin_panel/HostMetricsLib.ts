import { check_response, get_endpoint } from "lib/PixeldrainAPI";
import hsl2rgb from "pure-color/convert/hsl2rgb";
import rgb2hex from "pure-color/convert/rgb2hex";

export type HostMetrics = {
	timestamps: string[]
	// First key is the requested metric, second key is the host ID
	metrics: { [key: string]: { [key: string]: number[] } }
}

export const get_host_metrics = async (start: Date, end: Date, metrics: string[], interval: number): Promise<HostMetrics> => {
	return await check_response(
		await fetch(
			get_endpoint() + "/admin/host_metrics" +
			"?start=" + start.toISOString() +
			"&end=" + end.toISOString() +
			"&metrics=" + metrics.join(",") +
			"&interval=" + interval
		)
	) as HostMetrics
}

let host_colours: { [key: string]: string } = {}
export const host_colour = (id: string): string => {
	let host_count: number = Object.keys(host_colours).length
	if (host_colours[id] === undefined) {
		host_colours[id] = ""
	} else {
		return host_colours[id]
	}

	// Divide the colour wheel by the number of hosts we need to colour. We cap
	// the steps at 18 hue, which allows for 20 colours per rotation
	const colour_interval = Math.max(360 / (host_count + 1), 18)

	var i = 0
	for (const host of Object.keys(host_colours).sort()) {
		const hue = (i * colour_interval) % 360

		// Lightness decreases with 10 for each cycle of the colour wheel
		const lightness = 70 - (Math.floor((i * colour_interval) / 360) * 10)

		host_colours[host] = rgb2hex(hsl2rgb([hue, 100, lightness]))
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
