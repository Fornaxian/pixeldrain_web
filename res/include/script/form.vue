Vue.component("vform", {
	template: `
		<h2>TEST FORM</h2>
		<form class="highlight_dark" method="POST">
			<table class="form">
				<tbody>
					<tr class="form">
						<td>Old Password</td>
						<td>
							<input id="input_old_password" name="old_password" value="" type="password" autocomplete="current-password" class="form_input">
						</td>
					</tr>
					<tr class="form"></tr>
						<td>New Password</td>
						<td>
							<input id="input_new_password1" name="new_password1" value="" type="password" autocomplete="new-password" class="form_input">
						</td>
					</tr>
					<tr class="form">
						<td>New Password again</td>
						<td>
							<input id="input_new_password2" name="new_password2" value="" type="password" autocomplete="new-password" class="form_input">
						</td>
						</tr>
					<tr class="form">
						<td colspan="2">
							we need you to repeat your password so you won't be locked out of your account if you make a typing error
						</td>
					</tr>
					<tr class="form">
						<td colspan="2" style="text-align: right;">
							<input type="submit" value="Submit" class="button_highlight" style="float: right;">
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	`
})

Vue.component("form_field", {
	template: `

	`
})
