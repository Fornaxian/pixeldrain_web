import type { countries } from "country-data-list";
import { get_endpoint } from "lib/PixeldrainAPI";

export type CheckoutState = {
	country: typeof countries.all[0]
	provider: PaymentProvider
	amount: number
	vat: number
	name: string
}

export type PaymentProvider = {
	icon: string
	name: string
	label: string
	crypto?: boolean
	need_name?: boolean
	country_filter?: string[]
};

export const payment_providers: PaymentProvider[] = [
	{
		icon: "paypal",
		name: "paypal",
		label: "PayPal",
	}, {
		icon: "bancontact",
		name: "bancontact",
		label: "Bancontact",
		need_name: true,
		country_filter: ["BE"],
	}, {
		icon: "eps",
		name: "eps",
		label: "EPS",
		need_name: true,
		country_filter: ["AT"],
	}, {
		icon: "ideal",
		name: "ideal",
		label: "iDEAL",
		need_name: true,
		country_filter: ["NL"],
	}, {
		icon: "p24",
		name: "p24",
		label: "Przelewy24",
		need_name: true,
		country_filter: ["PL"],
	}, {
		// 	icon: "trustly",
		// 	name: "trustly",
		// 	label: "Trustly",
		// 	need_name: true,
		// 	country_filter: ["AT", "DE", "DK", "EE", "ES", "FI", "GB", "LT", "LV", "NL", "NO", "SE"]
		// }, {
		icon: "bitcoin",
		name: "btc",
		label: "Bitcoin",
		crypto: true,
	}, {
		icon: "dogecoin",
		name: "doge",
		label: "Dogecoin",
		crypto: true,
	}, {
		icon: "monero",
		name: "xmr",
		label: "Monero",
		crypto: true,
	},
]

export const checkout = async (state: CheckoutState) => {
	if (state.amount < 10) {
		alert("Amount needs to be at least €10")
		return
	} else if (state.provider.need_name && !state.name) {
		alert("Name is required for this provider")
		return
	}

	const form = new FormData()
	form.set("amount", String(state.amount * 1e6))
	form.set("network", state.provider.name)
	form.set("country", state.country.alpha3)

	if (state.provider.need_name) {
		form.set("name", state.name)
	}

	try {
		const resp = await fetch(
			get_endpoint() + "/user/invoice",
			{ method: "POST", body: form },
		)
		if (resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		window.location = (await resp.json()).checkout_url
	} catch (err) {
		alert(err)
	}
}
