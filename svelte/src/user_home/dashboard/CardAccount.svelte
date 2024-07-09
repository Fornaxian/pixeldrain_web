<ul>
	<li>Username: {window.user.username}</li>
	<li>
		{#if window.user.email === ""}
			No e-mail address configured. You will not be able to recover
			your account if you lose your password.
		{:else}
			E-mail address: {window.user.email}
		{/if}
	</li>
	<li>
		<i class="icon">settings</i>
		<a href="/user/settings">Account settings</a>
	</li>
</ul>

<h3>Quick navigation</h3>

<div class="button_row">
	<a href="/user/filemanager#files" class="button">
		<i class="icon">image</i>
		My Files
	</a>
	<a href="/user/filemanager#lists" class="button">
		<i class="icon">photo_library</i>
		My Albums
	</a>
	{#if window.user.subscription.filesystem_access}
		<a href="/d/me" class="button">
			<i class="icon">folder</i>
			Filesystem
		</a>
	{/if}
	<a href="/logout" class="button">
		<i class="icon">logout</i>
		Log out
	</a>
</div>

<h3>Exports</h3>

<div class="button_row">
	<a href="/user/export/files" class="button">
		<i class="icon">list</i>
		Export files to CSV
	</a>
	<a href="/user/export/lists" class="button">
		<i class="icon">list</i>
		Export albums to CSV
	</a>
</div>

<style>
.button_row {
	display: flex;
	flex-wrap: wrap;
}
.button_row > a {
	flex: 1 1 auto;
}
ul {
	margin: 0;
}
h3 {
	font-size: 1.3em;
}
</style>
