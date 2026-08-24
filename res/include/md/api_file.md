## File Methods

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/file</summary>
<div>

### Description

Upload a file. I recommend that you use the PUT API instead of the POST API.
It's easier to use and the multipart encoding of the POST API can cause
performance issues in certain environments.

This API requires authentication with an API key. Anonymous uploading is not
supported.

### Parameters

Param | Type           | Required | Maximum Size                 | Default             | Description
------|----------------|----------|------------------------------|---------------------|----------------------------
name  | string         | false    | 255 characters               | multipart file name | Name of the file to upload
file  | multipart file | true     | Depends on user subscription | none                | File to upload

### Returns

HTTP 201: Created
```
{
	"success": true,
	"id": "abc123" // ID of the newly uploaded file
}
```

Example error:

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "no_file",
	"message": "The file does not exist or is empty"
}
```

#### Possible errors

Value                             | HTTP status | Description
----------------------------------|-------------|----------------------------------------------------------------
authentication_required           | 401         | No API key was provided, uploading requires an account
no_file                           | 422         | The file does not exist or is empty
file_too_large                    | 413         | The file is larger than your plan's file size limit
missing_field                     | 400         | The file has no name, see `extra.field`
string_out_of_range               | 422         | The file name is longer than 255 characters
name_contains_illegal_character   | 422         | The file name contains characters which are not allowed, see `extra.illegal_chars`
error_reading_input               | 400         | The upload was interrupted before it completed
too_many_files                    | 400         | Your account holds more files than the per-account limit
user_out_of_space                 | 400         | Your account has run out of storage space
email_address_not_verified        | 403         | Your account does not have a verified e-mail address yet
ip_banned                         | 403         | Your IP address has been banned for violating the content policy
account_banned                    | 403         | Your account has been banned for violating the content policy
writing                           | 500         | Failed to write the file to disk, the server may be out of storage space
internal                          | 500         | An internal server error occurred
</div>
</details>

<details class="api_doc_details request_put">
<summary><span class="method">PUT</span>/file/{name}</summary>
<div>

### Description

Upload a file. The file should be sent as the raw request body, do not use
multipart form encoding here. If you want to use form encoding use the POST API
instead.

This API requires authentication with an API key. Anonymous uploading is not
supported.

### Parameters

Param | Type   | Required | Location     | Maximum Size                 | Default | Description
------|--------|----------|--------------|------------------------------|---------|----------------------------
name  | string | true     | URL          | 255 characters               | none    | Name of the file to upload
file  | file   | true     | request body | Depends on user subscription | none    | File to upload

### Returns

On success the full file info is returned, this is the same structure as the
GET /file/{id}/info response.

HTTP 201: Created
```
{
	"success": true,
	"id": "abc123", // ID of the newly uploaded file
	"name": "file_name.txt",
	"size": 123456,
	... // Remaining file info fields, see GET /file/{id}/info
}
```

Example error:

HTTP 413: Payload Too Large
```
{
	"success": false,
	"value": "file_too_large",
	"message": "The file you tried to upload is too large"
}
```

#### Possible errors

Value                             | HTTP status | Description
----------------------------------|-------------|----------------------------------------------------------------
authentication_required           | 401         | No API key was provided, uploading requires an account
invalid_content_type              | 400         | You sent multipart form data, use the POST endpoint for form uploads
file_too_large                    | 413         | The file is larger than your plan's file size limit
missing_field                     | 400         | The file has no name, see `extra.field`
string_out_of_range               | 422         | The file name is longer than 255 characters
name_contains_illegal_character   | 422         | The file name contains characters which are not allowed, see `extra.illegal_chars`
error_reading_input               | 400         | The upload was interrupted before it completed
too_many_files                    | 400         | Your account holds more files than the per-account limit
user_out_of_space                 | 400         | Your account has run out of storage space
email_address_not_verified        | 403         | Your account does not have a verified e-mail address yet
ip_banned                         | 403         | Your IP address has been banned for violating the content policy
account_banned                    | 403         | Your account has been banned for violating the content policy
writing                           | 500         | Failed to write the file to disk, the server may be out of storage space
internal                          | 500         | An internal server error occurred
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}</summary>
<div>

### Description

Returns the full file associated with the ID. Supports byte range requests.

You can also download multiple files at once by separating the IDs with commas
in the URL. The files will then be served as a zip archive.

When '?download' is added to the URL the server will send an attachment header
instead of inline rendering, which causes the browser to show a 'Save File'
dialog.

Warning: If a file is using too much bandwidth it can be rate limited. The rate
limit will be enabled if a file has three times more downloads than views. The
owner of a file can always download it. When a file is rate limited the user
will need to fill out a captcha in order to continue downloading the file. The
captcha will only appear on the file viewer page (pixeldrain.com/u/{id}). Rate
limiting has been added to prevent the spread of viruses and to stop hotlinking.
Hotlinking is only allowed when either the uploader or the downloader has a
premium subscription.

Free downloads are also subject to limits on the number of downloads, the
amount of data transferred and the number of simultaneous connections per IP
address. When one of these limits is hit the download fails with one of the
errors listed below. Most of these restrictions can be lifted by completing a
captcha on the download page, or by getting a premium subscription.

### Parameters

Param              | Required | Location | Description
-------------------|----------|----------|------------------------------------------
id                 | true     | URL      | ID of the file to request
download           | false    | URL      | Sends attachment header instead of inline
recaptcha_response | false    | URL      | Captcha response token, lifts captcha-based download restrictions

### Returns

```
HTTP 200: OK

Requested file data
```

Example error:

HTTP 403: Forbidden
```
{
	"success": false,
	"value": "file_rate_limited_captcha_required",
	"message": "We have detected the use of hotlinking for this file. Hotlinking is only supported when either the uploader or the downloader has a paid subscription"
}
```

#### Possible errors

Value                                  | HTTP status | Description
---------------------------------------|-------------|----------------------------------------------------------------
not_found                              | 404         | The file does not exist. For multi-file requests `extra.file` contains the ID which was not found
file_rate_limited_captcha_required     | 403         | The file is rate limited, complete the captcha on the download page to continue
virus_detected_captcha_required        | 403         | The file has been marked as malware, complete the captcha on the download page to continue
hotlink_detected                       | 403         | Hotlinking was detected, hotlinking is only allowed with a premium subscription
ip_download_limited_captcha_required   | 403         | Your IP address made too many download requests in the last 24 hours, wait or complete a captcha
max_concurrent_downloads               | 403         | Too many simultaneous download connections from your IP address, wait for other downloads to finish
transfer_limit_exceeded                | 403         | You have exceeded the free transfer limit, upgrade to premium to continue downloading
download_limit_exceeded                | 403         | You have exceeded the free download limit, upgrade to premium to continue downloading
unavailable_for_legal_reasons          | 451         | The file received a takedown report and cannot be downloaded, see `extra.type`
recpatcha_failed                       | 424         | The submitted captcha response token could not be verified
internal                               | 500         | An internal server error occurred
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}/info</summary>
<div>

### Description

Returns information about one or more files. You can also put a comma separated
list of file IDs in the URL and it will return an array of file info, instead of
a single object. There's a limit of 100 files per request. Files which do not
exist are left out of the array, the request only fails with not_found if
none of the requested files exist.

### Parameters

Param | Required | Location | Description
------|----------|----------|---------------
id    | true     | URL      | ID of the file

### Returns

HTTP 200: OK
```
{
	"success": true,
	"id": "1234abcd",
	"name": "screenshot.png",
	// Size of the file in bytes
	"size": 5694837,
	// Number of unique file views, views are counted once per IP address
	"views": 1234,
	// Total bandwidth usage of the file
	"bandwidth_used": 1234567890,
	// Premium bandwidth usage, from users with a Pro subscription or bandwidth sharing
	"bandwidth_used_paid": 1234567890,
	// Unique downloads per IP address
	"downloads": 1234,
	"date_upload": "2020-02-04T18:34:05.706801Z",
	"date_last_view": "2020-02-04T18:34:05.706801Z",
	"mime_type": "image/png",
	// Link to a thumbnail of this file
	"thumbnail_href": "/file/1234abcd/thumbnail",
	// SHA256 sum of the file, encoded in hexadecimal
	"hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	// When the delete_after_date or delete_after_downloads options are used
	// these fields show when the file will be deleted
	"delete_after_date": "0001-01-01T00:00:00Z",
	"delete_after_downloads": 0,
	// Availability indicates whether downloading is restricted. It's empty if
	// the file can be downloaded normally, else it contains one of the file
	// download error codes and availability_message contains an explanation
	"availability": "",
	"availability_message": "",
	// If the file received an abuse report these fields contain the type of
	// report and the name of the reporting organization
	"abuse_type": "",
	"abuse_reporter_name": "",
	// If the current logged in user can edit or download the file
	"can_edit": true,
	"can_download": true,
	// Whether advertisements are shown on the download page of this file
	"show_ads": false,
	// Whether the video player is available for this file
	"allow_video_player": true,
	// Download speed limit in bytes per second, 0 means no limit
	"download_speed_limit": 0
}
```

#### Possible errors

Value                 | HTTP status | Description
----------------------|-------------|----------------------------------------------------------------
not_found             | 404         | None of the requested files exist
string_out_of_range   | 422         | More than 100 file IDs were requested at once
internal              | 500         | An internal server error occurred
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}/thumbnail?width=x&height=x</summary>
<div>

### Description

Returns a PNG thumbnail image representing the file. The thumbnail image will be
256x256 px by default. You can specify the width and height with parameters in
the URL. The width and height parameters need to be a multiple of 16 between 16
and 256. So the allowed values are 16, 32, 48, 64, 80, 96, 112, 128, 144, 160,
176, 192, 208, 224, 240 and 256. If a thumbnail cannot be generated for the
file you will get an image representing the type of the file instead.

### Parameters

Param  | Required | Location | Description
-------|----------|----------|--------------------------------------
id     | true     | URL      | ID of the file to get a thumbnail for
width  | false    | URL      | Width of the thumbnail image
height | false    | URL      | Height of the thumbnail image

### Returns

A PNG image if a thumbnail can be generated. If a thumbnail cannot be generated
you will get an icon representing the mime type of the file instead.

#### Possible errors

Value                    | HTTP status | Description
-------------------------|-------------|----------------------------------------------------------------
not_found                | 404         | The file does not exist
invalid_thumbnail_size   | 400         | The width or height is not a multiple of 16 between 16 and 256
internal                 | 500         | An internal server error occurred
</div>
</details>

<details class="api_doc_details request_delete">
<summary><span class="method">DELETE</span>/file/{id}</summary>
<div>

### Description

Deletes a file. Only works when the users owns the file.

### Parameters

Param | Required | Location | Description
------|----------|----------|-------------------------
id    | true     | URL      | ID of the file to delete

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

Value       | HTTP status | Description
------------|-------------|----------------------------------------------------------------
not_found   | 404         | The file does not exist
forbidden   | 403         | You are not logged in or this is not your file
internal    | 500         | An internal server error occurred
</div>
</details>
