# Sia hosting guidelines

Pixeldrain uses [Sia](https://sia.tech) to offload files which are not requested
often, but still need to be kept. Sia is a free storage market where any host
can choose their own pricing. Because of this the users of the network need to
be careful when choosing the hosts to make contracts with.

Because pixeldrain is fairly cost-constrained we are forced to set some hard
requirements on storage and bandwidth pricing for Sia hosts.

## Rates

We will only make contracts with hosts that fullfill all these requirements.
Keep in mind that these are maximums, you are allowed to go lower.

{{$price := .PixelAPI.GetSiaPrice}}

| Requirement              | Max rate EUR | Max rate SC |
|--------------------------|--------------|-------------|
| Storage price per month  | € 1.50 / TB  | {{ div 1.50 $price | formatSC }} / TB |
| Download price           | € 1.00 / TB  | {{ div 1 $price | formatSC }} / TB |
| Upload price             | € 0.50 / TB  | {{ div 1 $price | formatSC }} / TB |
| Collateral per month     | € 5.00 / TB  | {{ div 5 $price | formatSC }} / TB |
| Contract formation price | € 0.01       | {{ div 0.05 $price | formatSC }} |

<sup>
	Based on exchange rates from Kraken.
	[Explanation of units](https://siawiki.tech/wallet/siacoin).
</sup>

This may seem low, but keep in mind that these prices are before redundancy. We
have to upload all our data three times to the Sia network in order to reach
high availability. If you multiply everything by three it becomes much more
reasonable.

We also can't guarantee that your host will be picked when it fulfills these
requirements. If there is enough supply we will only pick the most reliable
hosts available.

Other settings we pay attention to:

| Setting               | Recommended value |
|-----------------------|-------------------|
| Max contract duration | At least 4 months |
| Proof window duration | 1 day             |
| Download batch size   | At least 16 MiB   |
| Revision batch size   | At least 16 MiB   |

## Tips and tricks for becoming a better host

### Use a stable Linux or BSD-based operating system

Sia is known to run better on Linux or BSD based operating systems. Windows is
discouraged due to I/O reliability issues. Windows often sacrifices reliability
for better performance, because of this crashes are more common on Windows and
also have a greater chance of resulting is data loss. Forced updates and other
interruping system processes are also likely to harm hosting uptime and
performance.

We can recommend Debian, CentOS or Ubuntu LTS for hosting. These are systems
which are known to be able to run uninterruped for decades. They are also
regularly patched with security updates which don't even require restarting most
of the time. This makes these systems perfect for the role of hosting on Sia.

### Enable TCP BBR and other network stack optimizations

BBR is a new congestion control agorithm which dramatically decreases the time
needed for a TCP connection to ramp up to maximum speed. It also contains
improvements to counter other problems like router buffer bloat which causes
network latency spikes. Here's an [in-depth analysis of the benefits of enabling
BBR](https://blog.apnic.net/2017/05/09/bbr-new-kid-tcp-block/).

To enable BBR you need you have kernel version 4.9 or higher. See your kernel
version with `uname -a`. On Ubuntu you can upgrade to a newer kernel by
[enabling HWE](https://wiki.ubuntu.com/Kernel/LTSEnablementStack).

Create a file called `/etc/sysctl.d/60-bbr.conf` with the following contents:

```
net.core.default_qdisc = fq_codel
net.ipv4.tcp_congestion_control = bbr
net.ipv4.tcp_notsent_lowat = 16384
net.ipv4.tcp_slow_start_after_idle = 0
```

After doing that you can run `sysctl -p` or reboot to apply the changes. Verify
that it's working with this command: `sysctl net.ipv4.tcp_congestion_control`.
It should return `bbr`.

Here's a more in-depth [guide to the configuration of the linux network
stack](https://www.cyberciti.biz/cloud-computing/increase-your-linux-server-internet-speed-with-tcp-bbr-congestion-control/).

### Use Sia Host Manager to configure your host

SiaCentral's [Host Manager](https://siacentral.com/host-manager) is a great tool
for monitoring and configuring your host. It explains all the settings in
detail, gives an option to set prices in any currency you like and gives
detailed insights into your contracts and revenue stream.

### Sign up for SiaStats host alerts

When your host is configured properly SiaStats will monitor its uptime and
performance. These stats are important for renters to discover good hosts and to
get an overview into the state of the hosting network.

If your host has been online for a while it will show up on SiaStats' [hosting
page](https://siastats.info/hosts). If you search for your host there will be an
option to sign up for hosting alerts.

### IPv6 capability is encouraged

Pixeldrain makes heavy use of IPv6 across its systems. We do this because we
believe that IPv6 is a critical component for the free internet. The old IPv4
requires terrible hacks like NAT to work at a large scale. IPv4 addresses are
also scarce and expensive to rent. All this money is thrown away on a legacy
system for which a replacement has already existed for over a decade. NAT limits
the growth of peer-to-peer software by making it impossible for applications to
communicate freely over the internet. Instead we need to add more hacks on top
like port forwarding to make it work. This has harmed the growth of the open
internet a lot over the decades and will harm it more if we keep going like
this.

So enable IPv6. If you don't have IPv6, call your ISP and ask them why not.

<div style="margin-top: 100px; height: 128px; text-align: center;">
<a href="https://sia.tech/">{{ template "built-with-Sia-mono.svg" . }}</a>
</div>
