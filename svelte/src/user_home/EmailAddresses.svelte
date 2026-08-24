<script lang="ts">
import LoadingIndicator from "util/LoadingIndicator.svelte";
import SuccessMessage from "util/SuccessMessage.svelte";
import { delete_user_email, put_user_email } from "lib/PixeldrainAPI";

const max_addresses = 5

let loading = false
let success_message: SuccessMessage

let addresses: string[] = window.user.email_addresses || []
let pending: string = window.user.email_address_pending || ""
let new_address = ""

// An account needs at least one address, so the last one can't be removed
$: removable = addresses.length > 1

const add = async () => {
	loading = true

	try {
		await put_user_email(new_address)

		pending = new_address
		new_address = ""
		success_message.set(true, "Verification link sent. Please check your inbox")
	} catch (err) {
		success_message.set(false, err.message !== undefined ? err.message : err)
	} finally {
		loading = false
	}
}

const remove = async (address: string) => {
	loading = true

	try {
		await delete_user_email(address)

		addresses = addresses.filter(a => a !== address)
		if (pending === address) {
			pending = ""
		}
		success_message.set(true, "Address removed")
	} catch (err) {
		success_message.set(false, err.message !== undefined ? err.message : err)
	} finally {
		loading = false
	}
}
</script>

<LoadingIndicator loading={loading}/>

<div class="form">
	<SuccessMessage bind:this={success_message}></SuccessMessage>
	<p>
		Account notifications are sent to all the addresses on your account and you
		can log in with any of them. A new address is only added once you click the
		verification link we send to it. Adding an address which is already waiting
		for verification sends a new link. If the message doesn't arrive right away
		please check your spam box.
	</p>
	{#if addresses.length < max_addresses}
		<form on:submit|preventDefault={() => add()}>
			<div class="form_row">
				<span>Add address</span>
				<input class="grow" bind:value={new_address} type="email"/>
				<button class="shrink" type="submit"><i class="icon">add</i> Add</button>
			</div>
		</form>
	{:else}
		<span>
			Your account has the maximum of {max_addresses} e-mail addresses.
			Remove one before adding a new address
		</span>
	{/if}
	<hr/>
	{#if addresses.length === 0}
		<span>
			Your account has no verified e-mail address. You will not be able to
			recover your account if you lose your password
		</span>
	{/if}
	{#each addresses as address}
		<div class="form_row">
			<button class="shrink" type="button" disabled={!removable}
				title={removable ? "Remove address" : "An account needs at least one e-mail address"}
				on:click={() => remove(address)}>
				<i class="icon">delete</i>
			</button>
			<div>{address}</div>
		</div>
	{/each}
	{#if pending !== ""}
		<div class="form_row">
			<button class="shrink" type="button"
				title={removable ? "Remove address" : "An account needs at least one e-mail address"}
				on:click={() => remove(pending)}>
				<i class="icon">delete</i>
			</button>
			<div>{pending} (pending verification)</div>
		</div>
	{/if}
</div>

<style>
.form_row {
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
	gap: 0.5em;
}
.grow {
	flex: 1 1 auto;
}
.shrink {
	flex: 0 0 auto;
}
</style>
