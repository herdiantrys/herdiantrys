# Setup Direct Upload ke Cloudflare R2

Implementasi upload sekarang mendukung direct upload ke Cloudflare R2 supaya file besar tidak melewati body limit Cloudflare Tunnel pada domain aplikasi.

## Environment Variables

Tambahkan variabel berikut di server:

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_BASE_URL=https://assets.example.com
```

Catatan:
- `R2_PUBLIC_BASE_URL` harus berupa URL publik bucket Anda.
- Nilainya bisa custom domain bucket atau URL `r2.dev`.
- Jangan arahkan URL publik ini ke route aplikasi Next.js. Browser akan upload langsung ke R2.

## Bucket CORS

Bucket R2 harus mengizinkan origin aplikasi Anda untuk `PUT` langsung dari browser.

Contoh CORS bucket:

```json
[
  {
    "AllowedOrigins": [
      "https://herdiantry.id",
      "https://www.herdiantry.id",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Sesuaikan origin dengan domain produksi dan development yang benar-benar Anda pakai.

## Cara Kerja

Flow upload besar sekarang:

1. Browser meminta presigned URL ke `/api/uploads/direct/presign`
2. Browser upload file langsung ke Cloudflare R2
3. Browser memanggil `/api/uploads/direct/complete`
4. Server mendaftarkan metadata file ke tabel `MediaAsset`

Kalau env R2 belum diisi, aplikasi otomatis fallback ke upload lokal lama.

## Yang Terselesaikan

- Upload media library besar tidak lagi lewat request body besar ke origin
- Upload file project besar juga bisa memakai jalur direct upload yang sama
- Cloudflare Tunnel hanya menangani request kecil untuk `presign` dan `complete`

## Residual Risk

- File lokal lama di `public/uploads` tetap didukung
- Asset R2 baru tersimpan di database, jadi backup database tetap penting
- Untuk file jauh lebih besar dari ratusan MB, multipart upload R2 masih lebih ideal daripada single PUT
