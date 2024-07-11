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
		size: {},
	}

	for (const card of cards) {
		if (card.size !== undefined && card.size !== 1) {
			storage.size[card.id] = card.size
		}
	}

	window.localStorage.setItem("dashboard_layout", JSON.stringify(storage))
}

const min_card_size = 0
const def_card_size = 1
const max_card_size = 3

const expand = i => {
	if (cards[i].size === undefined) {
		cards[i].size = def_card_size
	}
	if (cards[i].size < max_card_size) {
		cards[i].size++
	}
	save()
}
const shrink = i => {
	if (cards[i].size === undefined) {
		cards[i].size = def_card_size
	}
	if (cards[i].size > min_card_size) {
		cards[i].size--
	}
	save()
}

onMount(() => {
	cards = [
		{
			id: "upload",
			elem: CardUpload,
			title: "Quick upload",
			link: "/",
		}, {
			id: "filesystem_home",
			elem: CardFsHome,
			title: "Filesystem home",
			link: "/d/me",
			hidden: window.user.subscription.filesystem_access === false,
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
			hidden: window.user.subscription.type !== "prepaid"
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
		const layout = JSON.parse(window.localStorage.getItem("dashboard_layout"))

		for (const card of cards) {
			if (
				layout !== null &&
				layout.size !== undefined &&
				layout.size[card.id] !== undefined
			) {
				card.size = layout.size[card.id]
			} else {
				card.size = 1
			}
		}
	} catch (err) {
		console.warn("Failed to load dashboard settings", err)
		return
	}
})
</script>

<div class="cards">
	{#each cards as card, i (card.id)}
		{#if !card.hidden && card.size > 0}
			<div
				class="card"
				class:size_1={card.size === 1}
				class:size_2={card.size === 2}
				class:size_3={card.size === 3}
			>
				<div class="title_box">
					{#if card.link}
						<Button link_href={card.link} icon="link" flat/>
					{/if}

					<h2>{card.title}</h2>

					<Button click={() => shrink(i)} icon="zoom_out" flat/>
					<span>
						{card.size === undefined ? 1 : card.size}
					</span>
					<Button click={() => expand(i)} icon="zoom_in" flat/>
				</div>
				<div class="card_component">
					<svelte:component this={card.elem} card_size={card.size}/>
				</div>
			</div>
		{/if}
	{/each}
</div>

<div class="cards">
	{#each cards as card, i (card.id)}
		{#if card.size === 0}
			<div class="card size_1">
				<div class="title_box">
					{#if card.link}
						<Button link_href={card.link} icon="link" flat/>
					{/if}

					<h2>{card.title}</h2>

					<Button click={() => expand(i)} icon="visibility" flat/>
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
	max-width: 100%;
	background: var(--body_background);
	border-radius: 8px;
	padding: 8px;
	text-align: initial;
}
.card_component {
	flex: 1 1 auto;
	overflow: auto;
}
.size_1 { width: 400px; }
.size_1 > .card_component { max-height: 400px; }
.size_2 { width: 800px; }
.size_2 > .card_component { max-height: 500px; }
.size_3 { width: 1200px; }
.size_3 > .card_component { max-height: 600px; }

.title_box {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	align-items: center;
	border-bottom: 1px solid var(--separator);
}
.title_box > h2 {
	flex: 1 1 auto;
	margin: 0;
	font-size: 1.5em;
	border-bottom: none;
}
</style>
