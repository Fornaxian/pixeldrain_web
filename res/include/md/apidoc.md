# Pixeldrain API documentation

The methods for uploading and retrieving files don't require an API key. The
methods for creating and retrieving lists also don't require an API key. All
methods which delete or modify a resource **do** require an API key.

API keys can be obtained from the login API.

Some JSON responses include fields which end in "_href" (some people don't know
this, but "href" stands for "Hypertext Reference", the more you know). These
point to different places in the API, which you can retrieve with a GET request.
The path is to be appended to the API URL, so "/file/someid/thumbnail" becomes
"{{apiUrl}}/file/someid/thumbnail".

The base URL for the API is "{{apiUrl}}", all paths below are relative to that
URL.

## Form value order

I recommend you put files at the end of every file upload form. By doing this
the pixeldrain server can respond to malformed requests before the file upload
finishes and this may save you a lot of time and bandwidth when uploading large
files. Make sure your HTTP client has support for premature responses,
pixeldrain uses them a lot. If the server responds before your request is
finished it will always indicate an error and you may abort the connection.

## File Methods

<details class="request_post">
<summary><span class="method">POST</span>/file</summary>
<div>

### Description

Upload a file.

### Parameters

Param     | Type           | Required | Maximum Size   | Default             | Description
----------|----------------|----------|----------------|---------------------|-----------------------------------
name      | string         | false    | 255 characters | multipart file name | Name of the file to upload
anonymous | boolean        | false    | N/A            | false               | File is not linked to user if true
file      | multipart file | true     | 1000^3 bytes   | none                | File to upload

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

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/file/{id}</summary>
<div>

### Description

Returns the full file associated with the ID. Supports byte range requests.

When '?download' is added to the URL the server will send an attachment header
instead of inline rendering, which causes the browser to show a 'Save File'
dialog.

Warning: If a file is using too much bandwidth it can be rate limited. The rate
limit will be enabled if a file has ten times more downloads than views. The
owner of a file can always download it. When a file is rate limited the user
will need to fill out a captcha in order to continue downloading the file. The
captcha will only appear on the file viewer page (pixeldrain.com/u/{id}). Rate
limiting has been added to prevent the spread of viruses and to stop direct
linking.

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
a single object.

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
	"date_upload": 2020-02-04T18:34:05.706801Z,
	"date_last_view": 2020-02-04T18:34:05.706801Z,
	"size": 5694837, // Bytes
	"views" 1234, // Amount of unique file views
	"bandwidth_used": 1234567890, // Bytes
	"mime_type" "image/png",
	"thumbnail_href": "/file/1234abcd/thumbnail" // Link to a thumbnail of this file
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

<!--
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
-->

## List Methods

<details class="api_doc_details request_post">
<summary><span class="method">POST</span>/list</summary>
<div>

### Description

Creates a list of files that can be viewed together on the file viewer page.

### Parameters

POST body should be a JSON object, example below. A list can contain at most
10000 files. If you try to add more the request will fail.

#### Example
```
{
	"title": "My beautiful photos", // Defaults to "Pixeldrain List"
	"anonymous": false / true, // If true this list will not be linked to your user account. Defaults to "false"
	"files": [ // Ordered array of files to add to the list
		{
			"id": "abc123",
			"description": "First photo of the week, such a beautiful valley"
		},
		{
			"id": "123abc",
			"description": "The week went by so quickly, here's a photo from the plane back"
		}
	]
}
```

### Returns

HTTP 200: OK
```
{
	"success": true,
	"id": "yay137" // ID of the newly created list
}
```

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "list_file_not_found",
	"message": "File Oh42No was not found in the database.",
	"extra": {
		"file_not_found": "0h42No" // The file you tried to add with this ID does not exist
	}
}
```

HTTP 413: Payload too large
```
{
	"success": false,
	"value": "too_many_files",
	"message": "This list contains too many files, max 10000 allowed."
}
```

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "json_parse_failed",
	"message": "The JSON object in the request body could not be read."
}
```

HTTP 413: Payload too large
```
{
	"success": false,
	"value": "title_too_long",
	"message": "The title of this list is too long, max 300 characters allowed."
}
```

HTTP 413: Payload too large
```
{
	"success": false,
	"value": "description_too_long",
	"message": "The description of one of the files in the list is too long, max 3000 characters allowed."
}
```

HTTP 422: Unprocessable Entity
```
{
	"success": false,
	"value": "cannot_create_empty_list",
	"message": "You cannot make a list with no files."
}
```
</div>
</details>

<details class="api_doc_details request_get">
<summary><span class="method">GET</span>/list/{id}</summary>
<div>

### Description

Returns information about a file list and the files in it.

### Parameters


Param | Required | Location | Description
------|----------|----------|---------------
id    | true     | URL      | ID of the list

### Returns

The API will return some basic information about every file. Every file also has
a "detail_href" field which contains a URL to the info API of the file. Follow
that link to get more information about the file like size, checksum, mime type,
etc. The address is relative to the API URL and should be appended to the end.

HTTP 200: OK
```
{
	"success": true,
	"id": "L8bhwx",
	"title": "Rust in Peace",
	"date_created": 2020-02-04T18:34:13.466276Z,
	"files": [
		// These structures are the same as the file info response, except for the detail_href and description fields
		{
			"detail_href": "/file/_SqVWi/info",
			"description": "",
			"success": true,
			"id": "_SqVWi",
			"name": "01 Holy Wars... The Punishment Due.mp3",
			"size": 123456,
			"date_created": 2020-02-04T18:34:13.466276Z,
			"date_last_view": 2020-02-04T18:34:13.466276Z,
			"mime_type": "audio/mp3",
			"views": 1,
			"bandwidth_used": 1234567890,
			"thumbnail_href": "/file/_SqVWi/thumbnail"
		},
		{
			"detail_href": "/file/RKwgZb/info",
			"description": "",
			"success": true,
			"id": "RKwgZb",
			"name": "02 Hangar 18.mp3",
			"size": 123456,
			"date_created": 2020-02-04T18:34:13.466276Z,
			"date_last_view": 2020-02-04T18:34:13.466276Z,
			"mime_type": "audio/mp3",
			"views": 2,
			"bandwidth_used": 1234567890,
			"thumbnail_href": "/file/RKwgZb/thumbnail"
		},
		{
			"detail_href": "/file/DRaL_e/info",
			"description": "",
			"success": true,
			"id": "DRaL_e",
			"name": "03 Take No Prisoners.mp3",
			"size": 123456,
			"date_created": 2020-02-04T18:34:13.466276Z,
			"date_last_view": 2020-02-04T18:34:13.466276Z,
			"mime_type": "audio/mp3",
			"views": 3,
			"bandwidth_used": 1234567890,
			"thumbnail_href": "/file/DRaL_e/thumbnail"
		}
	]
}
```

HTTP 404: Not Found
```
{
	"success": false,
	"value": "list_not_found",
}
```
</div>
</details>

<!-- ## Filesystem Methods
<details class="api_doc_details request_post">
	<summary><span class="method">POST</span>/filesystem/{path}</summary>
	<div>
		<h3>Description</h3>
		<p>
			Creates a new directory or uploads a file to an existing directory.
		</p>

		<h3>Parameters</h3>
		<p>
			The form parameters <b>must</b> be sent in the order displayed below
			for the realtime error checking to work. If 'name' comes after
			'file' it will be ignored.
		</p>
		<table>
			<tr>
				<td>Param</td>
				<td>Location</td>
				<td>Description</td>
			</tr>
			<tr>
				<td>type</td>
				<td>Form Values</td>
				<td>The type of node to create, can either be 'directory', or 'file'</td>
			</tr>
			<tr>
				<td>name</td>
				<td>Form Values</td>
				<td>
					Name of the directory to create, or of file to create. Not
					required if 'type' is 'file'
				</td>
			</tr>
			<tr>
				<td>file</td>
				<td>Form Values</td>
				<td>
					Multipart file to upload to the directory. Will be ignored
					if 'type' is 'directory'
				</td>
			</tr>
		</table>

		<h3>Returns</h3>
<pre>HTTP 200: OK
{
	"success": true,
	"id": "abc123" // ID of the newly uploaded file
}</pre>
		todo
	</div>
</details>

<details class="api_doc_details request_get">
	<summary><span class="method">GET</span>/filesystem/{path}</summary>
	<div>
		<h3>Description</h3>
		<p>
			Returns information about the requested path.
		</p>
		<h3>Parameters</h3>
		<table>
			<tr>
				<td>Param</td>
				<td>Required</td>
				<td>Location</td>
				<td>Description</td>
			</tr>
			<tr>
				<td>path</td>
				<td>true</td>
				<td>URL</td>
				<td>Path to the directory or file to request</td>
			</tr>
			<tr>
				<td>download</td>
				<td>false</td>
				<td>URL</td>
				<td>
					If the URL paramater '?download' is passed the requested
					file will be downloaded (if it is a file)
				</td>
			</tr>
		</table>
		<h3>Returns</h3>
		<h4>When the requested entity is a directory:</h4>
		<pre>HTTP 200: OK
{
	"success": true,
	"name": "some dir",
	"path": "/some dir",
	"type": "directory",
	"child_directories": [
		{
			"name": "some other directory",
			"type": "directory",
			"path": "/some dir/some other directory"
		}
	],
	"child_files": [
		{
			"name": "11. Lenny Kravitz - Fly away.ogg",
			"type": "file",
			"path": "/some dir/11. Lenny Kravitz - Fly away.ogg"
		}
	]
}</pre>
		<h4>When the requested entity is a file:</h4>
		<pre>HTTP 200: OK
{
	"success": true,
	"name": "11. Lenny Kravitz - Fly away.ogg",
	"path": "/some dir/11. Lenny Kravitz - Fly away.ogg",
	"type": "file",
	"file_info": {
		"success": true,
		"id": "Jf_u5TI9",
		"name": "11. Lenny Kravitz - Fly away.ogg",
		"date_upload": "2018-07-04T22:24:48Z",
		"date_last_view": "2018-07-04T22:24:48Z",
		"size": 9757269,
		"views": 0,
		"mime_type": "application/ogg",
		"thumbnail_href": "/file/Jf_u5TI9/thumbnail"
	}
}</pre>
	</div>
</details>

<details class="api_doc_details request_delete">
	<summary><span class="method">DELETE</span>/filesystem/{path}</summary>
	<div>
		<h3>Description</h3>
		<p>
			Deletes a filesystem node.
		</p>
		<h3>Parameters</h3>
		<table>
			<tr>
				<td>Param</td>
				<td>Required</td>
				<td>Location</td>
				<td>Description</td>
			</tr>
			<tr>
				<td>path</td>
				<td>true</td>
				<td>URL</td>
				<td>Path of the entity to delete</td>
			</tr>
		</table>
		<h3>Returns</h3>
<pre>HTTP 200: OK
{
	"success": true
}</pre>
	</div>
</details> -->
