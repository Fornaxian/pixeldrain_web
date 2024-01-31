export let mollie_proxy_call = endpoint => {
	const proxy_url = window.api_endpoint + "/admin/mollie_request?endpoint="
	const url = encodeURIComponent("https://api.mollie.com/v2/" + endpoint)
	return fetch(proxy_url + url);
}
