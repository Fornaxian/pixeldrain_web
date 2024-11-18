<script>
import AccountSettings from "./AccountSettings.svelte";
import APIKeys from "./APIKeys.svelte";
import Transactions from "./Transactions.svelte";
import Subscription from "./Subscription.svelte";
import ConnectApp from "./ConnectApp.svelte";
import ActivityLog from "./ActivityLog.svelte";
import DepositCredit from "./DepositCredit.svelte";
import TabMenu from "../util/TabMenu.svelte";
import BandwidthSharing from "./BandwidthSharing.svelte";
import EmbeddingControls from "./EmbeddingControls.svelte";
import PageBranding from "./PageBranding.svelte";
import Dashboard from "./dashboard/Dashboard.svelte";

let pages = [
	{
		path: "/user",
		title: "Dashboard",
		icon: "dashboard",
		component: Dashboard,
		hide_background: true,
	}, {
		path: "/user/settings",
		title: "Settings",
		icon: "settings",
		component: AccountSettings,
	}, {
		path: "/user/subscription",
		title: "Subscription",
		icon: "shopping_cart",
		subpages: [
			{
				path: "/user/subscription",
				title: "Manage subscription",
				icon: "shopping_cart",
				component: Subscription,
			}, {
				path: "/user/prepaid/deposit",
				title: "Prepaid",
				icon: "account_balance_wallet",
				component: DepositCredit,
			}, {
				path: "/user/prepaid/transactions",
				title: "Transactions",
				icon: "receipt",
				component: Transactions,
			},
		],
	}, {
		path: "/user/sharing",
		title: "Sharing",
		icon: "share",
		subpages: [
			{
				path: "/user/sharing/bandwidth",
				title: "Bandwidth Sharing",
				icon: "share",
				component: BandwidthSharing,
			}, {
				path: "/user/sharing/branding",
				title: "Page Branding",
				icon: "palette",
				component: PageBranding,
			}, {
				path: "/user/sharing/embedding",
				title: "Embedding Controls",
				icon: "code",
				component: EmbeddingControls,
			},
		],
	}, {
		path: "/user/connect_app",
		title: "Apps",
		icon: "app_registration",
		component: ConnectApp,
	}, {
		path: "/user/api_keys",
		title: "API Keys",
		icon: "vpn_key",
		component: APIKeys,
	}, {
		path: "/user/activity",
		title: "Activity Log",
		icon: "list",
		component: ActivityLog,
	},
]
</script>

<TabMenu pages={pages} title="Welcome, {window.user.username}!"/>
