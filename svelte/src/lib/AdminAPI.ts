import { countries } from "country-data-list"
import { check_response, get_endpoint } from "./PixeldrainAPI"

export const country_name = (country: string) => {
	if (country !== "" && countries[country] !== undefined) {
		return countries[country].emoji + " " + country + " (" + countries[country].name + ")"
	}
	return "🌐 Other"
}

export type Invoice = {
	id: string
	time: string
	amount: number
	vat: number
	processing_fee: number
	country: string
	payment_gateway: string
	payment_method: string
	status: string
}

export const get_admin_invoices = async (year: number, month: number) => {
	return await check_response(
		await fetch(
			get_endpoint() + "/admin/invoices/" + year + "-" + ("00" + (month)).slice(-2)
		)
	) as Invoice[]
};
