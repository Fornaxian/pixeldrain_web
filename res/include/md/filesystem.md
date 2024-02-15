# Filesystem Guide

Pixeldrain has an experimental filesystem feature. It can be accessed from any
account with a paid subscription (Patreon or Prepaid) by going to
[pixeldrain.com/d/me](/d/me).

 * **IMPORTANT**: The filesystem is *experimental*. This means that it's not
   finished yet. While the filesystem seems stable now and I am using it
   personally too, you are strongly advised to keep backups of anything you
   upload there.
 * If you experience any issues while using the filesystem, feel free to discuss
   them on [the Discord community](https://discord.gg/pixeldrain).

Contents:

 * [Pricing](#pricing)
 * [Directory sharing](#directory-sharing)
 * [Limits](#limits)
 * [Importing files](#importing-files)
 * [Client integrations](#client-integrations)
   * [Rclone](#rclone)
   * [FTPS](#ftps)

## Pricing

Every time you create or remove a file your account's storage usage will be
updated. This can take some time. If your account's storage is full you will no
longer be able to upload anything to the filesystem.

The Pro subscription has a storage limit of 2 TB. It doesn't show on the profile
page because it's calculated differently from the other plans, but it is there.

For Prepaid plans the storage is charged at €4 per TB per month. You can view
your usage in the [transaction log](/user/prepaid/transactions).

**All bandwidth used from the filesystem is charged**, there are no free
downloads from the filesystem. This means that any time you or anyone else
downloads something from a directory owned by your account that bandwidth usage
will be counted and charged at a rate of €2 per TB. It also means that you will
not be able to access your files if your account reaches its bandwidth limit.
Your only options then are to upgrade or wait for your transfer cap to free up
again.

## Directory sharing

Files in the the filesystem are private by default. Only you can access them
from your own account. Files and directories can be shared by clicking the
`Share` button in the toolbar while inside the directory, or by clicking the
pencil icon next to the directory in the file viewer.

Shared directories and files will have a shared icon next to them in the file
manager. Clicking that icon will open the shared link. You can also copy the
shared link directly with the `Copy link` button in the toolbar.

If a shared file gets reported for breaking the [content policy](/abuse) your
ability to share files from your account may be taken away.

## Limits

Here is a quick overview of the filesystem's limits:

 * Max 10000 files per directory
 * Max file size is 100 GB
 * File/directory names can be up to 255 characters long
 * Path names can be up to 4095 characters long
 * You can have a maximum of 64 nested directories
 * The filesystem does not support hard or symbolic links, this might change
   later

When traversing a path, pixeldrain requests one directory at a time from the
database. This means that filesystem operations will get slower the more nested
directories you have. Keep that in mind when organizing your files.

## Importing files

It's possible to import files from your account's file list to your filesystem.
To do so, navigate to a directory in your filesystem, click the `Import files`
button on the toolbar. It's on the right side, between the `Create directory`
and `Edit files` buttons. You will be prompted to select the files you would
like to import. After selecting the files click `Add` and they will be added to
your filesystem.

## Client integrations

There are two ways to access your filesystem from outside the web interface.

### Rclone

I have built a custom rclone backend to integrate with the filesystem. It can be
found [on my GitHub](https://github.com/Fornaxian/rclone). To use it you will
have to compile the project yourself. I will keep this fork in sync until the
changes are merged into the real rclone. I have a [pull
request](https://github.com/rclone/rclone/pull/7460) open with the master repo,
but it has not been accepted yet.

### FTPS

The filesystem also supports FTPS, both anonymously and with an account. The FTP
server is hosted at `pixeldrain.com` on port `990`. The encryption mode used is
`Implicit FTP over TLS`. Here is an example configuration in FileZilla:

![FTP configuration](/res/img/misc/ftp_login.webp)

There are two different ways to log in to the FTP server:

#### Read-write personal directory

To connect to your personal directory you need to enter your account's username
as username in the FTP client. The password needs to be an API key from the [API
keys page](/user/api_keys). If you connect now you will be able to access your
personal directory (called `/me`). Here you can upload and download to your
heart's desire.

#### Read-only shared directory

To access a shared directory in read-only mode you need to enter the directory
ID as username in your FTP client. The directory ID can be found at the end of a
shared directory URL. Example: `https://pixeldrain.com/d/abcd1234`, in this case
`abcd1234` is the directory ID. The ID will always be 8 characters long and is
case-sensitive. The password must be left empty
