<script>
import Login from "../login/Login.svelte";
import Register from "../login/Register.svelte";
import UploadWidget from "./UploadWidget.svelte";

const finish_login = async e => {
	location.reload()
}

let page = "login"
</script>

{#if window.user && window.user.username && window.user.username !== ""}
	<UploadWidget/>
{:else}
	<section>
		<p>
			Pixeldrain requires an account to upload files to. If you already
			have an account use the login form below to log in to your account.
			If not, use the right tab button to register a new account.
		</p>
	</section>

	<div class="tab_bar">
		<button on:click={() => page = "login"} class:button_highlight={page === "login"}>
			<i class="icon small">login</i>
			<span>Login</span>
		</button>

		<button on:click={() => page = "register"} class:button_highlight={page === "register"}>
			<i class="icon small">how_to_reg</i>
			<span>Register</span>
		</button>
	</div>

	{#if page === "login"}
		<section class="highlight_border">
			<Login on:login={finish_login}/>
			<p>
				If you have lost your password, you can <a
				href="password_reset">request a new password here</a>.
			</p>
		</section>
	{:else if page === "register"}
		<section class="highlight_border">
			<Register on:login={finish_login}/>
		</section>
	{/if}

	<br/>
{/if}

<style>
.tab_bar > button {
	width: 40%;
	max-width: 10em;
	font-size: 1.3em;
	justify-content: center;
}
</style>
