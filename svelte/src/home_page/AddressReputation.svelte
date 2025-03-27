<script>
import { onMount } from "svelte";
import Expandable from "util/Expandable.svelte";
import { formatDate } from "util/Formatting.svelte";

let result = null;

onMount(async () => {
	try {
		const resp = await fetch(window.api_endpoint+"/misc/ip_address_reputation");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		result = await resp.json()
	} catch (err) {
		console.error(err);
	}
})
</script>

{#if result !== null && result.user_banned}
	<section>
		<Expandable click_expand>
			<div slot="header" class="header red">
				Your account has been banned, click for details
			</div>
			<p>
				Your user account has been banned from uploading to
				pixeldrain due to violation of the
				<a href="/abuse">content policy</a>. Below is a list of
				files originating from your account which have been blocked:
			</p>

			<div class="table_scroll">
				<table>
					<thead>
						<tr>
							<td>File</td>
							<td>Reason</td>
							<td>Ban date</td>
							<td>Expiry date</td>
						</tr>
					</thead>
					<tbody>
						{#each result.user_offences as offence (offence.ban_time)}
							<tr>
								<td>
									{#if offence.file_link}
										<a href={offence.file_link} target="_blank" rel="noreferrer">
											{offence.file_name}
										</a>
									{/if}
								</td>
								<td>{offence.reason}</td>
								<td>{formatDate(offence.ban_time, false, false, false)}</td>
								<td>{formatDate(offence.expire_time, false, false, false)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p>
				If you would like to dispute your account ban you can mail me at
				support@pixeldrain.com. Please do not mail unless you have a
				good reason. If you do not provide a valid reason why the ban
				should be reversed your e-mail will be ignored. And do not
				forget to put your username ({window.user.username}) in the
				e-mail.
			</p>
		</Expandable>
	</section>
{:else if result !== null && result.ip_offences.length > 0}
	<section>
		<Expandable click_expand>
			<div slot="header" class="header" class:red={result.ip_banned} class:yellow={!result.ip_banned}>
				{#if result.ip_banned}
					Your IP address has been banned, click for details
				{:else}
					Your IP address has received a copyright strike, click for details
				{/if}
			</div>
			{#if result.ip_banned}
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
					<thead>
						<tr>
							<td>File</td>
							<td>Reason</td>
							<td>Ban date</td>
							<td>Expiry date</td>
						</tr>
					</thead>
					<tbody>
						{#each result.ip_offences as offence (offence.ban_time)}
							<tr>
								<td>
									{#if offence.file_link}
										<a href={offence.file_link} target="_blank" rel="noreferrer">
											{offence.file_name}
										</a>
									{/if}
								</td>
								<td>{offence.reason}</td>
								<td>{formatDate(offence.ban_time, false, false, false)}</td>
								<td>{formatDate(offence.expire_time, false, false, false)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<p>
				That these files originated from your IP address does not
				necessarily mean that they were uploaded by you. It's possible
				that people on your home/business network are sharing the same
				IP address. If you're using a VPN then there are often many
				people using the same IP address. And some ISPs deploy CGNAT, in
				which case there could be hundreds of people sharing the same IP
				address. In all of these cases IPv6 is the solution, but most
				ISPs are decades behind on implementing internet standards. They
				just don't care.
			</p>
			<p>
				Now you may be asking: If IP banning is so unreliable, why are
				you still using it? Well, I need to protect my service from
				abuse somehow. The alternative is authenticating every user.
				This adds another barrier to entry and generally complicates
				things.
			</p>
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
