---
 title: Cpanel email
 tags: [cpanel, email]
 style: fill
 color: dark
 description: Cpanel Email
---

# Dasar Email Cpanel

> zcat adalah tool suntuk membuka file zip tanpa mengekstraknya
> exigrep adalah utilitas baris perintah khusus untuk mencari log Exim

### Membaca Log dan Header Email
Log exim_mainlog adalah log utama Exim, dan log inilah yang akan kita lihat. Namun, perlu diketahui bahwa Exim juga memiliki berkas log lain yang ditulisinya. Berikut adalah tiga log Exim:
1. /var/log/exim_mainlog
Mencatat kedatangan pesan dan upaya pengiriman; keluaran dikontrol oleh opsi log_selector
2. /var/log/exim_rejectlog
Mencatat penolakan pengiriman berdasarkan kebijakan (misalnya ACL)
3. /var/log/exim_paniclog
Mencatat kesalahan serius, seperti yang menyebabkan Exim mogok, atau yang menyebabkan pesan tidak pernah terkirim; harus kosong, atau hampir kosong
