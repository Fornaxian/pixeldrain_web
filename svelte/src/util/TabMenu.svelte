<script>
import { onMount } from "svelte";
import Footer from "../layout/Footer.svelte";

export let title = ""
export let pages = []

let navigate = (path, title) => {
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

let current_page = null
let current_subpage = null

onMount(() => get_page())
</script>

<svelte:window on:popstate={get_page} />

<header>
	<h1>{title}</h1>

	<div class="tab_bar">
		{#each pages as page}
			{#if !page.hidden}
				<a class="button"
					href="{page.path}"
					class:button_highlight={current_page && page.path === current_page.path}
					on:click|preventDefault={() => {navigate(page.path, page.title)}}>
					<i class="icon">{page.icon}</i><br/>
					{page.title}
				</a>
			{/if}
		{/each}
	</div>
</header>

<div id="page_content" class="page_content">
	{#if current_page}
		{#if current_page.subpages}
			<div class="tab_bar submenu">
				{#each current_page.subpages as page}
					{#if !page.hidden}
						<a class="button"
							href="{page.path}"
							class:button_highlight={current_subpage && page.path === current_subpage.path}
							on:click|preventDefault={() => {navigate(page.path, page.title)}}>
							<i class="icon">{page.icon}</i><br/>
							{page.title}
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
	{/if}
</div>

<Footer/>

<style>
.submenu{
	border-bottom: 2px solid var(--separator);
}
</style>
