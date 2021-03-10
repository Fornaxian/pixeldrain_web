module fornaxian.tech/pixeldrain_web

go 1.16

replace (
	fornaxian.tech/pd_database => ../pd_database
	fornaxian.tech/pixeldrain_api_client => ../pixeldrain_api_client
	fornaxian.tech/pixeldrain_server/api => ../pixeldrain_server/api
	fornaxian.tech/pixeldrain_server/database => ../pixeldrain_server/database
	fornaxian.tech/pixeldrain_server/pixelstore => ../pixeldrain_server/pixelstore
	fornaxian.tech/pixeldrain_server/util => ../pixeldrain_server/util
	github.com/gocql/gocql => github.com/scylladb/gocql v1.5.0
)

require (
	fornaxian.tech/pixeldrain_api_client v0.0.0-00010101000000-000000000000
	fornaxian.tech/pixeldrain_server/util v0.0.0-00010101000000-000000000000
	github.com/BurntSushi/toml v0.3.1 // indirect
	github.com/Fornaxian/config v0.0.0-20180915150834-ac41cf746a70
	github.com/Fornaxian/log v0.0.0-20190617093801-1c7ce9a7c9b3
	github.com/Fornaxian/pd_mime_type v0.0.0-20200204165508-2815edf3a145
	github.com/google/uuid v1.2.0
	github.com/julienschmidt/httprouter v1.3.0
	github.com/microcosm-cc/bluemonday v1.0.4
	github.com/russross/blackfriday/v2 v2.1.0
)
