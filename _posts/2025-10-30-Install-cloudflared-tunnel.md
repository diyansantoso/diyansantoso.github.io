---
 title: Install Cloudflared Tunnel
 tags: [Cloudflared, AApanel]
 style: fill
 color: success
 description: Install Cloudflared Tunnel untuk AApanel Ubuntu 24
---

# Install CLoudflared Untuk AApanel di Ubuntu 24 :
# Add cloudflare gpg key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared


# Login Cloudflared
```bash
cloudflared tunnel login
```

# Create Tunnel
```bash
cloudflared tunnel create
```

# Create config.yml
```bash
tunnel: 91fa2653-ca23-4eae-b25e-45a284c7538a
credentials-file: /root/.cloudflared/cert.pem

ingress:
  - hostname: panel.gtg.my.id
    service: http://localhost:8000 # panel
  - hostname: gtg.my.id
    service: http://localhost:80 #
  - hostname: '*.gtg.my.id'
    service: http://localhost:80 #Willcard
  - service: http_status:404
```

# Tambahkan DNS di CLoudflare
## CNAME
id tunnel untuk dns:
```bash
91fa2653-ca23-4eae-b25e-45a284c7538a.cfargotunnel.com
```

# Start Automatis Saat Boot

## Create File cloudflare service
```bash
sudo nano /etc/systemd/system/cloudflared.service
```

isi file :
```bash
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
ExecStart=/usr/local/bin/cloudflared tunnel run aapanel-tunnel
Restart=on-failure
User=root
Group=nogroup
WorkingDirectory=/root/.cloudflared

[Install]
WantedBy=multi-user.target
```

### Reload Daemon
```bash
sudo systemctl daemon-reload
```

### Enable Cloudflare Service
```bash
sudo systemctl enable cloudflared
```
### Start Cloudflare Service
```bash
sudo systemctl start cloudflared
```

### Status Cloudflare Service
```bash
sudo systemctl status cloudflared
```

### Log CLoudflared Service
```bash
sudo journalctl -u cloudflared -f
```