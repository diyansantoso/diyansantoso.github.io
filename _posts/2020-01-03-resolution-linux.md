---
title: Add Resolution on Linux
date: 2020-01-03 16:00:00 +1000
categories: [Linux,Tutorial]
tags: [linux,tutorial]     # TAG names should always be lowercase
authors : diyan
---

###  1. Langkah pertama
Dapatkan informasi interface display port dengan ketik perintah "xrandr" di terminal
```bash
xrandr
```

![hasil dari xrandr](/assets/img/xrandr.png)
_Hasil xrandr_


> note: VGA1 adalah nama dari interface display port yang terdeteksi. Hasilnya akan berbeda jika menggunakan interface yang berbeda, misalnya DVI, HDMI, atau port LVDS pada laptop.
{: .prompt-info }



### 2. Dapatkan nilai modeline untuk resolusi 1920x1080 menggunakan cvt

![hasil dari xrandr](/assets/img/cvt1366768.png)
_Hasil xrandr_


### 3. Tambahkan mode resolusi full HD ke xrandr  

```bash
xrandr --newmode "1368x768_60.00"   85.25  1368 1440 1576 1784  768 771 781 798 -hsync +vsync
```

### 4. Tambahkan mode resolusi full HD ke interface VGA1

```bash
xrandr --addmode VGA1 "1920x1080_60.00" 
```

### 5. Rubah resolusi ke Full HD 
```bash
xrandr --output VGA1 --mode "1920x1080_60.00"
```

### 6. Agar pilihan resolusi full HD bisa permanen tambahkan beberapa parameter ke file xorg.conf 

```bash
bashnano /usr/share/X11/xorg.conf.d/10-monitor.conf
```
Masukan ini :

```bash
Section "Monitor"
        Identifier      "Monitor0"
        Modeline        "1920x1080_60.00"  173.00  1920 2048 2248 2576  1080 1083 1088 1120 -hsync +vsync
EndSection
Section "Screen"
        Identifier      "Screen0"
        Device          "Card0"
        Monitor         "Monitor0"
        SubSection      "Display"
                Modes   "1920x1080_60.00"
        EndSubSection
EndSection

Section "Device"
        Identifier      "Card0"
        Driver          "intel"
EndSection 
```


> note: "intel" pada section "Device" merupakan nama chip VGA saya. sesuaikan dengan milik anda. misal ATI atau nvidia.
{: .prompt-info }


### Simpan lalu reboot 