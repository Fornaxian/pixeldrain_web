<script>
import { onMount } from "svelte";
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
	<section class:highlight_red={result.banned === true} class:highlight_yellow={result.banned === false}>
		{#if result.banned === true}
			<p>
				Your IP address ({result.address}) has been banned from
				uploading to pixeldrain due to violation of the
				<a href="/about#content-policy">content policy</a>. Below is a
				list of files originating from your IP address which have been
				blocked:
			</p>
		{:else if offences > 0}
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
					<td>Reason</td>
					<td>Reporter</td>
					<td>Ban date</td>
					<td>Expiry date</td>
					<td>File</td>
				</tr>
				{#each result.offences as offence (offence.ban_time)}
					<tr>
						<td>{offence.reason}</td>
						<td>{offence.reporter}</td>
						<td>{formatDate(offence.ban_time, false, false, false)}</td>
						<td>{formatDate(offence.expire_time, false, false, false)}</td>
						<td>
							{#if offence.file_public_id}
								<a href="/u/{offence.file_public_id}" target="_blank" rel="noreferrer">
									{offence.file_name}
								</a>
							{/if}
						</td>
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
	</section>
{/if}
