<script>
import Home from "./Home.svelte";
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

let pages = [
	{
		path: "/user/home",
		title: "My Home",
		icon: "home",
		component: Home,
	}, {
		path: "/user/settings",
		title: "Settings",
		icon: "settings",
		component: AccountSettings,
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
	}, {
		path: "/user/prepaid",
		title: "Prepaid",
		icon: "receipt_long",
		hidden: window.user.subscription.type === "patreon",
		subpages: [
			{
				path: "/user/prepaid/deposit",
				title: "Deposit credit",
				icon: "account_balance_wallet",
				component: DepositCredit,
			}, {
				path: "/user/prepaid/subscriptions",
				title: "Subscriptions",
				icon: "shopping_cart",
				component: Subscription,
			}, {
				path: "/user/prepaid/transactions",
				title: "Transactions",
				icon: "receipt",
				component: Transactions,
			},
		],
	},
]
</script>

<TabMenu pages={pages} title="Welcome home, {window.user.username}!"/>
