<script lang="ts" context="module">
export type Tab = {
	path: string,
	title: string,
	icon: string,
	component?: ComponentType,
	hidden?: boolean,
	hide_background?: boolean,
	hide_frame?: boolean,
	subpages?: Tab[],
}
</script>
<script lang="ts">
import { onMount, type ComponentType } from "svelte";
import Footer from "layout/Footer.svelte";

export let title = ""
export let pages: Tab[] = []

let navigate = (path: string, title: string) => {
	window.document.title = title+" ~ pixeldrain"
	window.history.pushState({}, window.document.title, path)

	get_page()
}

let get_page = () => {
	current_page = null
	current_subpage = null

	pages.forEach(page => {
		if (window.location.pathname.endsWith(page.path)) {
			current_page = page
		}

		if (page.subpages) {
			page.subpages.forEach(subpage => {
				if (window.location.pathname.endsWith(subpage.path)) {
					current_page = page
					current_subpage = subpage
				}
			})
		}
	})

	// If no page is active, default to home
	if (!current_page) {
		current_page = pages[0]
	}

	if (!current_subpage && current_page.subpages) {
		current_subpage = current_page.subpages[0]
	}

	console.log("Page", current_page)
	console.log("Subpage", current_subpage)

	pages = pages
}

let current_page: Tab = null
let current_subpage: Tab = null

onMount(() => get_page())
</script>

<svelte:window on:popstate={get_page} />

{#if current_page !== null && current_page.hide_frame !== true}
	<header>
		<h1>{title}</h1>

		<div class="tab_bar">
			{#each pages as page}
				{#if !page.hidden}
					<a class="button"
						href="{page.path}"
						class:button_highlight={current_page && page.path === current_page.path}
						on:click|preventDefault={() => {navigate(page.path, page.title)}}>
						<i class="icon">{page.icon}</i>
						<span>{page.title}</span>
					</a>
				{/if}
			{/each}
		</div>
	</header>
{/if}

{#if current_page !== null}
	<div id="page_content" class:page_content={current_page.hide_background !== true}>
		{#if current_page.subpages}
			<div class="tab_bar submenu">
				{#each current_page.subpages as page}
					{#if !page.hidden}
						<a class="button"
							href="{page.path}"
							class:button_highlight={current_subpage && page.path === current_subpage.path}
							on:click|preventDefault={() => {navigate(page.path, page.title)}}>
							<i class="icon">{page.icon}</i>
							<span>{page.title}</span>
						</a>
					{/if}
				{/each}
			</div>

			{#if current_subpage}
				<svelte:component this={current_subpage.component} />
			{/if}
		{:else}
			<svelte:component this={current_page.component} />
		{/if}
	</div>
{/if}

{#if current_page !== null && current_page.hide_frame !== true}
	<Footer/>
{/if}

<style>
.submenu {
	border-bottom: 2px solid var(--separator);
}
.tab_bar > .button {
	flex-direction: column;
	gap: 0;
}
</style>
