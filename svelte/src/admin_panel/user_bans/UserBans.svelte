<script>
import { onMount } from "svelte";
import { formatDate } from "util/Formatting.svelte";
import Expandable from "util/Expandable.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Button from "layout/Button.svelte"
import UserFiles from "./UserFiles.svelte";
import BanDetails from "./BanDetails.svelte";
import UserLists from "./UserLists.svelte";

let loading = true
let rows = []
let total_offences = 0
let expanded = false

const get_bans = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/user_ban");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		rows = await resp.json()

		total_offences = rows.reduce(
			(acc, curr) => acc + curr.offences.length, 0,
		)
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

const delete_ban = async (userid) => {
	if (!confirm("Delete this banned user?\n\n"+userid)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/user_ban/"+encodeURI(userid),
			{ method: "DELETE" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to delete ban! "+err)
	}

	get_bans();
}

const impersonate = async user_id => {
	const form = new FormData()
	form.append("id", user_id)

	const resp = await fetch(
		window.api_endpoint+"/admin/impersonate",
		{ method: "POST", body: form }
	);
	if(resp.status >= 400) {
		alert(await resp.text())
		return
	}

	window.open("/user", "_blank")
}

const block_all_files = async (row, reason) => {
	const form = new FormData()
	form.append("user_id", row.user_id)
	form.append("abuse_type", reason)

	loading = true;
	try {
		const req = await fetch(
			window.api_endpoint+"/admin/block_user_files",
			{ method: "POST", body: form }
		);
		if(req.status >= 400) {
			alert(await req.text())
			return
		}

		const resp = await req.json()

		if (reason === "none") {
			alert("Restored "+resp.files_blocked.length+" files")
		} else {
			alert("Blocked "+resp.files_blocked.length+" files")
		}

		if (row.tab_element && row.tab_element.reload) {
			row.tab_element.reload()
		}
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
}

onMount(get_bans);
</script>

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar">
		<div class="toolbar_label">
			Bans {rows.length}
		</div>
		<div class="toolbar_label">
			Offences {total_offences}
		</div>
		<div class="toolbar_spacer"></div>
		<button class:button_highlight={expanded} on:click={() => {expanded = !expanded}}>
			{#if expanded}
				<i class="icon">unfold_less</i> Collapse all
			{:else}
				<i class="icon">unfold_more</i> Expand all
			{/if}
		</button>
	</div>

	{#each rows as row (row.user_id)}
		<Expandable expanded={expanded} click_expand>
			<div slot="header" class="header">
				<div class="title">
					{row.user.username}
				</div>
				<div class="stats">
					Type<br/>
					{row.offences[0].reason}
				</div>
				<div class="stats">
					Count<br/>
					{row.offences.length}
				</div>
				<div class="stats">
					Date<br/>
					{formatDate(row.offences[0].ban_time, false, false, false)}
				</div>
				<button on:click|stopPropagation={() => {delete_ban(row.user_id)}} class="button button_red" style="align-self: center;">
					<i class="icon">delete</i>
				</button>
			</div>

			<div class="toolbar">
				<Button click={() => impersonate(row.user_id)} icon="login" label="Impersonate user"/>
				<div class="toolbar_spacer"></div>
				<div class="toolbar_label">
					<i class="icon">block</i> Block all files
					<select bind:value={row.select_abuse_type}>
						<option>copyright</option>
						<option>child_abuse</option>
						<option>zoophilia</option>
						<option>terrorism</option>
						<option>gore</option>
						<option>malware</option>
						<option>doxing</option>
						<option>revenge_porn</option>
					</select>
					<Button
						click={() => block_all_files(row, row.select_abuse_type)}
						label="Go"
					/>
				</div>
				<div class="toolbar_spacer"></div>
				<Button
					click={() => block_all_files(row, "none")}
					icon="undo"
					label="Restore all files"
				/>
			</div>

			<div class="tab_bar">
				<Button
					icon="person"
					label="User details"
					highlight={row.tab === undefined || row.tab === "user"}
					click={() => row.tab = "user"}
				/>
				<Button
					icon="image"
					label="Files"
					highlight={row.tab === "files"}
					click={() => row.tab = "files"}
				/>
				<Button
					icon="photo_library"
					label="Lists"
					highlight={row.tab === "lists"}
					click={() => row.tab = "lists"}
				/>
			</div>

			{#if row.tab === undefined || row.tab === "user"}
				<BanDetails row={row} />
			{:else if row.tab === "files"}
				<UserFiles bind:this={row.tab_element} user_id={row.user_id} />
			{:else if row.tab === "lists"}
				<UserLists bind:this={row.tab_element}  user_id={row.user_id} />
			{/if}

		</Expandable>
	{/each}
</section>

<style>
.toolbar {
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	width: 100%;
	text-align: left;
	margin-top: 10px;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
.toolbar_label {
	display: block;
	margin: 5px;
}


.header {
	display: flex;
	flex-direction: row;
	line-height: 1.2em;
}
.title {
	flex: 1 1 auto;
	align-self: center;
	word-break: break-all;
	padding-left: 8px;
}
.stats {
	flex: 0 0 auto;
	padding: 0 4px;
	border-left: 1px solid var(--separator);
	text-align: center;
}
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
