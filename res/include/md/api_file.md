## File Methods

<details class="request_post">
<summary><span class="method">POST</span>/file</summary>
<div>

### Description

Upload a file. I recommend that you use the PUT API instead of the POST API.
It's easier to use and the multipart encoding of the POST API can cause
performance issues in certain environments.

### Parameters

Param     | Type           | Required | Maximum Size                 | Default             | Description
----------|----------------|----------|------------------------------|---------------------|-----------------------------------
name      | string         | false    | 255 characters               | multipart file name | Name of the file to upload
anonymous | boolean        | false    | N/A                          | false               | File is not linked to user if true
file      | multipart file | true     | Depends on user subscription | none                | File to upload

### Returns

HTTP 200: OK
```
{
	"success": true,
	"id": "abc123" // ID of the newly uploaded file
}
```

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "no_file",
	"message": "The file does not exist or is empty."
}
```

HTTP 500: Internal Server Error
```
{
	"success": false,
	"value": "internal",
	"message": "An internal server error occurred."
}
```

HTTP 413: Payload Too Large
```
{
	"success": false,
	"value": "file_too_large",
	"message": "The file you tried to upload is too large"
}
```

HTTP 500: Internal Server Error
```
{
	"success": false,
	"value": "writing",
	"message": "Something went wrong while writing the file to disk, the server may be out of storage space."
}
```

HTTP 413: Payload Too Large
```
{
	"success": false,
	"value": "name_too_long",
	"message": "File Name is too long, Max 255 characters allowed."
}
```
</div>
</details>

<details class="request_put">
<summary><span class="method">PUT</span>/file/{name}</summary>
<div>

### Description

Upload a file.

### Parameters

Param     | Type    | Required | Location      | Maximum Size                 | Default | Description
----------|---------|----------|---------------|------------------------------|---------|-----------------------------------
name      | string  | true     | URL           | 255 characters               | none    | Name of the file to upload
anonymous | boolean | false    | URL parameter | N/A                          | false   | File is not linked to user if true
file      | file    | true     | request body  | Depends on user subscription | none    | File to upload

### Returns

HTTP 201: OK
```
{
	"id": "abc123" // ID of the newly uploaded file
}
```

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "no_file",
	"message": "The file does not exist or is empty."
}
```

HTTP 500: Internal Server Error
```
{
	"success": false,
	"value": "internal",
	"message": "An internal server error occurred."
}
```

HTTP 413: Payload Too Large
```
{
	"success": false,
	"value": "file_too_large",
	"message": "The file you tried to upload is too large"
}
```

HTTP 500: Internal Server Error
```
{
	"success": false,
	"value": "writing",
	"message": "Something went wrong while writing the file to disk, the server may be out of storage space."
}
```

HTTP 413: Payload Too Large
```
{
	"success": false,
	"value": "name_too_long",
	"message": "File Name is too long, Max 255 characters allowed."
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}</summary>
<div>

### Description

Returns the full file associated with the ID. Supports byte range requests.

When '?download' is added to the URL the server will send an attachment header
instead of inline rendering, which causes the browser to show a 'Save File'
dialog.

Warning: If a file is using too much bandwidth it can be rate limited. The rate
limit will be enabled if a file has three times more downloads than views. The
owner of a file can always download it. When a file is rate limited the user
will need to fill out a captcha in order to continue downloading the file. The
captcha will only appear on the file viewer page (pixeldrain.com/u/{id}). Rate
limiting has been added to prevent the spread of viruses and to stop hotlinking.
Hotlinking is only allowed when files are uploaded using a Pro account.

Pixeldrain also includes a virus scanner. If a virus has been detected in a file
the user will also have to fill in a captcha to download it.

### Parameters

Param    | Required | Location | Description
---------|----------|----------|------------------------------------------
id       | true     | URL      | ID of the file to request
download | false    | URL      | Sends attachment header instead of inline

### Returns

```
HTTP 200: OK

Requested file data
```

HTTP 404: Not Found
```
{
	"success": false,
	"value": "not_found",
	"message": "The entity you requested could not be found"
}
```

HTTP 403: Forbidden
```
{
	"success": false,
	"value": "file_rate_limited_captcha_required",
	"message": "This file is using too much bandwidth. For anonymous downloads a captcha is required now. The captcha entry is available on the download page"
}
```

HTTP 403: Forbidden
```
{
	"success": false,
	"value": "virus_detected_captcha_required",
	"message": "This file has been marked as malware by our scanning systems. To avoid infecting other systems through automated downloads we require you to enter a captcha. The captcha entry is available on the download page"
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}/info</summary>
<div>

### Description

Returns information about one or more files. You can also put a comma separated
list of file IDs in the URL and it will return an array of file info, instead of
a single object. There's a limit of 1000 files per request.

### Parameters

Param | Required | Location | Description
------|----------|----------|---------------
id    | true     | URL      | ID of the file

### Returns

HTTP 200: OK
```
{
	"id": "1234abcd",
	"name": "screenshot.png",
	// Size of the file in bytes
	"size": 5694837,
	// Number of unique file views, views are counted once per IP address
	"views" 1234,
	// Total bandwidth usage of the file
	"bandwidth_used": 1234567890,
	// Premium bandwidth usage, from users with a Pro subscription or bandwidth sharing
	"bandwidth_used_paid": 1234567890,
	// Unique downloads per IP address
	"downloads": 1234,
	"date_upload": 2020-02-04T18:34:05.706801Z,
	"date_last_view": 2020-02-04T18:34:05.706801Z,
	"mime_type" "image/png",
	// Link to a thumbnail of this file
	"thumbnail_href": "/file/1234abcd/thumbnail"
	// SHA256 sum of the file, encoded in hexadecimal
	"hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	// If the current logged in user can edit the file
	"can_edit": true,
}
```

HTTP 404: Not Found
```
{
	"success": false,
	"value": "file_not_found"
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}/thumbnail?width=x&height=x</summary>
<div>

### Description

Returns a PNG thumbnail image representing the file. The thumbnail image will be
128x128 px by default. You can specify the width and height with parameters in
the URL. The width and height parameters need to be a multiple of 16. So the
allowed values are 16, 32, 48, 64, 80, 96, 112 and 128. If a thumbnail cannot be
generated for the file you will be redirected to a mime type image of 128x128
px.

### Parameters

Param  | Required | Location | Description
-------|----------|----------|--------------------------------------
id     | true     | URL      | ID of the file to get a thumbnail for
width  | false    | URL      | Width of the thumbnail image
height | false    | URL      | Height of the thumbnail image

### Returns

A PNG image if a thumbnail can be generated. If a thumbnail cannot be generated
you will get a 301 redirect to an image representing the type of the file.
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
	"value": "file_deleted",
	"message": "The file has been deleted."
}
```

HTTP 404: Not Found
```
{
	"success": false,
	"value": "file_not_found",
	"message": "File ID was not found in the database."
}
```

HTTP 401: Unauthorized
```
{
	"success": false,
	"value": "unauthorized",
	"message": "You are not logged in."
}
```

HTTP 403: Forbidden
```
{
	"success": false,
	"value": "forbidden",
	"message": "This is not your file."
}
```
</div>
</details>
