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

export type HostMetrics = {
	timestamps: string[]
	host_amounts: { [key: string]: number[] }
}

export const get_host_metrics = async (start: Date, end: Date, metric: string, interval: number): Promise<HostMetrics> => {
	return await check_response(
		await fetch(
			get_endpoint() + "/admin/host_metrics" +
			"?start=" + start.toISOString() +
			"&end=" + end.toISOString() +
			"&metric=" + metric +
			"&interval=" + interval
		)
	) as HostMetrics
};

export type UserReport = {
	id: string
	type: string
	status: string
	first_report_time: string
	reports: {
		file_id: string
		ip_address: string
		time: string
		status: string
		type: string
		email: string
		description: string
	}[]
	file: {
		id: string
		name: string
		size: number
		views: number
		bandwidth_used: number
		bandwidth_used_paid: number
		downloads: number
		date_upload: string
		date_last_view: string
		mime_type: string
		thumbnail_href: string
		hash_sha256: string
		delete_after_date: string
		delete_after_downloads: string
		availability: string
		availability_message: string
		abuse_type: string
		abuse_reporter_name: string
		can_edit: boolean
		can_download: boolean
		show_ads: boolean
		allow_video_player: boolean
		download_speed_limit: number
	}
}

export const get_abuse_reports = async (start: Date, end: Date, status: string): Promise<UserReport[]> => {
	return await check_response(
		await fetch(
			get_endpoint() + "/admin/abuse_report" +
			"?start=" + start.toISOString() +
			"&end=" + end.toISOString() +
			"&status=" + status
		)
	) as UserReport[]
};
