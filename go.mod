module fornaxian.com/pixeldrain-web

go 1.14

replace (
	fornaxian.com/pd_database => ../pd_database
	fornaxian.com/pixeldrain-api => ../pixeldrain-api
	fornaxian.com/pixeldrain-web => ../pixeldrain-web
	fornaxian.com/pixelstore => ../pixelstore
)

require (
	fornaxian.com/pixeldrain-api v0.0.0-20200607143707-5b697aff6c1e
	github.com/Fornaxian/config v0.0.0-20180915150834-ac41cf746a70
	github.com/Fornaxian/log v0.0.0-20190617093801-1c7ce9a7c9b3
	github.com/Fornaxian/pd_mime_type v0.0.0-20200204165508-2815edf3a145
	github.com/google/uuid v1.1.1
	github.com/julienschmidt/httprouter v1.3.0
	github.com/microcosm-cc/bluemonday v1.0.2
	github.com/russross/blackfriday/v2 v2.0.1
	github.com/shurcooL/sanitized_anchor_name v1.0.0 // indirect
)
