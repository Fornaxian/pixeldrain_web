# Questions and Answers

## For how long will my files be stored?

Files will be removed if they have not been viewed for 30 days. A view is
counted when someone visits the file's download page (pixeldrain.com/u/somefile)
or views the file through a list the file is included in
(pixeldrain.com/l/somelist).

If you upload a file while logged into your pixeldrain account you will be able
to delete the file yourself from the download page of the file. If you are not
logged in and you accidentally upload something you shouldn't have, just don't
share the link. The file will expire eventually. File links are not indexed or
published anywhere. As long as you don't share it nobody will see it.

## Does pixeldrain cost any money?

No, pixeldrain is completely free at the moment. While there is an advertisement
on the file downloading page, it doesn't generate nearly enough revenue to pay
for maintaining this service. That's why I'd really appreciate it if you could
spare some coins. Possible methods for donating are:

 * <a href="https://www.patreon.com/join/pixeldrain" target="_blank">
	{{template `patreon.svg` .}} Support me on Patreon and get some perks too!
   </a>
 * Bitcoin:
   [1Ne7hGuvnfz9EFTRD3PLWVeaJTX9oA1QUr](bitcoin:1Ne7hGuvnfz9EFTRD3PLWVeaJTX9oA1QUr?label=Pixeldrain%20Donation)
 * BasicAttentionToken: Donate BAT by clicking the BAT icon in your address bar.
   <a href="/brave">Learn more about Brave browser</a>.
 * Siacoin:
   26117c19ca3975b315d663dcbbc19cf9c07274f441689d4392ed380b2337589ef1aacfbdc93f
   (this address points directly at the storage backend. Donations will be used
   for paying storage contracts with Sia hosts)
 * <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WU49A5NHPAZ9G&source=url">
   Donate with PayPal</a>

## Content policy

The following types of content are not allowed to be shared on pixeldrain. They
will be removed when reported.

 * **Copyright violation**: Works which are shared without permission from the
   copyright holder. For copyright reports we need a formal DMCA takedown
   request originating from the copyright holder or a representative. If your
   request is not valid it will be ignored. Takedown requests which are sent to
   any other address than abuse@pixeldrain.com will also be ignored.
 * **Abuse of minors**: Videos, images or audio fragments depicting abuse or
   inappropriate touching of minors will be removed and reported to the National
   Center for Missing and Exploited Children when found.
 * **Terrorism**: Videos, images or audio fragments which promote and
   glorify acts of terrorism.
 * **Gore**: Graphic and shocking videos or images depicting severe harm to
   humans (or animals). I will clarify that I am not strictly against shocking
   content, and it is also not illegal in most places. When a shocking video
   goes viral it often ends up in the wrong places and it can cause mental
   issues for unsuspecting viewers. For that reason I will remove it when it
   gets reported.
 * **Malware and computer viruses**: Software designed to cause harm to computer
   systems.

If you have found content which falls in any of these categories on pixeldrain
please report it _using the report button on the download page_ of the file. Do
not send an e-mail, it will be ignored. When a file has received enough reports
of the same type it will automatically be blocked. I will also manually review
reported files occasionally.

If you have found content which infringes on your copyright you can send a
formal DMCA take-down request to
[abuse@pixeldrain.com](mailto:abuse@pixeldrain.com) and I will review it. In
your e-mail you need to swear under penalty of perjury that you (or your
company) own exclusive rights to the claimed content. Please state the name of
your organisation so the report can be properly categorised.

Fornaxian Technologies cannot be held liable for any illegal or copyrighted
material that's uploaded by the users of this application under the Online
Copyright Infringement Liability Limitation Act § 512\(c) in the USA and the
Electronic Commerce Directive 2000 Article 14 in the EU.

## How does pixeldrain store files?

Pixeldrain uses a few different techniques to store files cheaply, efficiently
and performantly. The servers which accept files from users have a hard disk
drive cache of typically a few terabytes (4 to 16). This is where most of the
files are kept. When a file is requested from another server it will look up
where the file is stored using a lookup table in the shared database. It will
then try to contact that server to request the file and proxy the data directly
to the requesting user.

Each server keeps track of which files are popular with its own userbase. This
includes files which it is not storing locally. It does this using a popularity
score. Every time a request to read a file comes in it will add 1 to the score
of that file. This score will slowly degrade over time. Periodically the server
will request all files with a high popularity score so it can store them locally
to save bandwidth. If there is not enough space available to store these popular
files it will move some less popular files to the next storage medium to make
space available for the more popular files.

The next storage medium is Sia. This is where all the files live which are not
requested frequently, but are still occasionally needed. Sia is a storage
marketplace where anyone can sell their storage space for financial compensation
in Siacoins. If you have storage space available and would like to provide it to
pixeldrain and other services you should read our [Sia hosting
guidelines](/hosting). There we explain which requirements we are setting for
hosts and some handy tips for getting started with hosting.

## Do I need to register an account?

Not if you don't want to. You're free to use pixeldrain completely anonymously.
Without a pixeldrain account you can upload files, download files and create
lists of files. And view your uploaded files on the [history page](/history).
This page only shows files which were uploaded anonymously in this web browser.

By registering an account on pixeldrain you will be able to access your files
from any device with a web browser. Files you upload and lists you create will
be linked to your pixeldrain account and will show up on your [personal home
page](/user).

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

## Support

For other questions you can reach me at
[support@pixeldrain.com](mailto:support@pixeldrain.com). I get a lot more e-mail
than I can reply to, so I will only reply to urgent problems or things which I
deem important. Abuse reports sent to this address will not be reviewed, use the
abuse address.
