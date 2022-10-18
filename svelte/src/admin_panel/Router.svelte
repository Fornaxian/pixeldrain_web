<script>
import AbuseReports from "./AbuseReports.svelte"
import IPBans from "./IPBans.svelte"
import Home from "./Home.svelte"
import BlockFiles from "./BlockFiles.svelte";
import TabMenu from "../util/TabMenu.svelte";
import UserManagement from "./UserManagement.svelte";
import EmailReporters from "./EmailReporters.svelte";

let pages = [
	{
		path: "/admin",
		title: "Status",
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
		path: "/admin/user_management",
		title: "User Management",
		icon: "person",
		component: UserManagement,
	},
]
</script>

<TabMenu pages={pages} title="Admin Panel"/>
