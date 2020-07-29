# Thank you for supporting pixeldrain!

{{$success := .URLQuery.Get "success"}}
{{if eq $success "true"}}
	{{if .Authenticated}}
Dear {{.User.Username}},

Thank you for your donation. I really appreciate it!

Sincerely, Fornax.
	{{else}}
Thank you for your donation! You are amazing.

Sincerely, Fornax.
	{{end}}
{{else}}
It seems you have canceled your donation. I don't blame you, money is expensive :)

If this was not your intention, you're welcome to try again by clicking this button:
<a class="button" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WU49A5NHPAZ9G&source=url">
Donate with PayPal
</a>

Sincerely, Fornax.
{{end}}
