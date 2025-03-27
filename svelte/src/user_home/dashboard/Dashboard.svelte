<script>
import Button from "layout/Button.svelte"
import { onMount } from "svelte";
import CardAccount from "./CardAccount.svelte";
import CardStatistics from "./CardStatistics.svelte";
import CardSubscription from "./CardSubscription.svelte";
import CardUsage from "./CardUsage.svelte";
import CardActivity from "./CardActivity.svelte";
import CardUpload from "./CardUpload.svelte";
import CardPrepaidTransactions from "./CardPrepaidTransactions.svelte";
import CardFsHome from "./CardFSHome.svelte";
import AddressReputation from "home_page/AddressReputation.svelte";
import { flip } from "svelte/animate";

let cards = []

const save = () => {
	let storage = {
		size: {},
		order: [],
	}

	for (const card of cards) {
		if (card.size !== undefined && card.size !== 1) {
			storage.size[card.id] = card.size
		}
		storage.order.push(card.id)
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

const swap_card = (idx1, idx2) => {
	const card1 = cards[idx1]
	cards[idx1] = cards[idx2]
	cards[idx2] = card1
	save()
}

onMount(() => {
	cards = []
	cards.push({
		id: "upload",
		elem: CardUpload,
		title: "Quick upload",
		link: "/home",
	})
	if (window.user.subscription.filesystem_access === true) {
		cards.push({
			id: "filesystem_home",
			elem: CardFsHome,
			title: "Filesystem home",
			link: "/d/me",
		})
	}
	cards.push({
		id: "account",
		elem: CardAccount,
		title: "Account",
		link: "/user/settings",
	})
	cards.push({
		id: "subscription",
		elem: CardSubscription,
		title: "Subscription",
		link: "/user/subscription",
	})
	if (window.user.subscription.type === "prepaid") {
		cards.push({
			id: "prepaid_transactions",
			elem: CardPrepaidTransactions,
			title: "Prepaid transactions",
			link: "/user/prepaid/transactions",
		})
	}
	cards.push({
		id: "usage",
		elem: CardUsage,
		title: "Usage",
	})
	cards.push({
		id: "statistics",
		elem: CardStatistics,
		title: "Statistics",
	})
	cards.push({
		id: "activity",
		elem: CardActivity,
		title: "Activity",
		link: "/user/activity",
	})

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

		if (layout.order !== undefined && layout.order instanceof Array) {
			cards.sort((card1, card2) => {
				return layout.order.indexOf(card1.id) - layout.order.indexOf(card2.id)
			})
		}
	} catch (err) {
		console.warn("Failed to load dashboard settings", err)
		return
	}
})
</script>

<div class="separator"></div>

<AddressReputation/>

<div class="cards">
	{#each cards as card, i (card.id)}
		<div
			animate:flip={{duration: 250}}
			class="card"
			class:size_1={card.size === 1}
			class:size_2={card.size === 2}
			class:size_3={card.size === 3}
		>
			<div class="title_box">
				{#if card.link}
					<h2>
						<a href={card.link}>
							{card.title}
						</a>
					</h2>
				{:else}
					<h2>{card.title}</h2>
				{/if}

				{#if i > 0}
					<Button click={() => swap_card(i, i-1)} icon="chevron_left" flat/>
				{/if}
				{#if i < cards.length-1}
					<Button click={() => swap_card(i, i+1)} icon="chevron_right" flat/>
				{/if}

				<Button click={() => shrink(i)} icon="zoom_out" flat/>
				<span>
					{card.size === undefined ? 1 : card.size}
				</span>
				<Button click={() => expand(i)} icon="zoom_in" flat/>
			</div>

			{#if !card.hidden && card.size > 0}
				<div class="card_component">
					<svelte:component this={card.elem} card_size={card.size}/>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
.separator {
	border-top: 1px solid var(--separator);
	margin: 0 8px;
}
.cards {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	padding: 8px 0;
	margin: 0 8px;
}
.card {
	flex: 1 0 auto;
	display: flex;
	flex-direction: column;
	max-width: 100%;
	background: var(--body_background);
	border-radius: 8px;
	padding: 2px;
	text-align: initial;
}
.card_component {
	flex: 1 1 auto;
	overflow: auto;
	padding: 6px;
}
.size_1 { width: 400px; }
.size_1 > .card_component { max-height: 400px; }
.size_2 { width: 800px; }
.size_2 > .card_component { max-height: 600px; }
.size_3 { width: 1200px; }
.size_3 > .card_component { max-height: 800px; }

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
	padding-left: 0.2em;
}
.title_box > h2 > a {
	border-bottom: none;
	text-decoration: none;
}
</style>
