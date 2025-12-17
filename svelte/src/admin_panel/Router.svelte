<script>
import AbuseReports from "./AbuseReports.svelte"
import IPBans from "./IPBans.svelte"
import Home from "./Home.svelte"
import BlockFiles from "./BlockFiles.svelte";
import TabMenu from "util/TabMenu.svelte";
import UserManagement from "./UserManagement.svelte";
import EmailReporters from "./EmailReporters.svelte";
import MollieSettlements from "./MollieSettlements.svelte";
import PayPalTaxes from "./PayPalTaxes.svelte";
import UserBans from "./user_bans/UserBans.svelte";
import InvoiceVat from "./InvoiceVAT.svelte";

let pages = [
	{
		path: "/admin",
		title: "Admin panel",
		icon: "home",
		component: Home,
	}, {
		path: "/admin/block_files",
		title: "Block Files",
		icon: "block",
		component: BlockFiles,
	}, {
		path: "/admin/abuse_reports",
		title: "User Reports",
		icon: "flag",
		component: AbuseReports,
	}, {
		path: "/admin/email_reporters",
		title: "E-mail Reporters",
		icon: "email",
		component: EmailReporters,
	}, {
		path: "/admin/ip_bans",
		title: "IP Bans",
		icon: "remove_circle",
		component: IPBans,
	}, {
		path: "/admin/user_bans",
		title: "User Bans",
		icon: "person_remove",
		component: UserBans,
	}, {
		path: "/admin/user_management",
		title: "User Management",
		icon: "person",
		component: UserManagement,
	}, {
		path: "/admin/mollie_settlements",
		title: "Prepaid accounting",
		icon: "paid",
		component: InvoiceVat,
		subpages: [
			{
				path: "/admin/invoices",
				title: "Invoices",
				icon: "receipt",
				component: InvoiceVat,
			}, {
				path: "/admin/mollie_settlements",
				title: "Mollie Settlements",
				icon: "paid",
				component: MollieSettlements,
			}, {
				path: "/admin/paypal_taxes",
				title: "Paypal Taxes",
				icon: "paypal",
				component: PayPalTaxes,
			},
		],
	},
]
</script>

<TabMenu pages={pages} title="Admin Panel"/>
