<script>
import PixeldrainLogo from "../util/PixeldrainLogo.svelte";
import Button from "../layout/Button.svelte";
import Euro from "../util/Euro.svelte";
import { formatDataVolume } from "../util/Formatting.svelte";

let button
let dialog

const open = () => {
	dialog.showModal()

	let rect = button.getBoundingClientRect()
	dialog.style.top = Math.round(rect.bottom) + "px"
	dialog.style.left = Math.round(rect.left) + "px"
}

// Close the dialog when the user clicks the background
const click = e => {
	if (e.target === dialog) {
		dialog.close()
	}
}
</script>

<div class="wrapper">
	<button bind:this={button} on:click={open} href="/user" class="button round" title="Menu">
		<PixeldrainLogo style="height: 1.8em; width: 1.8em; margin: 0;"></PixeldrainLogo>
		<span class="button_username">
			{window.user.username === "" ? "Pixeldrain" : window.user.username}
		</span>
	</button>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click={click}>
	<div class="menu">
		{#if window.user.username !== ""}
			<div class="menu_username">{window.user.username}</div>
			<div class="stats_table">
				<div>Subscription</div>
				<div>{window.user.subscription.name}</div>

				{#if window.user.subscription.type === "prepaid"}
					<div>Credit</div>
					<div><Euro amount={window.user.balance_micro_eur}/></div>
				{/if}

				<div>Storage used</div>
				<div>{formatDataVolume(window.user.filesystem_storage_used, 3)}</div>
				<div>Transfer used</div>
				<div>{formatDataVolume(window.user.monthly_transfer_used, 3)}</div>
			</div>
			<Button link_href="/d/me" icon="folder" label="My Filesystem"/>
			<Button link_href="/filesystem" icon="description" label="Filesystem Guide"/>
			<Button link_href="/user" icon="person" label="Profile"/>
			<Button link_href="/user/settings" icon="settings" label="Account Settings"/>
			<Button link_href="/user/subscription" icon="shopping_cart" label="Subscription"/>
			<Button link_href="/user/prepaid/transactions" icon="receipt" label="Transactions"/>

			{#if window.user.is_admin}
				<Button link_href="/admin" icon="admin_panel_settings" label="Admin Panel"/>
			{/if}
		{:else}
			<Button link_href="/" icon="home" label="Home"/>
			<Button link_href="/#pro" icon="star" label="Get Premium"/>
			<Button link_href="/login" icon="person" label="Log in"/>
			<Button link_href="/register" icon="person" label="Register"/>
		{/if}
	</div>
</dialog>

<style>
.wrapper {
	flex-grow: 0;
	flex-shrink: 0;
	display: inline;
	align-self: center;
}

.button {
	flex: 0 0 content;
	background: none;
	margin: 0;
	color: var(--body_text_color);
	box-shadow: none;
}

dialog {
	background-color: var(--card_color);
	color: var(--body_text_color);
	border-radius: 8px;
	border: none;
	padding: 4px;
	margin: 0;
	box-shadow: 2px 2px 10px var(--shadow_color);
}
.menu {
	display: flex;
	flex-direction: column;
}
.menu_username {
	text-align: center;
	border-bottom: 2px solid var(--separator);
	font-size: 1.1em;
}
.stats_table {
	display: grid;
	grid-template-columns: auto auto;
	gap: 0.2em 1em;
	margin: 3px;
}

/* Hide username on small screen */
@media(max-width: 800px) {
	.button_username {
		display: none;
	}
}
</style>
