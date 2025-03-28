<script lang="ts">
import { onMount } from "svelte";
import Modal from "util/Modal.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import { get_user, put_user } from "lib/PixeldrainAPI";

// When the always flag is set then the pop-up will also show if the user
// already has an affiliate ID set
export let always = false
let modal: Modal
let loading: boolean
let referral: string
let shown = false

export const prompt = async (ref: string) => {
	referral = ref
	const user = await get_user()

	if (referral === null) {
		return
	} else if (referral === user.affiliate_user_name) {
		return // User is already supporting this affiliate ID
	} else if (referral === user.username) {
		return // This is your own referral link
	}

	if (!always) {
		if (user.subscription.id === "") {
			// User does not have an active subscription, setting referral will
			// not have effect
			return
		} else if (user.affiliate_user_name !== "") {
			// User is already sponsoring someone
			return
		} else if (localStorage.getItem("affiliate_deny") === "1") {
			// User has dismissed the pop-up in the past
			return
		}
	}

	// The prompt can only be shown once per page. This should prevent it from
	// showing up every time someone loads a new file.
	if (shown === true) {
		return
	}
	shown = true
	modal.show()
}

onMount(() => prompt(new URLSearchParams(document.location.search).get("ref")))

const allow = async () => {
	loading = true
	try {
		await put_user({affiliate_user_name: referral})

		// Close the popup
		modal.hide()
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
}

const deny = () => {
	localStorage.setItem("affiliate_deny", "1")
	modal.hide()
}
</script>

<Modal bind:this={modal} title="Affiliate sponsoring request" width="700px">
	<LoadingIndicator bind:loading={loading} />
	<section>
		<p>
			Hi! {referral} wants you to sponsor their pixeldrain account. This
			will give them €0.50 every month in pixeldrain prepaid credit. They
			can use this credit to get a discount on their file storage and
			sharing costs. Here is a short summary of what this entails:
		</p>
		<ul>
			<li>
				Sponsoring only works while you have an active subscription
				plan. When your subscription deactivates the creator will no
				longer receive commissions.
			</li>
			<li>
				Pixeldrain credit cannot be cashed out. So they are not earning
				real money with this.
			</li>
			<li>
				This does not cost you any extra money. The commissions paid out
				to the creator are paid for by pixeldrain itself.
			</li>
			<li>
				You can change who you are sponsoring at any time on your <a
				href="/user/settings">account settings page</a>.
			</li>
			<li>
				If you want to know more about the affiliate program check out
				the <a href="/about#toc_12">Q&A page</a>.
			</li>
		</ul>
		<p>
			If you click 'Accept' then the requested affiliate code will be
			added to your account and the creator will start earning. If you
			choose 'Deny' then we will never show this pop-up again.
		</p>
		<div class="buttons">
			<button class="button button_red" on:click={e => deny()}>
				Deny
			</button>
			<button class="button button_highlight" on:click={e => allow()}>
				Accept
			</button>
		</div>
	</section>
</Modal>

<style>
.buttons {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	gap: 10px;
}
.button {
	flex: 1 1 auto;
	margin: 0;
	font-size: 1.2em;
	justify-content: center;
}
</style>
