<script>
import Button from "../../layout/Button.svelte"
import { onMount } from "svelte";
import CardAccount from "./CardAccount.svelte";
import CardStatistics from "./CardStatistics.svelte";
import CardSubscription from "./CardSubscription.svelte";
import CardUsage from "./CardUsage.svelte";
import CardActivity from "./CardActivity.svelte";
import CardUpload from "./CardUpload.svelte";
import CardPrepaidTransactions from "./CardPrepaidTransactions.svelte";
import CardFsHome from "./CardFSHome.svelte";

let cards = []

const save = () => {
	let storage = {
		expanded: [],
		hidden: [],
	}

	for (const card of cards) {
		if (card.expanded === true) {
			storage.expanded.push(card.id)
		}
	}
	for (const card of cards) {
		if (card.hidden === true) {
			storage.hidden.push(card.id)
		}
	}

	window.localStorage.setItem("dashboard_layout", JSON.stringify(storage))
}

onMount(() => {
	cards = [
		{
			id: "upload",
			elem: CardUpload,
			title: "Quick upload",
		}, {
			id: "filesystem_home",
			elem: CardFsHome,
			title: "Filesystem home",
			link: "/d/me",
			hidden_default: window.user.subscription.filesystem_access === false,
		}, {
			id: "account",
			elem: CardAccount,
			title: "Account",
			link: "/user/settings",
		}, {
			id: "subscription",
			elem: CardSubscription,
			title: "Subscription",
			link: "/user/subscription",
		}, {
			id: "prepaid_transactions",
			elem: CardPrepaidTransactions,
			title: "Prepaid transactions",
			link: "/user/prepaid/transactions",
			hidden_default: window.user.subscription.type !== "prepaid"
		}, {
			id: "usage",
			elem: CardUsage,
			title: "Usage",
		}, {
			id: "statistics",
			elem: CardStatistics,
			title: "Statistics",
		}, {
			id: "activiy",
			elem: CardActivity,
			title: "Activity",
			link: "/user/activity",
		},
	]

	// Apply the view settings from localstorage
	try {
		const storage = JSON.parse(window.localStorage.getItem("dashboard_layout"))
		if (storage === null) {
			return
		}

		for (const card of cards) {
			if (storage.expanded && storage.expanded.includes(card.id)) {
				card.expanded = true
			}
			if (storage.hidden && storage.hidden.includes(card.id)) {
				card.hidden = true
			}
		}
	} catch (err) {
		console.warn("Failed to load dashboard settings", err)
		return
	}
})
</script>

<div class="cards">
	{#each cards as card (card.id)}{#if !card.hidden && !card.hidden_default}
		<div class="card" class:card_wide={card.expanded}>
			<div class="title_box">
				<h2>{card.title}</h2>

				{#if card.link}
					<Button link_href={card.link} icon="link" flat/>
				{/if}

				<Button
					click={() => {card.expanded = !card.expanded; save()}}
					icon={card.expanded ? "fullscreen_exit" : "fullscreen"}
					flat/>
				<Button
					click={() => {card.hidden = !card.hidden; save()}}
					icon="visibility_off"
					flat/>
			</div>
			<div class="card_component">
				<svelte:component this={card.elem} expanded={card.expanded}/>
			</div>
		</div>
	{/if}{/each}
</div>

<div class="cards">
	{#each cards as card (card.id)}
		{#if card.hidden}
			<div class="card">
				<div class="title_box">
					<h2>{card.title}</h2>

					{#if card.link}
						<Button link_href={card.link} icon="link" flat/>
					{/if}

					<Button click={() => {card.hidden = !card.hidden; save()}} icon="visibility" flat/>
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
.cards {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	padding: 8px 0;
	margin: 0 8px;
	border-top: 1px solid var(--separator);
}
.card {
	flex: 1 0 auto;
	display: flex;
	flex-direction: column;
	width: 26em;
	max-width: 100%;
	background: var(--body_background);
	border-radius: 8px;
	padding: 8px;
	text-align: initial;
	max-height: 500px;
}
.card_component {
	flex: 1 1 auto;
	overflow: auto;
}
.card_wide {
	flex-basis: auto;
	width: 100%;
	max-height: none;
}

.title_box {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	border-bottom: 1px solid var(--separator);
}
.title_box > h2 {
	flex: 1 1 auto;
	margin: 0;
	font-size: 1.5em;
	border-bottom: none;
}
</style>
