## User Methods

These methods all require authentication with an API key, except for POST
/user/login which is how you get an API key in the first place.

Because authentication is required, every endpoint in this chapter can return
the authentication_required (401), authentication_failed (401) and internal
(500) errors. These are not repeated in the error listings below.

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/user/login</summary>
<div>

### Description

Logs in to an account. On success a new session is created and the API key for
the session is returned. Use this API key for all other user methods. The key
is also set as a cookie named 'pd_auth_key', so browsers are logged in
immediately.

There are two ways to log in:

 - **Password login**: send the `username` and `password` fields. The
   `username` field accepts both a username and an e-mail address.
 - **E-mail login**: send only the `username` field and leave the password
   empty. A login link is e-mailed to the account, the response will be
   login_link_sent (HTTP 202). The link contains the `link_login_user_id` and
   `link_login_id` parameters, which are sent to this same endpoint to complete
   the login. When the `username` field contains an e-mail address the link is
   sent to that address, this also works with an address which is still waiting
   for verification and using the link verifies it. When it contains a username
   the link is sent to the first address on the account. This is how a lost
   password is recovered.

Accounts with two-factor authentication enabled need two of these three proofs
of identity, any combination will do:

 - A login link, sent by e-mail (`link_login_user_id` + `link_login_id`)
 - The account password (`password`)
 - A one-time password from the authenticator app (`totp`)

When only one of them is sent the otp_required error is returned. This means an
account can still be recovered when the authenticator app is lost, by
requesting a login link and sending it together with the password. Accounts
without two-factor authentication need only one of the three.

Logins are rate limited per IP address, when logging in too often the
ip_rate_limit_reached error is returned.

### Parameters

Param              | Type   | Required             | Description
-------------------|--------|----------------------|----------------------------
username           | string | true                 | Username or e-mail address of the account
password           | string | for password login   | Password of the account, leave empty to receive a login link by e-mail. Can be combined with a login link as second factor
totp               | string | if 2FA is enabled    | Six digit time-based one-time password
app_name           | string | false                | Name of your application, will be shown on the API keys page. The name 'website login' is reserved and returns the app_name_reserved error
redirect           | string | false                | Path the user is sent to after using the e-mailed login link
link_login_user_id | UUID   | for link login       | User ID from the e-mailed login link
link_login_id      | UUID   | for link login       | Single-use login ID from the e-mailed login link

### Returns

HTTP 201: Created
```
{
	// The API key of the new session
	"auth_key": "550e8400-e29b-41d4-a716-446655440000",
	"creation_ip_address": "192.0.2.1",
	"user_agent": "Mozilla/5.0 ...",
	"app_name": "my_app",
	"creation_time": "2024-02-04T18:34:13.466276Z",
	"last_used_time": "2024-02-04T18:34:13.466276Z",
	// The domains this API key can be used on
	"valid_domains": ["pixeldrain.com"]
}
```

When only an e-mail address was entered:

HTTP 202: Accepted
```
{
	"success": true,
	"value": "login_link_sent",
	"message": "Login link was sent to the user"
}
```

#### Possible errors

Value                     | HTTP status | Description
--------------------------|-------------|----------------------------------------------------------------
user_not_found            | 404         | No account exists with this username or e-mail address
password_incorrect        | 400         | The entered password is not correct for this account
no_login_method_available | 400         | No password was entered and the account has no e-mail address to send a login link to
otp_required              | 400         | The account has two-factor authentication enabled, a second proof of identity is required
otp_incorrect             | 400         | The entered one-time password is not correct
login_link_sent           | 202         | Not an error, a login link was e-mailed to the user
app_name_reserved         | 400         | The requested app name is reserved for the pixeldrain website
login_link_already_sent   | 400         | The account already has an active login link, wait for it to expire
invalid_login_link        | 400         | The login link is not valid for this account, it may have expired
invalid_email_address     | 400         | A login link could not be sent because the e-mail address is invalid
request_origin_invalid    | 400         | The Origin header of the request does not match the pixeldrain domain names
ip_rate_limit_reached     | 429         | Too many login attempts from your IP address, try again later
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user</summary>
<div>

### Description

Returns information about the logged in user account.

### Returns

HTTP 200: OK
```
{
	"id": "8e08a626-040e-417e-8713-a0f43737a235",
	"username": "some_user",
	// All verified e-mail addresses on the account. Account notifications are
	// sent to all of them. An account can have at most 5 addresses
	"email_addresses": ["user@example.com"],
	// Address which is waiting for its verification link to be clicked
	"email_address_pending": "",
	// Accounts registered after 2026-09-01 need a verified e-mail address
	// before they are allowed to upload files
	"can_upload": true,
	// Deprecated: use email_addresses instead. Contains the first address
	"email": "user@example.com",
	// Deprecated: use email_addresses instead
	"email_verified": true,
	// Whether two-factor authentication is enabled
	"otp_enabled": false,
	// The subscription plan of this account
	"subscription": {
		"id": "prepaid",
		"name": "Prepaid",
		"type": "prepaid",
		"file_size_limit": 107374182400,
		"file_expiry_days": 0,
		"storage_space": -1,
		"price_per_tb_storage": 4000000,
		"price_per_tb_bandwidth": 1000000,
		"monthly_transfer_cap": -1,
		"file_viewer_branding": true,
		"filesystem_access": true,
		"filesystem_storage_limit": -1
	},
	"storage_space_used": 1234567890,
	"filesystem_storage_used": 1234567890,
	"file_count": 420,
	"filesystem_node_count": 1337,
	"is_admin": false,
	// Prepaid balance in micro euros, 1000000 = €1
	"balance_micro_eur": 12500000,
	"hotlinking_enabled": true,
	// Monthly transfer cap in bytes, 0 means no custom cap is configured
	"monthly_transfer_cap": 0,
	"monthly_transfer_used": 1234567890,
	// File viewer customizations, see PUT /user/file_customization
	"file_viewer_branding": null,
	// Space separated list of domains which can embed your files
	"file_embed_domains": "",
	// Whether direct file links skip the file viewer page
	"skip_file_viewer": false,
	"affiliate_user_name": "",
	"checkout_country": "NLD",
	"checkout_name": "",
	"checkout_provider": ""
}
```
</div>
</details>

<details class="api_doc_details request_put">
<summary><span class="method">PUT</span>/user</summary>
<div>

### Description

Updates account settings. Only the fields which are sent with the request are
updated.

### Parameters

Param               | Type    | Description
--------------------|---------|----------------------------
username            | string  | New username of the account
email               | string  | E-mail address to add to the account, up to a maximum of 5 addresses. A verification link is sent to the address, it's only added to the account when the link is used. Sending an address which is already pending verification sends a new link
password_new        | string  | New password of the account, between 5 and 50 characters. Only sessions which were created by logging in on the website can change the password
subscription        | enum    | Activate a prepaid plan, can be 'prepaid' or 'prepaid_lite'. Requires at least €1 of account credit
hotlinking_enabled  | boolean | Whether other people are allowed to use your account's data transfer when downloading your files
transfer_cap        | integer | Custom monthly transfer cap in bytes, cannot exceed the cap of your subscription plan
skip_file_viewer    | boolean | When enabled, direct links to your files skip the file viewer page
embed_domains       | string  | Space separated list of domains which are allowed to embed your files
affiliate_user_name | string  | Username of the account which receives affiliate rewards for your purchases, empty to remove
checkout_country    | string  | Three letter country code used for checkout
checkout_name       | string  | Name used for checkout
checkout_provider   | string  | Payment provider used for checkout

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

When an e-mail address was added the response is login_link_sent (HTTP 202),
see POST /user/login.

#### Possible errors

Value                            | HTTP status | Description
---------------------------------|-------------|----------------------------------------------------------------
username_already_registered      | 400         | An account with the new username already exists
email_address_already_registered | 400         | An account with the new e-mail address already exists
invalid_email_address            | 400         | The new e-mail address is not valid
too_many_email_addresses         | 400         | The account already has the maximum of 5 e-mail addresses
website_login_required           | 403         | Changing the password requires a session which was created by logging in on the website
login_link_already_sent          | 400         | The account already has an active verification link, wait for it to expire
not_enough_credit_for_prepaid    | 400         | Activating a prepaid plan requires at least €1 of account credit
invalid_domain_name              | 400         | One of the embed domains does not contain a period
user_not_found                   | 404         | The affiliate username does not exist
</div>
</details>

<details class="api_doc_details request_delete">
<summary><span class="method">DELETE</span>/user/email</summary>
<div>

### Description

Removes an e-mail address from the account. This also works for the address
which is still waiting for verification.

An account always keeps at least one address, the last one can't be removed.

### Parameters

Param | Type   | Required | Description
------|--------|----------|---------------
email | string | true     | The e-mail address to remove

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

#### Possible errors

Value                 | HTTP status | Description
----------------------|-------------|----------------------------------------------------------------
invalid_email_address | 400         | The e-mail address is not valid
last_email_address    | 400         | This is the last address on the account, accounts need at least one
not_found             | 404         | The address is not on the account
</div>
</details>

<details class="api_doc_details request_delete">
<summary><span class="method">DELETE</span>/user</summary>
<div>

### Description

Deletes the account. All sessions are logged out immediately and the account is
scheduled for deletion in 7 days. If the account logs in again within those 7
days the deletion is cancelled. If the account has an e-mail address configured
a message is sent to explain the deletion procedure.

Only sessions which were created by logging in on the website can delete the
account.

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

#### Possible errors

Value                  | HTTP status | Description
-----------------------|-------------|----------------------------------------------------------------
website_login_required | 403         | The request was not made by a session which was created by logging in on the website
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/files</summary>
<div>

### Description

Returns a list of all the files on the account, up to a maximum of 50000. The
file objects have the same structure as the GET /file/{id}/info response.

### Parameters

Param  | Required | Location | Description
-------|----------|----------|---------------
format | false    | URL      | When set to 'csv' the file list is returned as a CSV spreadsheet instead of JSON

### Returns

HTTP 200: OK
```
{
	"files": [
		{
			"id": "1234abcd",
			"name": "screenshot.png",
			"size": 5694837,
			... // Remaining file info fields, see GET /file/{id}/info
		}
	]
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/lists</summary>
<div>

### Description

Returns all the lists on the account. The list objects have the same structure
as the GET /list/{id} response, except that the files array is not included.

### Parameters

Param  | Required | Location | Description
-------|----------|----------|---------------
format | false    | URL      | When set to 'csv' the lists are returned as a CSV spreadsheet instead of JSON

### Returns

HTTP 200: OK
```
{
	"lists": [
		{
			"id": "L8bhwx",
			"title": "Rust in Peace",
			"date_created": "2020-02-04T18:34:13.466276Z",
			"file_count": 3,
			"can_edit": true
		}
	]
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/time_series/{statistic}</summary>
<div>

### Description

Returns historic usage statistics of the account.

### Parameters

Param     | Required | Location | Description
----------|----------|----------|---------------
statistic | true     | URL      | The statistic to get, can be 'bandwidth', 'transfer_paid', 'views' or 'downloads'
start     | true     | URL      | Start time of the data, RFC 3339 format
end       | true     | URL      | End time of the data, RFC 3339 format
interval  | true     | URL      | Duration of each time slot in minutes, between 1 and 1440

### Returns

HTTP 200: OK
```
{
	"timestamps": [
		"2024-02-04T18:00:00Z",
		"2024-02-04T19:00:00Z"
	],
	"amounts": [
		123456,
		654321
	]
}
```

#### Possible errors

Value             | HTTP status | Description
------------------|-------------|----------------------------------------------------------------
not_found         | 404         | The statistic in the URL is not one of the allowed values
time_parse_failed | 422         | The start or end time was not formatted correctly
missing_field     | 400         | A required parameter was not sent
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/activity/{month}</summary>
<div>

### Description

Returns the activity log of the account for one month. The activity log shows
files which were removed from the account. The event field can be
'file_instance_expired', 'file_instance_blocked', 'file_instance_lost',
'filesystem_node_blocked' or 'filesystem_node_lost'.

### Parameters

Param | Required | Location | Description
------|----------|----------|---------------
month | true     | URL      | The month to get activity for, formatted like '2024-02'

### Returns

HTTP 200: OK
```
[
	{
		"time": "2024-02-04T18:34:13.466276Z",
		"event": "file_instance_expired",
		"file_id": "1234abcd",
		"file_name": "screenshot.png",
		"file_removal_reason": "file_expired"
	}
]
```

#### Possible errors

Value             | HTTP status | Description
------------------|-------------|----------------------------------------------------------------
time_parse_failed | 422         | The month in the URL was not formatted correctly
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/transactions/{month}</summary>
<div>

### Description

Returns the prepaid transaction log of the account for one month. All amounts
are in micro euros, 1000000 = €1.

### Parameters

Param | Required | Location | Description
------|----------|----------|---------------
month | true     | URL      | The month to get transactions for, formatted like '2024-02'

### Returns

HTTP 200: OK
```
[
	{
		"time": "2024-02-04T18:34:13.466276Z",
		"new_balance": 12500000,
		"deposit_amount": 0,
		"subscription_charge": -50000,
		"storage_charge": -25000,
		"storage_used": 1234567890,
		"bandwidth_charge": -10000,
		"bandwidth_used": 123456789,
		"affiliate_amount": 0,
		"affiliate_count": 0
	}
]
```

#### Possible errors

Value             | HTTP status | Description
------------------|-------------|----------------------------------------------------------------
time_parse_failed | 422         | The month in the URL was not formatted correctly
</div>
</details>

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/user/invoice</summary>
<div>

### Description

Creates a new invoice to add credit to the account. The response contains a
checkout URL where the payment can be completed.

### Parameters

Param   | Type    | Required               | Description
--------|---------|------------------------|----------------------------
amount  | integer | true                   | Amount to deposit in micro euros, between 10000000 (€10) and 1000000000000 (€1000000)
network | enum    | true                   | Payment method, can be 'mollie', 'paypal', 'bancontact', 'eps', 'ideal', 'p24', 'trustly', 'btc', 'btc_lightning', 'doge', 'xmr' or 'ltc'
country | string  | true                   | Two or three letter country code, used for calculating VAT
name    | string  | for 'ideal' and 'p24'  | Full name of the customer, required by some payment methods

### Returns

HTTP 200: OK
```
{
	"invoice_id": "abc123",
	"checkout_url": "https://payment.provider/checkout/abc123"
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/invoice</summary>
<div>

### Description

Returns all the invoices of the account. Amounts are in micro euros, 1000000 =
€1.

### Returns

HTTP 200: OK
```
[
	{
		"id": "abc123",
		"time": "2024-02-04T18:34:13.466276Z",
		"amount": 10000000,
		"vat": 2100000,
		"country": "NL",
		"payment_gateway": "mollie",
		"payment_method": "ideal",
		"status": "paid"
	}
]
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/pay_invoice/{id}</summary>
<div>

### Description

Redirects the browser to the checkout page of an open invoice. If the payment
does not exist anymore the invoice is cancelled and the browser is redirected
back to the website.

### Parameters

Param | Required | Location | Description
------|----------|----------|---------------
id    | true     | URL      | ID of the invoice to pay

### Returns

HTTP 302: Found, with a Location header pointing to the checkout page.

#### Possible errors

Value     | HTTP status | Description
----------|-------------|----------------------------------------------------------------
not_found | 404         | No invoice exists with this ID
</div>
</details>

<details class="api_doc_details request_put">
<summary><span class="method">PUT</span>/user/file_customization</summary>
<div>

### Description

Configures the appearance of the file viewer page for all the files on the
account. This feature requires a subscription plan with file viewer branding
support. The image fields accept the ID of an image file on your own account.
The image needs to be of type JPEG, PNG, GIF or WebP and can be at most 10 MB
large. Fields which are sent with an empty value are removed.

### Parameters

Param                   | Type    | Description
------------------------|---------|----------------------------
theme                   | string  | Color theme of the file viewer
header_image            | string  | ID of an image file to show in the header
header_link             | string  | URL to open when the header image is clicked, must start with https://
background_image        | string  | ID of an image file to use as page background
footer_image            | string  | ID of an image file to show in the footer
footer_link             | string  | URL to open when the footer image is clicked, must start with https://
affiliate_prompt        | string  | Affiliate message to show on the download page
disable_download_button | boolean | Hides the download button on the file viewer
disable_share_button    | boolean | Hides the share button on the file viewer

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

#### Possible errors

Value                    | HTTP status | Description
-------------------------|-------------|----------------------------------------------------------------
branding_image_not_found | 404         | One of the image file IDs does not exist
not_found                | 404         | One of the image files does not belong to your account
invalid_file_type        | 400         | One of the image files is not a JPEG, PNG, GIF or WebP image
file_too_large           | 413         | One of the image files is larger than 10 MB
invalid_link             | 400         | The header or footer link does not start with https://
</div>
</details>

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/user/session</summary>
<div>

### Description

Creates a new API key for the account. This is the same kind of key that POST
/user/login returns, but this endpoint can be used to create extra keys for
different applications without logging in again.

Only sessions which were created by logging in on the website can create new
keys, an API key can't create more keys.

### Parameters

Param    | Type   | Required | Description
---------|--------|----------|----------------------------
app_name | string | false    | Name of your application, will be shown on the API keys page. The name 'website login' is reserved

### Returns

HTTP 201: Created
```
{
	"auth_key": "550e8400-e29b-41d4-a716-446655440000",
	"creation_ip_address": "192.0.2.1",
	"user_agent": "Mozilla/5.0 ...",
	"app_name": "my_app",
	"creation_time": "2024-02-04T18:34:13.466276Z",
	"last_used_time": "2024-02-04T18:34:13.466276Z",
	"valid_domains": ["pixeldrain.com"]
}
```

#### Possible errors

Value                  | HTTP status | Description
-----------------------|-------------|----------------------------------------------------------------
website_login_required | 403         | The request was not made by a session which was created by logging in on the website
app_name_reserved      | 400         | The requested app name is reserved for the pixeldrain website
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/session</summary>
<div>

### Description

Returns all the active sessions of the account. Use this to check for sessions
which should not be there.

Only sessions which were created by logging in on the website can list the
account's keys.

### Returns

HTTP 200: OK
```
[
	{
		"auth_key": "550e8400-e29b-41d4-a716-446655440000",
		"creation_ip_address": "192.0.2.1",
		"user_agent": "Mozilla/5.0 ...",
		"app_name": "",
		"creation_time": "2024-02-04T18:34:13.466276Z",
		"last_used_time": "2024-02-04T18:34:13.466276Z"
	}
]
```

#### Possible errors

Value                  | HTTP status | Description
-----------------------|-------------|----------------------------------------------------------------
website_login_required | 403         | The request was not made by a session which was created by logging in on the website
</div>
</details>

<details class="api_doc_details request_delete">
<summary><span class="method">DELETE</span>/user/session</summary>
<div>

### Description

Invalidates the API key which was used to make this request. This is the
logout endpoint.

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/user/session/set_cookie</summary>
<div>

### Description

Saves an API key as a login cookie in the browser. This is used by the website
to transfer a login session from one pixeldrain domain to another. This
endpoint does not use the regular API key authentication, instead the key is
passed as a URL parameter. As a security measure this only works from the same
IP address which created the API key.

### Parameters

Param   | Required | Location | Description
--------|----------|----------|---------------
api_key | true     | URL      | The API key to save in the pd_auth_key cookie

### Returns

HTTP 200: OK, with a Set-Cookie header containing the API key.
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

#### Possible errors

Value                 | HTTP status | Description
----------------------|-------------|----------------------------------------------------------------
authentication_failed | 401         | The API key does not exist
invalid_key_ip        | 401         | The request came from a different IP address than the one which created the API key
</div>
</details>

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/user/totp</summary>
<div>

### Description

Manages two-factor authentication on the account. The form parameter `action`
selects the operation to perform.

Only sessions which were created by logging in on the website can manage
two-factor authentication, an API key can't enable or disable it.

### Action generate

Generates a new TOTP secret. The secret is not saved to the account yet, use
the verify action to enable it. The `uri` field can be rendered as a QR code
for authenticator apps.

HTTP 200: OK
```
{
	"secret": "ABCDEFGHIJKLMNOP23456789ABCDEF23",
	"uri": "otpauth://totp/Pixeldrain:some_user?algorithm=SHA1&digits=6&issuer=Pixeldrain&period=30&secret=ABCDEFGHIJKLMNOP23456789ABCDEF23"
}
```

### Action verify

Verifies a one-time password against the generated secret and enables
two-factor authentication on the account.

Param  | Type   | Required | Description
-------|--------|----------|----------------------------
action | enum   | true     | 'verify'
secret | string | true     | The secret from the generate action
otp    | string | true     | The current six digit code from your authenticator app

### Action delete

Disables two-factor authentication on the account.

### Returns

HTTP 200: OK
```
{
	"success": true,
	"value": "ok",
	"message": "The requested action was successfully performed"
}
```

#### Possible errors

Value                  | HTTP status | Description
-----------------------|-------------|----------------------------------------------------------------
otp_incorrect          | 400         | The entered one-time password does not match the secret
enum_parse_failed      | 422         | The action is not 'generate', 'verify' or 'delete'
website_login_required | 403         | The request was not made by a session which was created by logging in on the website
</div>
</details>
