<script lang="ts">
import Button from "layout/Button.svelte";
import type { FSNode, FSPermissions } from "filesystem/FilesystemAPI";
import PermissionButton from "./PermissionButton.svelte";

export let file: FSNode

let new_user_id = ""
let new_user_perms = <FSPermissions>{read: true}
const add_user = (e: SubmitEvent) => {
	e.preventDefault()
	if (file.user_permissions === undefined) {
		file.user_permissions = {} as {[index: string]: FSPermissions}
	}
	file.user_permissions[new_user_id] = structuredClone(new_user_perms)
}
const del_user = (id: string) => {
	delete file.user_permissions[id]
	file.user_permissions = file.user_permissions
}

let new_password = ""
let new_password_perms = <FSPermissions>{read: true}
const add_password = (e: SubmitEvent) => {
	e.preventDefault()
	if (file.password_permissions === undefined) {
		file.password_permissions = {} as {[index: string]: FSPermissions}
	}
	file.password_permissions[new_password] = structuredClone(new_password_perms)
}
const del_password = (pass: string) => {
	delete file.password_permissions[pass]
	file.password_permissions = file.password_permissions
}
</script>

<p>
	Access controls are only available for users with an account currently. Even
	if you set 'Anyone with the link' to write, they will need to be logged in
	to write to the directory.
</p>
<p>
	Users can always delete files they uploaded themselves, even if they don't
	have delete permissions. You can see who the owner of a file is in the
	Details window.
</p>
<fieldset>
	<legend>Link permissions</legend>
	<div class="row">
		<div class="grow id">
			Anyone with the link can...
		</div>
		<div class="perms">
			<PermissionButton bind:permissions={file.link_permissions}/>
		</div>
	</div>
</fieldset>


<fieldset>
	<legend>User permissions</legend>
	<p>
		Enter a username here to give them access to this directory. The user will
		not receive an e-mail invite. Giving write access to a user without giving
		read access as well does not actually allow them to write anything.
	</p>
	<form on:submit={add_user} class="row">
		<input type="text" bind:value={new_user_id} placeholder="Username" class="grow" size="1">
		<Button type="submit" icon="add" label="Add"/>
		<div class="perms">
			<PermissionButton bind:permissions={new_user_perms}/>
		</div>
	</form>
	{#if file.user_permissions !== undefined}
		{#each Object.keys(file.user_permissions) as id (id)}
			<div class="row">
				<Button click={() => del_user(id)} icon="delete"/>
				<div class="grow id">
					{id}
				</div>
				<div class="perms">
					<PermissionButton bind:permissions={file.user_permissions[id]}/>
				</div>
			</div>
		{/each}
	{/if}
</fieldset>

<fieldset>
	<legend>Password permissions</legend>
	<p>
		Allow users to enter a password to give them access to this directory.
	</p>
	<p>
		<b>This feature is not implemented currently!</b>
	</p>
	<form on:submit={add_password} class="row">
		<input type="text" bind:value={new_password} placeholder="Password" class="grow" size="1">
		<Button type="submit" icon="add" label="Add"/>
		<div class="perms">
			<PermissionButton bind:permissions={new_password_perms}/>
		</div>
	</form>
	{#if file.password_permissions !== undefined}
		{#each Object.keys(file.password_permissions) as password (password)}
			<div class="row">
				<Button click={() => del_password(password)} icon="delete"/>
				<div class="grow id">
					{password}
				</div>
				<div class="perms">
					<PermissionButton bind:permissions={file.password_permissions[password]}/>
				</div>
			</div>
		{/each}
	{/if}
</fieldset>

<style>
.row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin-bottom: 2px;
	padding-bottom: 2px;
}
.row > .grow {
	min-width: 150px;
	flex: 1 1 content;
}
.row > * {
	flex: 0 0 content;
}
.id {
	margin-left: 0.5em;
	display: flex;
	align-items: center;
}
.perms {
	text-align: right;
	margin-left: 0.5em;
}
</style>
