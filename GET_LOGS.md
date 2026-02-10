# How to Get Logs
If the site is still 502, run this command on your VPS and **paste the output** to me:

```bash
pm2 logs next16 --lines 50 --nostream
```

This will tell me EXACTLY why it crashes (e.g. "missing sharp", "database error", "syntax error").
