<script lang="ts">
import type { FSNavigator } from "./FSNavigator";
import { fs_node_icon, fs_share_hotlink_url, fs_share_url, fs_update, type FSNode } from "./FilesystemAPI";
import { copy_text } from "util/Util.svelte";
import CopyButton from "layout/CopyButton.svelte";
import Dialog from "layout/Dialog.svelte";

export let nav: FSNavigator

let path: FSNode[]
let base: FSNode
let toast = ""
let share_url = ""
let direct_share_url = ""
let is_parent = false
let parent_node: FSNode

let dialog: Dialog
export const open = async (e: MouseEvent, p: FSNode[]) => {
	path = p
	base = path[path.length-1]
	share_url = fs_share_url(path)
	if (share_url === "") {
		// File is not public, make public
		await make_public()
	}

	await share()

	if (e.target instanceof HTMLButtonElement) {
		dialog.open(e.target.getBoundingClientRect())
	} else {
		dialog.open((e.target as HTMLElement).parentElement.getBoundingClientRect())
	}
}

const make_public = async () => {
	base = await fs_update(base.path, {shared: true})
	await nav.reload()

	// Insert the new FSNode into the path
	path[path.length-1] = base
}

const share = async () => {
	// If the base node does not have a public ID then the file is shared
	// through a parent node. In that case we ask the user if it was their
	// intention to share the parent directory
	is_parent = base.id === undefined
	if (is_parent) {
		// Walk path backwards looking for the last public ID
		for (let i = path.length - 1; i >= 0; i--) {
			if (path[i].id !== undefined && path[i].id !== "me") {
				parent_node = path[i]
				break
			}
		}
	}

	share_url = fs_share_url(path)
	direct_share_url = fs_share_hotlink_url(path)

	try {
		await navigator.share({
			title: base.name,
			text: "I would like to share '" + base.name + "' with you",
			url: share_url,
		})
	} catch(_) {
		if (copy_text(share_url)) {
			toast = "Link copied to clipboard"
			setTimeout(() => {toast = ""}, 10000)
		} else {
			alert("Could not copy text")
		}
	}
}
</script>

<Dialog bind:this={dialog}>
	<div class="dialog_inner">
		{#if toast !== "" && !is_parent}
			<div class="highlight_green">{toast}</div>
			<div class="separator"></div>
		{/if}

		{#if is_parent}
			<div>
				By sharing this link you also share the parent directory:
				<img src={fs_node_icon(parent_node, 64, 64)} class="node_icon" alt="icon"/>
				{parent_node.name}
				<br/>
				<button on:click={async e => {await make_public(); await share()}}>
					Click here to only share
					<img src={fs_node_icon(base, 64, 64)} class="node_icon" alt="icon"/>
					{base.name}
				</button>
			</div>
			<div class="separator"></div>
		{/if}

		<div>Sharing link</div>
		<div class="link_copy">
			<div class="button_container">
				<CopyButton text={share_url}>Copy</CopyButton>
			</div>
			<a href="{share_url}">{share_url}</a>
		</div>
		<div class="separator"></div>
		<div>Direct sharing link (hotlink)</div>
		<div class="link_copy">
			<div class="button_container">
				<CopyButton text={direct_share_url}>Copy</CopyButton>
			</div>
			<a href="{direct_share_url}">{direct_share_url}</a>
		</div>
	</div>
</Dialog>

<style>
.dialog_inner {
	display: flex;
	flex-direction: column;
	text-align: center;
}
.link_copy {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5em;
}
.link_copy > .button_container {
	flex: 0 0 auto;
}
.link_copy > a {
	flex: 1 1 auto;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow-x: hidden;
}
.node_icon {
	width: 1.5em;
	height: 1.5em;
	vertical-align: middle;
}
.separator {
	height: 1px;
	border: none;
	background-color: var(--separator);
	margin: 0.5em;
}
</style>
