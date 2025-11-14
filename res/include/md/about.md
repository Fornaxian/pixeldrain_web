# Questions and Answers

[TOC]

## For how long will my files be stored?

Files will be removed if they have not been accessed for 120 days. When a file
is downloaded the expiry time is reset to 120 days from the current day. This
only happens when someone downloads more than 10% of the whole file in a single
request. So if you have a 5 GB file the timer is only extended when you download
at least 500 MB. The expiry timer is not updated when it was already updated
within the last 24 hours.

File expiry is often seen as a downside of pixeldrain. But keep in mind that 120
days is a very long time. Roughly four months. This means that you can keep a
file active for an entire year by only downloading it three times. Files which
are only very sporadically downloaded can stay online indefinitely. All this
time the file is using storage space and processing power on our servers, which
costs real money.

If you would like to use pixeldrain for backups or long term storage, then the
free plan is _not the way to go_. It is only meant for publicly sharing files.
For real storage you should use the [pixeldrain filesystem](/filesystem).

If you are (ab)using pixeldrain for free storage, you should not be surprised
when the rules change at some point and all your stuff suddenly disappears. That
would never happen when using pixeldrain's filesystem.

## What cookies does pixeldrain use?

When logging in to a pixeldrain account a cookie named 'pd_auth_key' will be
installed. This cookie keeps your login session active. When you delete it you
will be logged out of your account.

When you use the style selector on the [Appearance](/appearance) page a cookie
called 'style' will be set. This cookie controls the appearance of the website
for you.

Pixeldrain does not use tracking cookies. We also don't use fingerprinting to
track our users. The only information that is saved is the information that you
manually enter or upload.

## How does the transfer limit work?

Pixeldrain has two kinds of transfer limit, the free limit for users without a
subscription and the premium limit for users with a subscription.

### Free

The free limit tracks how much you have downloaded from pixeldrain in the last
24 hours from now. The limit is _not per day_, instead it just keeps track of
when you downloaded something and if it was less than 24 hours ago it counts
towards your limit. In technical terms this is called a 'Sliding window
algorithm'.

The free download limit is only tracked per _IP address_. This means that if you
are sharing an IP address with other people, like through a VPN, company network
or a CGNAT network then the download limit is also shared. For free downloads it
makes no difference if you're logged in to an account or not.

When the limit is exceeded you can still download, but file previews are
disabled and download speed is reduced.

### Premium

The premium transfer limit works similarly to the free download limit. The
differences are that the limit is bound to an account instead of an IP address,
and the limit is per 30 days instead of 24 hours. The same sliding window system
still applies. Any data that was transferred to/from your account between now
and 30 days ago counts towards your limit.

Whenever someone downloads a file from your account it counts toward your
transfer limit. If you want to limit how much of your transfer cap others can
use then you can configure a limit on the [sharing settings
page](/user/sharing).

If the person who downloads the file also has a premium account then their own
data cap will be used first.

## How does hotlinking work?

Hotlinking happens when someone downloads a file from pixeldrain without
visiting the pixeldrain website. This can be through embedding media files on
third party websites, or using download managers to download files directly.

Pixeldrain has a "hotlink protection mode". This activates when we detect that a
file is being hotlinked while neither the downloader nor the uploader of the
file has a premium subscription. When this happens a CAPTCHA test will appear on
the file's download page, and the file can only be downloaded once the CAPTCHA
is solved. When enough people complete the test the hotlink protection will be
removed and the file can be downloaded normally again.

There are two reasons why we implemented hotlink protection:

File hosting services are often used to spread malware and other nefarious data,
hotlink protection makes it significantly harder for people to abuse the service
in this way. This was the original motivation for implementing hotlink
protection, it has been very effective at preventing digital attacks.

Hotlinking also uses pixeldrain's bandwidth and processing power without letting
the user know that they are using pixeldrain. People who don't know that they
are using pixeldrain are less likely to purchase a premium plan. The download
page is our primary source of new customers, we need to make sure it is seen.

## Will premium improve my download speed?

No, the download speed is limited by the stability of the connection between
your computer and pixeldrain's servers. If free downloads are slow (and you have
not exceeded your download limit), then premium will not improve your download
speed. Premium only increases how much you can download, not how fast.

If you want to know your maximum download speed from pixeldrain's servers you
can use our [speedtest](/speedtest). The speedtest will always download at the
fastest speed possible, even if your download limit has been exceeded.

In order to keep pixeldrain affordable we use the cheapest hosting available.
That means that the quality of our network is not always the best. It's possible
that your ISP has a bad connection to our ISP which can cause bottlenecks. We
are always working on improving our connectivity.

## My upload speed to pixeldrain is low. What causes this?

The simple answer is that there's no way to know. There are lots of things that
can affect upload speed. Pixeldrain's servers are optimized to make downloads as
fast as possible, because that is something I can control. With uploads, it's
your computer and your network which control the speed. I can't change that.

Here is a list of things that can cause low upload speeds to pixeldrain. The
list is ordered from issues on your end of the connection to issues on
pixeldrain's end of the connection.

* The software you're using is not optimized for uploading.
* Your operating system is not optimized for uploading (this can be configured
  on Linux, check the guide below).
* Your router or firewall are misconfigured (I have seen issues where the
  firewall caused large delays in uploading because it was inspecting network
  packets). This can also explain cases there uploading to pixeldrain is slower
  than Google Drive for example, as Google Drive is such a popular product that
  many firewalls have built in exclusions for uploads to these servers.
* Your network provider is experiencing network congestion.
* The internet backbone is experiencing issues. This can happen whenever a
  [submarine cable](https://www.submarinecablemap.com/) is destroyed in a
  miliary conflict for example.
* Pixeldrain's network provider is having an outage. In order to reduce costs,
  pixeldrain uses the cheapest bandwidth available. For this reason outages can
  occur more frequently than with more premium connections.
* Pixeldrain's caching servers are overloaded. When there is a large surge in
  traffic to pixeldrain, the cache servers can overload which causes things to
  slow down. You can see the status of the caching servers on the [status
  page](/status).
* Pixeldrain's storage servers are overloaded. When this is the case you'll see
  that the upload hangs at 100% progress for a while. Then the file was
  successfully uploaded to the caching server, but for the upload to complete it
  needs to be transferred to the storage cluster which can take time too.

Here are a few things that you might be able to change in order to make uploads
faster:

### Upload concurrency

Uploading more files at the same time often helps with increasing the speed,
especially when uploading small files.

* Using FTP: With FTP clients you can often choose how many files you would like
  to transfer concurrently. In FileZilla you can set the "Maximum simultaneous
  transfers" to 10 in the settings for example.

* Using rclone: With rclone you can set the number of concurrent transfers with
  the `--transfers 10` command line option. The option to disable HTTP2
  (`--disable-http2`) also improves performance in some cases. This performance
  degradation is caused by [a bug](https://github.com/golang/go/issues/47840) in
  the language rclone is written in.

### TCP buffer size

When uploading files, your computer needs to keep the sent data in memory to
verify that it was received on the other side of the link. The buffers used to
hold this data are set to 16 MiB by default on Linux. Unforunately that is often
too small when sending files over a high latency or high loss connection. The
optimal size for these buffers can be calculated using the [bandwidth-delay
product](https://en.wikipedia.org/wiki/Bandwidth-delay_product) formula. On
pixeldrain servers the buffers are set to 256 MiB, this is a good value for high
speed connections. You can increase the buffer sizes by adding these lines to
`/etc/sysctl.d/sysctl.conf`:

```
net.ipv4.tcp_congestion_control=bbr
net.ipv4.tcp_shrink_window=1
net.ipv4.tcp_wmem=4096 65536 268435456
net.core.wmem_max=268435456
net.ipv4.tcp_rmem=4096 65536 268435456
net.core.rmem_max=268435456
```

After adding the lines, run `sudo sysctl -p` to apply the settings.

For information on what these do, and more network optimization tricks on Linux,
refer to my [network optimization guide](/100_gigabit_ethernet).

## Is pixeldrain available in every country?

I strive to make pixeldrain as accessible as possible to everyone. Pixeldrain
does not block access from any country or network. Some countries have very
restricted internet connectivity though. Pixeldrain has been blocked in some
locations in the past and remains blocked in other locations.

The reasons for blocking pixeldrain are usually not clear. The countries that
block access to pixeldrain rarely specify a reason. When a new block happens I
always reach out to the ISP or government doing the blocking, but these entities
are very hard to reach and they rarely reply. If your ISP blocks pixeldrain
**please call them and ask them why pixeldrain is blocked**. ISPs always listen
better to their own customers than website operators.

I have a survey that you can use to notify me when an ISP blocks access to
pixeldrain. If you are having trouble accessing pixeldrain please [fill out the
survey](https://forms.gle/jThCp5S6xi49w2KP7).

Usually a website block can be circumvented by using a different DNS provider.
The DNS provider is a service that translates website addresses (like
pixeldrain.com) into IP addresses that can be used to connect to a website.
These servers are usually operated by your ISP and can be used to censor or
monitor your browsing.

Pixeldrain also has alternative domain names which might not be blocked. These
are [pixeldrain.net](https://pixeldrain.net) and
[pixeldra.in](https://pixeldra.in). Note that your session cookie is only valid
for one domain name. If you use these alternative domains you will have to log
in to them as well.

### DNS Providers which don't block pixeldrain

You can find a guide for how to change your DNS server on Google. Just search
for 'change dns server windows 11', or whichever operating system you use.

| Provider   | IPv4 addreses            | IPv6 addresses                             |
|------------|--------------------------|--------------------------------------------|
| Cloudflare | 1.1.1.1, 1.0.0.1         | 2606:4700:4700::1111, 2606:4700:4700::1001 |
| Quad9      | 9.9.9.9, 149.112.112.112 | 2620:fe::fe, 2620:fe::9                    |
| Google     | 8.8.8.8, 8.8.4.4         | 2001:4860:4860::8888, 2001:4860:4860::8844 |

### Countries where pixeldrain is blocked

From the availability survey I have gathered that pixeldrain is currently
blocked in the following locations:

 * The Philippines (since 2022-03). I have reached out to PLDT about a dozen
   times but they never answer.
 * Egypt (since 2023-03). I have tried reaching out to WE Telecom, but their
   website is not available outside egypt and their support address is bouncing
   my mails.
 * Italy (since 2024-01). Tried reaching out to their communications office and
   police multiple times, never an answer.
 * India (since 2024-04). Was unable to find a contact address anywhere.

If you live in any of these locations and are having trouble accessing
pixeldrain **please contact your ISP**. I am ready to comply with whatever
demands they have, I just want my website to be accessible again.

### Statement regarding the Italy block

I have been working on the blocking situation in Italy, but there has been no
progress. I have contacted every phone number or e-mail address I could find.
All my e-mails are ignored and half of the phone numbers are out of service and
the other half connect to (very impatient) people who don't speak english.

I do not know what else I can do to make more progress on this situation. I have
exhausted my options. Is there anyone in Italy or who speaks Italian who would
be willing to help? I need to get in contact with the Polizia Postale, which has
been blocking access to pixeldrain.com nationwide for well over a year now.

Not only are they blocking access to the site (which is bad enough), they are
also spreading a terrifying and misleading image of what pixeldrain is being
used for. This is seriously affecting the reputation of my business and myself.
I'd really like to get this resolved. I am also willing to offer a financial
compensation for anyone who can help me get this resolved. If you think you can
help, please contact me [on Discord](https://discord.gg/UDjaBGwr4p). My username
is Fornax.

## Why can't I find pixeldrain links on Google?

Files on pixeldrain used to be searchable with search engines if they were
indexed. People often accidentally got files indexed which were not supposed to
be public. For that reason I disabled search indexing on all pixeldrain files.
This protects the privacy of pixeldrain users and helps with preventing
information leaks.

## How does the affiliate program work?

Pixeldrain's affiliate program is a way to earn pixeldrain credit by driving
traffic to pixeldrain. The way it works is that you send people your affiliate
link, if someone accepts to be your affiliate then their active subscription
will earn you pixeldrain credit. The affiliate program is opt-in and fully
transparent. Users will always be notified when their affiliate account is
updated. You can update who you are sponsoring by editing the affiliate name on
your [user settings page](/user/settings).

Here is a summary of all the rules and limitations:

* Each paying customer using your affiliate code will earn you €0.01 in prepaid
  credit every day. The credit is added to your account on a daily basis, as you
  can see on the [transactions page](/user/prepaid/transactions).
* Sponsoring someone with an affiliate code does not cost you any extra money.
  The resulting fee comes out of pixeldrain's pockets.
* You can only earn pixeldrain credit with the affiliate program. There is no
  cash out feature.
* When someone who is using your affiliate code cancels their plan, you will
  also stop receiving rewards.
* You don't need an active subscription to gain credit through the affiliate
  program. You need a positive balance of at least €1 to activate the prepaid
  plan.

Some fun facts:

* You only need two affiliates to offset pixeldrain's base subscription fee.
* Each sponsoring user is effectively equal to 125 GB of storage space or 500 GB
  of bandwidth usage per month.
* You cannot sponsor yourself.

## Is there a clean pixeldrain logo I can use?

Yes, here's a high resolution pixeldrain logo with text. The font is called
Orbitron, it was designed by Matt McInerney and uses the Open Font License.

<img src="/res/img/pixeldrain_high_res.png" style="max-width: 100%; height: 80px;" /><br/>

And here's a vector version of just the icon:

<img src="/res/img/pixeldrain.svg" style="max-width: 100%; height: 80px;" /><br/>

## Can I advertise on pixeldrain?

No.

## Support

If you have more questions please try asking them in our [support forum on
Discord](https://discord.gg/UDjaBGwr4p). Pixeldrain is a one-man operation, I
can't answer all the e-mails I get. By asking your questions on Discord there's
a chance that someone else can help you. I am also active on Discord myself.
