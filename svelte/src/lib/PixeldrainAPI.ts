// Response types
// ==============

export type GenericResponse = {
	value: string,
	message: string,
	errors?: GenericResponse[],
	extra?: { [index: string]: Object },
}

export type User = {
	username: string,
	email: string,
	otp_enabled: boolean,
	subscription: Subscription,
	storage_space_used: number,
	filesystem_storage_used: number,
	is_admin: boolean,
	balance_micro_eur: number,
	hotlinking_enabled: boolean,
	monthly_transfer_cap: number,
	monthly_transfer_used: number,
	file_viewer_branding: Map<string, string>,
	file_embed_domains: string,
	skip_file_viewer: boolean,
	affiliate_user_name: string,
}

export type Subscription = {
	id: string,
	name: string,
	type: string,
	file_size_limit: number,
	file_expiry_days: number,
	storage_space: number,
	price_per_tb_storage: number,
	price_per_tb_bandwidth: number,
	monthly_transfer_cap: number,
	file_viewer_branding: boolean,
	filesystem_access: boolean,
	filesystem_storage_limit: number,
}

// Utility funcs
// =============

export const get_endpoint = () => {
	if ((window as any).api_endpoint !== undefined) {
		return (window as any).api_endpoint as string
	}
	console.warn("api_endpoint property is not defined on window")
	return "/api"
}

export const get_hostname = () => {
	if ((window as any).server_hostname !== undefined) {
		return (window as any).server_hostname as string
	}
	console.warn("server_hostname property is not defined on window")
	return "undefined"
}

export const check_response = async (resp: Response) => {
	let text = await resp.text()
	if (resp.status >= 400) {
		let error: any
		try {
			error = JSON.parse(text) as GenericResponse
		} catch (err) {
			error = text
		}
		throw error
	}
	return JSON.parse(text)
}

export const dict_to_form = (dict: Object) => {
	let form = new FormData()
	for (let key of Object.keys(dict)) {
		if (dict[key] === undefined) {
			continue
		} else if (dict[key] instanceof Date) {
			form.append(key, new Date(dict[key]).toISOString())
		} else if (typeof dict[key] === "object") {
			form.append(key, JSON.stringify(dict[key]))
		} else {
			form.append(key, dict[key])
		}
	}
	return form
}

// API methods
// ===========

export const get_user = async () => {
	if ((window as any).user !== undefined) {
		return (window as any).user as User
	}

	console.warn("user property is not defined on window")

	return await check_response(await fetch(get_endpoint() + "/user")) as User
}

export const put_user = async (data: Object) => {
	check_response(await fetch(
		get_endpoint() + "/user",
		{ method: "PUT", body: dict_to_form(data) },
	))

	// Update the window.user variable
	for (let key of Object.keys(data)) {
		((window as any).user as User)[key] = data[key]
	}
}


export type VATRate = {
	name: string,
	vat: number,
	alpha2: string,
	alpha3: string,
}
export const get_misc_vat_rate = async (country_code: string) => {
	return await check_response(await fetch(get_endpoint() + "/misc/vat_rate/" + country_code)) as VATRate
}
