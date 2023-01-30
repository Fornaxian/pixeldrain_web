import { readable } from 'svelte/store';

let limits = {
	download_limit: 0,
	download_limit_used: 0,
	transfer_limit: 0,
	transfer_limit_used: 0,
	ipv6_bonus: 0,
	loaded: false,
}

export const download_limits = readable(
	limits,
	function start(set) {
		set_func = set;
		loop();

		return function stop() {
			clearTimeout(timeout_ref);
		};
	}
);

let set_func;
let timeout_ref = 0;
let timeout_ms = 10000;

const loop = async () => {
	let new_limits;
	try {
		let resp = await fetch(window.api_endpoint + "/misc/rate_limits")
		if (resp.status >= 400) {
			throw new Error(await resp.text())
		}
		new_limits = await resp.json()
		new_limits.loaded = true
	} catch (err) {
		console.error("Failed to get rate limits: " + err)
		timeout_ref = setTimeout(loop, 30000)
		return
	}

	// If the usage has not changed we increase the timeout with one second. If
	// it did change we halve the timeout
	if (
		new_limits.transfer_limit_used === limits.transfer_limit_used &&
		new_limits.transfer_limit === limits.transfer_limit
	) {
		timeout_ms += 2000
		if (timeout_ms > 60000) {
			timeout_ms = 60000
		}
	} else {
		timeout_ms /= 2
		if (timeout_ms < 5000) {
			timeout_ms = 5000
		}

		limits = new_limits
		set_func(new_limits)
	}

	console.debug("Sleep", timeout_ms / 1000, "seconds")
	timeout_ref = setTimeout(loop, timeout_ms)
}
