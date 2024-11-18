# Acknowledgements

## Software used

 * [Go](https://golang.org/)
 * [ScyllaDB](https://www.scylladb.com/)
 * [Nginx](https://www.nginx.com/)
 * [Ubuntu Server edition](https://ubuntu.com/)
 * [Debian](https://www.debian.org/)

## Programming libraries

 * [scylladb/gocql](https://github.com/scylladb/gocql) (database communication)
 * [scylladb/gocqlx](https://github.com/scylladb/gocqlx) (database communication)
 * [BurntSushi/toml](https://github.com/BurntSushi/toml) (server configuration)
 * [klauspost/reedsolomon](https://github.com/klauspost/reedsolomon) (reed-solomon erasure coding)
 * [julienschmidt/httprouter](https://github.com/julienschmidt/httprouter) (request routing)
 * [gabriel-vasile/mimetype](https://github.com/gabriel-vasile/mimetype) (MIME type detection)
 * [disintegration/imaging](https://github.com/disintegration/imaging) (image thumbnail generation)
 * [ffmpeg](https://ffmpeg.org/) (video thumbnail generation)
 * [gorilla/websocket](https://github.com/gorilla/websocket) (websocket support on file viewer)
 * [shopspring/decimal](https://github.com/shopspring/decimal) (currency handling)
 * [jhillyerd/enmime](https://github.com/jhillyerd/enmime) (e-mail parser)
 * [russross/blackfriday](https://github.com/russross/blackfriday) (markdown renderer)
 * [microcosm-cc/bluemonday](https://github.com/microcosm-cc/bluemonday) (HTML sanitizer)
 * [j-muller/go-torrent-parser](https://github.com/j-muller/go-torrent-parser) (torrent file parser)

### Web framework

 * [Svelte](https://svelte.dev/)

## Other resources

 * [The map image](/res/img/map.webp) on the home page is from [Wikimedia
   Commons](https://en.wikipedia.org/wiki/File:A_large_blank_world_map_with_oceans_marked_in_blue.PNG)
   and is licensed under the GNU Free Documentation License.
 * [The background image](/res/img/inflating_star.webp) on the home page is by
   [NASA Goddard](https://images.nasa.gov/details-GSFC_20171208_Archive_e000383)
   and is [allowed to be used
   commercially](https://www.nasa.gov/nasa-brand-center/images-and-media/).

## Security work

 * 2020-12-06 Security researcher Arian Firoozfar reported a cross-site
   scripting vulnerability on the file viewer page. The issue was fixed the
   following day. On the 26th another XSS vulnerability was found on the account
   settings page, it was fixed later that day.

 * 2017-12-04 Security researcher Hangyi reported a cross-site scripting
   vulnerability on the file viewer page. The issue was fixed on the 6th.

If you have discovered a security issue in pixeldrain please disclose it
responsibly at [support@pixeldrain.com](mailto:support@pixeldrain.com). We do
not have a bug bounty program.
