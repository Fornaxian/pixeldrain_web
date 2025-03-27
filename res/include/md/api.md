# API documentation

Methods for using pixeldrain programmatically.

## Authentication

All methods which create, modify or delete a resource require an API key. API
keys can be obtained from your user account's [API keys page](/user/api_keys).

To use the API key you need to enter it in the password field of [HTTP Basic
Access
Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication). The
username field does not matter, it can be empty or anything else.

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

## PowerShell example
**PowerShell 7+ required**
```powershell
$FilePath = ".\file_name.txt"
$PIXELDRAIN_API_KEY=5f45f184-64bb-4eaa-be19-4a5f0459db49
$EncodedKey = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(":PIXELDRAIN_API_KEY"))

$Headers = @{
  Authorization = "Basic $EncodedKey"
}

$File = Get-Item($FilePath)

$Form = @{
  name = $File.Name;
  file = $File
}

Invoke-WebRequest -Uri "https://pixeldrain.com/api/file" -Headers $Headers -Method "Post" -Form $Form
```

## Form value order

I recommend you put files at the end of every file upload form. By doing this
the pixeldrain server can respond to malformed requests before the file upload
finishes and this may save you a lot of time and bandwidth when uploading large
files. Make sure your HTTP client has support for premature responses,
pixeldrain uses them a lot. If the server responds before your request is
finished it will always indicate an error and you may abort the connection.


{{template "api_file.md"}}
{{template "api_list.md"}}
{{template "api_user.md"}}
