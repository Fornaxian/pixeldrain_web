# Questions and Answers

[TOC]

## For how long will my files be stored?

Files will be removed if they have not been viewed for 120 days. A view is
counted when someone visits the file's download page (pixeldrain.com/u/somefile)
or views the file through a list the file is included in
(pixeldrain.com/l/somelist).

If you upload a file while logged into your pixeldrain account you will be able
to delete the file yourself from the download page of the file. If you are not
logged in and you accidentally upload something you shouldn't have, just don't
share the link. The file will expire eventually. File links are not indexed or
published anywhere. As long as you don't share it nobody will see it.

## What cookies does pixeldrain use?

When logging in to a pixeldrain account a cookie named 'pd_auth_key' will be
installed. This cookie keeps your login session active. When you delete it you
will be logged out of your account.

When you use the style selector on the [Appearance](/appearance) page a cookie
called 'style' will be set. This cookie controls the appearance of the website
for you.

When uploading a file pixeldrain will save a list of file links on your
browser's local storage. This data is **only** used for viewing your upload
history on the [history page](/history).

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
