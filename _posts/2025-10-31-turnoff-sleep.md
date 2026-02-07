---
 title: Cara membuat Laptop Ubuntu Server 24 tidak mati saat di tutup layarnya
 tags: [Ubuntu, Server]
 style: fill
 color: light
 description: Cara membuat Laptop Ubuntu Server 24 tidak mati saat di tutup layarnya
---

### Buka file
```bash
sudo nano /etc/systemd/logind.conf
```
#### Tambahkan ini di dalam file :
```bash
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
LidSwitchIgnoreInhibited=no
```

### Simpan perubahan dan Restart

```bash
sudo systemctl restart systemd-logind
```


Alternatif
### Matikan Fungsi Sleep

##### Edit
```bash
sudo nano /etc/systemd/sleep.conf
```

```bash
AllowSuspend=no
AllowHibernation=no
AllowSuspendThenHibernate=no
AllowHybridSleep=no
```