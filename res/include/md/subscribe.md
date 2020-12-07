# Becoming a pixeldrain subscriber

## Register a pixeldrain account

{{if .Authenticated}}

✅ You are logged in to your pixeldrain account. Continue to the next step.

{{else}}

❌ You are not logged into a pixeldrain account. If you do not have an account
yet you need to register one. You can do so with our [registration
form](/register). If you already have an account you can [log in here](/login).

{{end}}

## Verify your e-mail address

{{if eq .User.Email ""}}

❌ Your e-mail address is not yet verified. You can change your e-mail address on
the [user settings page](/user/settings). After submitting your e-mail address
you will receive a verification link in your inbox. Click the verification link
to verify your e-mail address.

{{else}}

✅ Your e-mail address is verified. Continue to the next step.

{{end}}

## Join a support tier in Patreon

Make sure your Patreon account uses the same e-mail address as your pixeldrain
account. {{if .Authenticated}}(Your e-mail address: {{.User.Email}}){{end}}

{{$plan := .URLQuery.Get "plan"}}
{{if eq $plan "t1"}}
<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427">
Order plan 'I'm doing my part!'
</a>
{{else if eq $plan "t5"}}
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
<div style="text-align: center;">
<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
See our subscription plans on Patreon
</a>
</div>
{{end}}

After ordering you will receive an e-mail with a link to activate your
subscription. The subscription will be linked to the pixeldrain account you're
currently logged into.
