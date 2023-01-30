<script>
import { onMount } from "svelte";
import Expandable from "../util/Expandable.svelte";
import { formatDate } from "../util/Formatting.svelte";

let result = false;
let offences = 0

onMount(async () => {
	try {
		const resp = await fetch(window.api_endpoint+"/misc/ip_address_reputation");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		result = await resp.json()
		offences = result.offences.length
	} catch (err) {
		console.error(err);
	}
})
</script>

{#if result !== false && offences > 0}
	<section>
		<Expandable click_expand>
			<div slot="header" class="header" class:red={result.banned === true} class:yellow={result.banned === false}>
				{#if result.banned === true}
					Your IP address has been banned, click for details
				{:else}
					Your IP address has received a copyright strike, click for details
				{/if}
			</div>
			{#if result.banned === true}
				<p>
					Your IP address ({result.address}) has been banned from
					uploading to pixeldrain due to violation of the
					<a href="/abuse">content policy</a>. Below is a list of
					files originating from your IP address which have been
					blocked:
				</p>
			{:else}
				<p>
					Your IP address ({result.address}) has received copyright
					strikes. At 10 copyright strikes your IP address will be banned
					and you will be unable to upload files to pixeldrain. Below is a
					list of files originating from your IP address which have been
					blocked:
				</p>
			{/if}

			<div class="table_scroll">
				<table>
					<tr>
						<td>File</td>
						<td>Reason</td>
						<td>Ban date</td>
						<td>Expiry date</td>
					</tr>
					{#each result.offences as offence (offence.ban_time)}
						<tr>
							<td>
								{#if offence.file_public_id}
									<a href="/u/{offence.file_public_id}" target="_blank" rel="noreferrer">
										{offence.file_name}
									</a>
								{/if}
							</td>
							<td>{offence.reason}</td>
							<td>{formatDate(offence.ban_time, false, false, false)}</td>
							<td>{formatDate(offence.expire_time, false, false, false)}</td>
						</tr>
					{/each}
				</table>
			</div>

			<p>
				If you would like to dispute your IP ban you can mail me at
				support@pixeldrain.com. Please do not mail unless you have a good
				reason. If you do not provide a valid reason why the IP ban should
				be reversed your e-mail will be ignored. And do not forget to put
				your IP address ({result.address}) in the e-mail.
			</p>
		</Expandable>
	</section>
{/if}

<style>

.header {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	border-radius: 6px;
}
.red {
	background-color: rgba(255, 0, 0, 0.2);
}
.yellow {
	background-color: rgba(255, 255, 0, 0.2);
}
</style>
