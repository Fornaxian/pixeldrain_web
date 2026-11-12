# API documentation

Methods for using pixeldrain programmatically.

## Authentication

All methods which create, modify or delete a resource require an API key. API
keys can be obtained from your user account's [API keys page](/user/api_keys).

To use the API key you need to enter it in the password field of [HTTP Basic
Access
Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication). The
username field does not matter, it can be empty or anything else. A key can
also be sent as a bearer token: `Authorization: Bearer <api_key>`.

A key has [permissions](#api-key-permissions). An endpoint which needs a
permission the key does not have fails with `key_permission_denied` (403).

Example usage in JavaScript:

```js
const resp = await fetch(
	"https://pixeldrain.com/api/user/files",
	headers: {
		"Authorization": "Basic "+btoa(":"+api_key),
		// The btoa function encodes the key to Base64
	},
)
if(resp.status >= 400) {
	throw new Error(await resp.json())
}
result = await resp.json()
```

Some JSON responses include fields which end in "_href" (some people don't know
this, but "href" stands for "Hypertext Reference", the more you know). These
point to different places in the API, which you can retrieve with a GET request.
The path is to be appended to the API URL, so "/file/someid/thumbnail" becomes
"{{apiUrl}}/file/someid/thumbnail".

The base URL for the API is "{{apiUrl}}", all paths below are relative to that
URL.

## curl example

To upload files to pixeldrain you will need an API key. Get an API key from the
[API keys page](/user/api_keys) and enter it in the command. Replace the example
API key here with your own:

`curl -T "file_name.txt" -u :5f45f184-64bb-4eaa-be19-4a5f0459db49
https://pixeldrain.com/api/file/`

## Response format

Every API endpoint which does not return raw file data responds with JSON. A
JSON response always contains a `success` field. When a request fails (the HTTP
status code is 400 or higher) the response also contains a `value` field with a
machine-readable error code and a `message` field with a human-readable
explanation of what went wrong:

```
HTTP 404: Not Found
{
	"success": false,
	"value": "not_found",
	"message": "The entity you requested could not be found"
}
```

The `message` text can change between versions of the API, the `value` code is
stable. Use `value` when handling errors programmatically.

Some errors contain an `extra` object with additional information about the
error, like which form field caused it:

```
HTTP 400: Bad Request
{
	"success": false,
	"value": "missing_field",
	"message": "A required field was not sent with this request. See extra for more information",
	"extra": {
		"field": "name"
	}
}
```

### Multiple errors

Endpoints which validate multiple form fields can return more than one error in
a single response. In that case the `value` is multiple_errors and the
response contains an `errors` array. Each element of the array is a normal
error object as described above:

```
HTTP 400: Bad Request
{
	"success": false,
	"value": "multiple_errors",
	"message": "This API endpoint can return multiple errors which need to be checked individually. See the errors array",
	"errors": [
		{
			"success": false,
			"value": "string_out_of_range",
			"message": "A string parameter you passed was either too short or too long",
			"extra": {
				"field": "name",
				"min_len": 1,
				"max_len": 255,
				"len": 300
			}
		},
		{
			"success": false,
			"value": "missing_field",
			"message": "A required field was not sent with this request. See extra for more information",
			"extra": {
				"field": "file"
			}
		}
	]
}
```

The HTTP status of a multiple_errors response is 400, unless one of the
contained errors is a server error, then it's elevated to 500.

## Error codes

These error codes can be returned by any API endpoint. Errors which only apply
to a specific endpoint are documented with that endpoint.

### General errors

Value                       | HTTP status | Description
----------------------------|-------------|----------------------------------------------------------------
internal                    | 500         | Something went wrong on the server side, try again later
api_not_implemented         | 501         | This API does not exist yet
not_found                   | 404         | The entity you requested could not be found
invalid_endpoint            | 404         | The API endpoint you requested does not exist, check the URL for errors
resource_already_exists     | 400         | The resource could not be created because it already exists
websocket_endpoint          | 400         | This is a websocket endpoint, pass the 'Upgrade: websocket' header to upgrade the connection
ip_rate_limit_reached       | 429         | Your IP address has reached a limit for this action, try again later
network_error               | 400         | An error occurred while transmitting the response
read_only_mode_enabled      | 503         | The server is in read-only mode, writing is temporarily disabled
multiple_errors             | 400 / 500   | Multiple errors occurred, see the `errors` array in the response

### Input validation errors

These errors are returned when a request contains invalid input. Where possible
the `extra` object contains a `field` key with the name of the offending form
field.

Value                              | HTTP status | Description
-----------------------------------|-------------|----------------------------------------------------------------
missing_field                      | 400         | A required field was not sent with the request, see `extra.field`
json_parse_failed                  | 422         | The JSON object in the request body could not be parsed
base64_parse_failed                | 422         | The base64 object in the request body could not be parsed
bool_parse_failed                  | 422         | Failed to parse a boolean value, allowed values are 'true' and 'false'
integer_parse_failed               | 422         | An integer parameter could not be parsed
integer_out_of_range               | 422         | An integer parameter was either too high or too low, see `extra.min_val` and `extra.max_val`
string_out_of_range                | 422         | A string parameter was either too short or too long, see `extra.min_len` and `extra.max_len`
utf8_string_parse_failed           | 422         | A string parameter contains invalid UTF-8 data
time_parse_failed                  | 422         | A time parameter was not formatted correctly, time should be in RFC 3339 format
enum_parse_failed                  | 422         | A string parameter did not contain an allowed value, see `extra.allowed_values`
uuid_parse_failed                  | 422         | A UUID parameter was not formatted correctly
hex_parse_failed                   | 422         | A hexadecimal parameter was not formatted correctly
address_parse_failed               | 422         | A network address parameter was not formatted correctly
error_reading_input                | 400         | The values you sent could not be read on the server side, try again
incorrect_order_of_form_parts      | 400         | This API requires form parameters to be ordered the way they are documented
recpatcha_failed                   | 424         | The captcha response could not be verified
invalid_email_address              | 400         | The e-mail address entered is not valid
field_contains_illegal_character   | 400         | A string parameter contains a disallowed character, see `extra.char` and `extra.char_position`
invalid_file_type                  | 400         | The file you submitted is not of the right type
invalid_x509_keypair               | 400         | Failed to parse the provided x509 keypair

### Authentication errors

Value                     | HTTP status | Description
--------------------------|-------------|----------------------------------------------------------------
authentication_required   | 401         | This request requires an API key, see the Authentication chapter
authentication_failed     | 401         | The provided API key is invalid, has been revoked or has expired
forbidden                 | 403         | You are not authorized to execute this request
user_not_found            | 404         | User with this name or e-mail address does not exist
password_incorrect        | 400         | The entered password is not correct for this user
otp_incorrect             | 400         | The entered one-time password is not correct for this user
otp_required              | 400         | A one-time password is required to log in to this account

### File upload errors

Value                             | HTTP status | Description
----------------------------------|-------------|----------------------------------------------------------------
no_file                           | 422         | The file does not exist or is empty
file_too_large                    | 413         | The file you tried to upload is larger than your plan allows
writing                           | 500         | Something went wrong while writing the file to disk, the server may be out of storage space
name_contains_illegal_character   | 422         | The file name contains characters which are not allowed in file names, see `extra.illegal_chars`
invalid_content_type              | 400         | You sent multipart form data to the PUT endpoint, use the POST endpoint for form uploads
ip_banned                         | 403         | This IP address has been banned from using pixeldrain for violating the content policy
account_banned                    | 403         | This user account has been banned from using pixeldrain for violating the content policy
user_out_of_space                 | 400         | Your account has run out of storage space, upgrade to a higher plan to continue uploading
too_many_files                    | 400         | You have too many files on your account, delete some old files or switch to the filesystem

### File download errors

Value                                  | HTTP status | Description
---------------------------------------|-------------|----------------------------------------------------------------
file_rate_limited_captcha_required     | 403         | Hotlinking was detected for this file, a captcha is required to continue downloading. The captcha entry is available on the download page
virus_detected_captcha_required        | 403         | This file has been marked as malware, a captcha is required to download it. The captcha entry is available on the download page
hotlink_detected                       | 403         | Hotlinking was detected for this download, hotlinking is only allowed on premium accounts
ip_download_limited_captcha_required   | 403         | Your IP address made too many download requests in the last 24 hours, wait or complete a captcha
server_overload_captcha_required       | 403         | The servers are under too much stress, free users are asked to complete a captcha before starting new downloads
max_concurrent_downloads               | 403         | You have reached the maximum number of open download connections for free accounts
transfer_limit_exceeded                | 403         | You have exceeded the transfer limit for free users, upgrade to a premium plan to continue downloading
download_limit_exceeded                | 403         | You have exceeded the download limit for free users, upgrade to a premium plan to continue downloading
unavailable_for_legal_reasons          | 451         | This file cannot be downloaded because it has received a takedown report, see `extra.type` for the report type
invalid_referrer                       | 400         | The URL in the Referer header could not be parsed
embed_not_allowed                      | 403         | Embedding this file is not allowed

### Account management errors

Value                           | HTTP status | Description
--------------------------------|-------------|----------------------------------------------------------------
not_enough_credit_for_prepaid   | 400         | To activate a prepaid subscription you need at least €1 on your account
cannot_disable_patreon_sub      | 400         | A Patreon subscription can only be disabled through Patreon itself

{{template "api_file.md"}}
{{template "api_list.md"}}
{{template "api_filesystem.md"}}
{{template "api_user.md"}}
