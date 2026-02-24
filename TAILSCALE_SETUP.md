# 🦎 Secure Remote Access with Tailscale

Tailscale is the recommended way to securely access your Wallestars Control Center from anywhere in the world, without exposing your server to the public internet or dealing with complex port forwarding.

## 🛡️ What is Tailscale?

Tailscale is a zero-configuration VPN that creates a secure private network between your devices. It installs on your server (VPS or home computer) and your client devices (phone, laptop, tablet), allowing them to talk to each other as if they were on the same Wi-Fi network, no matter where they are.

### Why use Tailscale with Wallestars?

- **Secure Access**: Access your dashboard from 4G/5G or other Wi-Fi networks securely.
- **No Open Ports**: You don't need to open ports 3000 or 80 to the public internet.
- **Easy Setup**: Takes less than 5 minutes to set up.
- **MagicDNS**: Access your server by name (e.g., `http://wallestars-server`) instead of IP.

---

## 🚀 Setup Guide

### Step 1: Create a Tailscale Account

1. Go to [tailscale.com](https://tailscale.com).
2. Sign up for a free account (Personal plan is free for up to 3 users and 100 devices).

### Step 2: Install on Your Server (Wallestars Host)

We have provided a helper script to make this easy:

```bash
# Run the setup script
./setup-tailscale.sh
```

**Manual Installation:**
If you prefer to install manually:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Follow the link printed in the console to authenticate your server and add it to your tailnet.

### Step 3: Install on Your Client Devices

Download the Tailscale app for your device:
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=com.tailscale.ipn)
- **iOS**: [App Store](https://apps.apple.com/us/app/tailscale/id1470499037)
- **Windows/macOS**: [Download page](https://tailscale.com/download)

Log in with the same account you used in Step 1.

---

## 🔗 Connecting to Wallestars

Once both your server and your client device (e.g., phone) are on Tailscale:

1. Open the Tailscale app on your phone.
2. Find your server in the list of devices.
3. Copy its **Tailscale IP address** (e.g., `100.x.y.z`).
4. Open your browser and navigate to:
   ```
   http://100.x.y.z:3000
   ```
   (Or just `http://100.x.y.z` if you have Nginx configured on port 80).

### Using MagicDNS

If you enabled MagicDNS in your Tailscale admin console, you can access your server by its hostname:

```
http://wallestars-vps:3000
```

---

## 🌟 Advanced Features

### Exit Nodes
You can configure your Wallestars server as an "Exit Node". This allows you to route *all* your internet traffic from your phone through your secure home/VPS server. This is great for using public Wi-Fi safely.

**To enable on server:**
```bash
sudo tailscale up --advertise-exit-node
```
Then approve it in the [Tailscale Admin Console](https://login.tailscale.com/admin/machines).

### Taildrop
Easily send files between your devices (e.g., send logs or config files from server to laptop) securely.
