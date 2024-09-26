# Filesystem Guide

Pixeldrain has an experimental filesystem feature. It can be accessed from any
account with a paid subscription (Patreon or Prepaid) by going to
[pixeldrain.com/d/me](/d/me).

 * **IMPORTANT**: The filesystem is still in development. This means that it's
   not finished yet. While the filesystem seems stable now and I am using it
   personally too, you are strongly advised to keep backups of anything you
   upload here.
 * If you experience any issues while using the filesystem, feel free to discuss
   them on [the Discord community](https://discord.gg/TWKGvYAFvX).

Contents

[TOC]

## Pricing

Every time you create or remove a file your account's storage usage will be
updated. This can take some time. If your account's storage is full you will no
longer be able to upload anything to the filesystem.

The Pro subscription has a storage limit of 2 TB. It doesn't show on the profile
page because it's calculated differently from the other plans, but it is there.

For Prepaid plans the storage is charged at €4 per TB per month. You can view
your usage in the [transaction log](/user/prepaid/transactions).

Downloads from the filesystem are charged at €2 / TB for prepaid. With Patreon
plans there's a monthly limit. If you turn bandwidth sharing off in the account
settings then other people will use the daily download limit. Otherwise they
will use your account's transfer limit.

## Free download limit

The pixeldrain filesystem uses the same download limit as the regular files on
pixeldrain. The only difference is that the limit is 2 GB higher. So while you
can freely download up to 6 GB per day from regular pixeldrain files, you can
download up to 8 GB per day from the filesystem. When the limit is exceeded the
speed is limited to 1 MiB/s like usual.

If you want to embed pixeldrain files on your own website, distribute direct
download links or share files that are larger than the download limit then you
should turn the 'Bandwidth sharing' option on. Otherwise people will have
trouble downloading your files.

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
 * File/directory names can be up to 255 bytes long
 * Path names can be up to 4095 bytes long
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

Rclone has built in support for the pixeldrain filesystem starting with version
1.68. Check out [the rclone website](https://rclone.org/pixeldrain/) for
documentation. You can install rclone [from the
site](https://rclone.org/downloads/). It's also available in most software
repositories.

A few example use cases of rclone are:

 * Mount pixeldrain as a network drive with [rclone
   mount](https://rclone.org/commands/rclone_mount/) (instructions below)
 * Create a backup of your local storage with [rclone
   sync](https://rclone.org/commands/rclone_sync/)
 * Perform a two-way sync with [rclone
   bisync](https://rclone.org/commands/rclone_bisync/) (bisync is experimental
   tech, don't use with important data)

#### Rclone mount systemd service example

To automatically mount your pixeldrain when logging in to your Linux OS you can
use a systemd user service.

First you must configure an rclone remote with the name `Pixeldrain`. This will
be the name of the network drive as well. You can choose a different name if you
want to.

 1. Run `rclone config` to start the interactive configuration prompt.
 2. Press `n` to create a new remote.
 3. Enter the name `Pixeldrain`, or a different name if you want.
 4. When asked which storage provider you want to use enter `pixeldrain`.
 5. Follow the rest of the instructions.

Create a text file with these contents at the path
`$HOME/.config/systemd/user/rclone@.service`. You may have to create the parent
directories yourself.

```
[Unit]
Description=rclone: Remote FUSE filesystem for cloud storage config %i
Documentation=man:rclone(1)
After=network-online.target
Wants=network-online.target
AssertPathIsDirectory=%h/%i
StartLimitBurst=5

[Service]
Type=simple
ExecStart=rclone mount \
    --config=%h/.config/rclone/rclone.conf \
    --vfs-cache-mode full \
    --vfs-cache-max-age 720h \
    --vfs-cache-min-free-space 50G \
    --vfs-write-back 10s \
    --dir-cache-time 10m \
    --log-level INFO \
    --transfers 10 \
    --file-perms 0700 \
    --dir-perms 0700 \
    %i: %h/%i

KillSignal=SIGINT
TimeoutStartSec=600
Restart=on-failure

[Install]
WantedBy=default.target
```

Once the file is in place, reload your systemd config with `systemctl --user
daemon-reload`. Then you can start your network drive with `systemctl --user
enable rclone@Pixeldrain.service --now`, where `Pixeldrain` is the name of your
rclone remote (replace with the name of your own remote if necessary). This will
create a directory called `Pixeldrain` in your home which will contain your
network drive. If it doesn't work, you can check the logs with `journalctl
--user -u rclone@Pixeldrain`.

If you can't get it to work you can always ask for help on our [Discord
community](https://discord.gg/TWKGvYAFvX).

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
