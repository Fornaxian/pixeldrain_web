<script lang="ts">
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import CopyButton from "layout/CopyButton.svelte";
import { formatDate } from "util/Formatting";
import { check_response, dict_to_form, get_endpoint, type UserSession } from "lib/PixeldrainAPI";

// Each part of the API has a read and a write permission
const components: [string, string, keyof UserSession, keyof UserSession][] = [
	["Files", "i_description", "file_read", "file_write"],
	["Filesystem", "i_folder", "filesystem_read", "filesystem_write"],
	["Account", "i_person", "account_read", "account_write"],
	["API keys", "i_vpn_key", "session_read", "session_write"],
	["Billing", "i_receipt", "billing_read", "billing_write"],
]

let loading = $state(false)
let keys: UserSession[] = $state([])

// The keys which are shown in full, the others are masked
let shown: {[key: string]: boolean} = $state({})

// The keys of which the whole user agent is shown
let agent_shown: {[key: string]: boolean} = $state({})

// The key which is being edited, and what its permissions are going to be.
// Nothing changes until it is saved
let editing = $state("")
let edit_perms: {[name: string]: boolean} = $state({})

const edit_key = (key: UserSession) => {
	editing = key.auth_key
	edit_perms = {}
	for (const [, , read, write] of components) {
		edit_perms[read] = key[read] as boolean
		edit_perms[write] = key[write] as boolean
	}
}

const session_request = async (init: RequestInit) => {
	loading = true
	try {
		return await check_response(await fetch(get_endpoint() + "/user/session", init))
	} finally {
		loading = false
	}
}

const save_key = async () => {
	try {
		await session_request({
			method: "PUT",
			body: dict_to_form({auth_key: editing, ...edit_perms}),
		})
	} catch (err) {
		alert("Failed to change key: " + (err.message ?? err))
		return
	}

	editing = ""
	await load_keys()
}

// Intl.RelativeTimeFormat is the browser's formatter for "5 minutes ago", it
// takes care of the plurals
const relative = new Intl.RelativeTimeFormat("en", {numeric: "always", style: "short"})

// The server records the use of a key once per hour, so for the last used time
// anything more exact than that would be made up
const ago = (time: string) => {
	const seconds = (Date.now() - Date.parse(time)) / 1000
	if (seconds >= 86400) {
		return relative.format(-Math.floor(seconds / 86400), "day")
	} else if (seconds >= 3600) {
		return relative.format(-Math.floor(seconds / 3600), "hour")
	} else if (seconds >= 60) {
		return relative.format(-Math.floor(seconds / 60), "minute")
	}
	return "just now"
}

const load_keys = async () => {
	try {
		const resp: UserSession[] = await session_request({})

		// The key of this session goes first, then the most recently used ones
		keys = resp.sort((a, b) =>
			Number(b.current) - Number(a.current) ||
			Date.parse(b.last_used_time) - Date.parse(a.last_used_time)
		)
	} catch (err) {
		alert("Failed to load API keys: " + (err.message ?? err))
	}
}

const create_key = async () => {
	try {
		// Keys are made to be put in other programs, where they can leak. The
		// server never gives account write to a key which is made like this,
		// with it a key could change the password and take the account over
		const key: UserSession = await session_request({
			method: "POST",
			body: dict_to_form({app_name: "website keys page"}),
		})
		shown[key.auth_key] = true
	} catch (err) {
		alert("Failed to create new API key: " + (err.message ?? err))
	}

	await load_keys()
}

const delete_key = async (key: UserSession) => {
	if (key.current && !confirm(
		"This is the key you are logged in with. Deleting it logs you out. Continue?"
	)) {
		return
	}

	try {
		// A key is deleted by logging out with it
		await session_request({
			method: "DELETE",
			headers: {"Authorization": "Basic " + btoa(":" + key.auth_key)},
		})
	} catch (err) {
		alert("Failed to delete key: " + (err.message ?? err))
	}

	if (key.current) {
		window.location.href = "/login"
	} else {
		await load_keys()
	}
}

onMount(load_keys)
</script>

<LoadingIndicator loading={loading}/>

<section>
	<p>
		API keys give apps access to your account. Whoever has a key can do
		everything the key is allowed to do, so don't show them to someone or
		something you don't trust. A key expires 30 days after it was last used.
		If you think someone is using your account without your permission,
		delete all your keys and change your password.
	</p>

	<div class="toolbar">
		<div class="toolbar_spacer"></div>
		<button onclick={create_key}>
			<i class="icon i_add"></i> Create new API key
		</button>
	</div>

	{#each keys as key (key.auth_key)}
		<div class="key" class:current={key.current}>
			<div class="row">
				<span class="app">
					{#if key.app_name === "website login"}
						<img src="/res/img/pixeldrain_32.png" alt=""/> Pixeldrain website
					{:else if key.app_name === "website keys page"}
						<i class="icon i_vpn_key"></i> Created on this page
					{:else if key.app_name === "sharex"}
						<img src="/res/img/sharex.png" alt=""/> ShareX
					{:else if key.app_name === "jdownloader"}
						<img src="/res/img/jdownloader.png" alt=""/> JDownloader
					{:else}
						<i class="icon i_apps"></i> {key.app_name || "Unnamed key"}
					{/if}
				</span>
				{#if key.current}
					<span class="badge">This session</span>
				{/if}
				<div class="toolbar_spacer"></div>
				<!-- Not the session which is in use. Without its permissions
				this page and the rest of the website stop working -->
				{#if !key.current && editing !== key.auth_key}
					<button onclick={() => edit_key(key)}>
						<i class="icon i_edit"></i> Edit
					</button>
				{/if}
				<button class="button_red" onclick={() => delete_key(key)}>
					<i class="icon i_delete"></i> Delete
				</button>
			</div>

			<div class="row">
				<code>
					{shown[key.auth_key] ? key.auth_key : key.auth_key.slice(0, 8) + "-••••-••••-••••-••••••••••••"}
				</code>
				<button
					class:button_highlight={shown[key.auth_key]}
					onclick={() => shown[key.auth_key] = !shown[key.auth_key]}
				>
					<i class="icon {shown[key.auth_key] ? 'i_visibility_off' : 'i_visibility'}"></i>
					{shown[key.auth_key] ? "Hide" : "Show"}
				</button>
				<CopyButton text={key.auth_key}>Copy</CopyButton>
			</div>

			{#if editing === key.auth_key}
				<div class="edit">
					{#each components as [name, icon, read, write]}
						<div class="row">
							<span class="name"><i class="icon small {icon}"></i> {name}</span>
							<label>
								<input type="checkbox" bind:checked={edit_perms[read]}/> read
							</label>
							<!-- Account write can be taken away from a key, but
							not given to one -->
							{#if write !== "account_write" || key.account_write}
								<label>
									<input type="checkbox" bind:checked={edit_perms[write]}/> write
								</label>
							{/if}
						</div>
					{/each}

					<div class="row">
						<button class="button_highlight" onclick={save_key}>
							<i class="icon i_save"></i> Save
						</button>
						<button onclick={() => editing = ""}>
							<i class="icon i_close"></i> Cancel
						</button>
					</div>
				</div>
			{:else}
				<div class="row permissions">
					{#each components as [name, icon, read, write]}
						<span class:none={!key[read] && !key[write]}>
							<i class="icon small {icon}"></i>
							{name}:
							{#if key[read] && key[write]}
								read / write
							{:else if key[read]}
								read only
							{:else if key[write]}
								write only
							{:else}
								no access
							{/if}
						</span>
					{/each}
				</div>
			{/if}

			<div class="details">
				<div>
					<span>Created</span>
					{formatDate(key.creation_time, true, true, false)}
					({ago(key.creation_time)})
				</div>
				<div>
					<span>Last used</span>
					{formatDate(key.last_used_time, true, true, false)}
					({ago(key.last_used_time)})
				</div>
				<div>
					<span>IP address</span>
					{key.creation_ip_address}
				</div>
				<div class="agent" class:agent_shown={agent_shown[key.auth_key]}>
					<span>User agent</span>
					<button
						aria-expanded={!!agent_shown[key.auth_key]}
						onclick={() => agent_shown[key.auth_key] = !agent_shown[key.auth_key]}
					>
						{key.user_agent}
					</button>
				</div>
			</div>
		</div>
	{/each}
</section>

<style>
.toolbar {
	display: flex;
}
.toolbar_spacer {
	flex: 1 1 auto;
}

.key {
	margin: 0.8em 0;
	padding: 0.4em 0.6em;
	border-radius: 8px;
	border-left: 3px solid var(--separator);
	background: var(--card_color);
}
.key.current {
	border-left-color: var(--highlight_color);
}
.row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.2em 0.5em;
	margin: 0.3em 0;
}

/* An icon with text next to it. Flex centres the two on each other, inline
   layout would put the icon on the baseline of the text */
.app,
.permissions > span,
.edit label,
.edit span {
	display: inline-flex;
	align-items: center;
	gap: 0.3em;
}
/* The name of a permission, in front of its checkboxes */
.name {
	min-width: 6em;
}
.app {
	font-size: 1.1em;
}
.app > img {
	height: 1.5em;
}
.badge {
	padding: 0 0.6em;
	border-radius: 1em;
	color: var(--highlight_color);
	background: var(--input_background);
}

/* The key takes the space the buttons leave, and is cut off when it doesn't
   fit. It can still be copied in full */
code {
	flex: 1 1 10em;
	padding: 0.3em 0.5em;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.permissions > span {
	padding: 0.1em 0.5em;
	border: 1px solid var(--separator);
	border-radius: 6px;
}
.none,
.details span {
	opacity: 0.6;
}

/* Each detail is a label with its value below it */
.details {
	display: flex;
	flex-wrap: wrap;
	gap: 0.2em 1.5em;
	font-size: 0.9em;
}
.details > div {
	display: flex;
	flex-direction: column;
}

/* The user agent gets the space which is left, and is cut off until it is
   clicked. It's a button so it works with a keyboard too, without the looks of
   one */
.agent {
	flex: 1 1 10em;
	min-width: 0;
}
.agent > button {
	all: unset;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: pointer;
}
.agent_shown {
	flex-basis: 100%;
}
.agent_shown > button {
	white-space: normal;
	overflow-wrap: anywhere;
}
</style>
