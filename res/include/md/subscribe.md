# Becoming a pixeldrain subscriber

## Register a pixeldrain account

{{if .Authenticated}}

✅ You are logged in to your pixeldrain account. Continue to the next step.

## Join a support tier in Patreon

<div style="text-align: center;">
	{{$plan := .URLQuery.Get "plan"}}
	{{if eq $plan "t5"}}
	<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5736701">
	Order plan 'Resolve'
	</a>
	{{else if eq $plan "t2"}}
	<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291482">
	Order plan 'Persistence'
	</a>
	{{else if eq $plan "t3"}}
	<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291516">
	Order plan 'Tenacity'
	</a>
	{{else if eq $plan "t4"}}
	<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291528">
	Order plan 'Eternity'
	</a>
	{{else}}
	<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427">
	Order Pixeldrain Pro Plan
	</a>
	{{end}}
</div>

After ordering you will receive an e-mail on your Patreon e-mail address with a
link to activate your subscription.

{{else}}

❌ You are not logged into a pixeldrain account. If you do not have an account
yet you need to register one. You can do so with our [registration
form](/register). If you already have an account you can [log in here](/login).

{{end}}
