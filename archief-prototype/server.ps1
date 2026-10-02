# Simple static HTTP server for Coniche Scan
param([int]$Port = 3334)

$root = $PSScriptRoot

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.md'   = 'text/plain; charset=utf-8'
    '.ico'  = 'image/x-icon'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.svg'  = 'image/svg+xml; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.txt'  = 'text/plain; charset=utf-8'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Coniche Scan draait op http://localhost:$Port"
Write-Host "Ctrl+C om te stoppen."

while ($listener.IsListening) {
    try {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response

        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq '/') { $urlPath = '/index.html' }

        $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext   = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime  = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $resp.StatusCode      = 200
            $resp.ContentType     = $mime
            $resp.ContentLength64 = $bytes.LongLength
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $msg  = [System.Text.Encoding]::UTF8.GetBytes("404 Not found: $urlPath")
            $resp.StatusCode      = 404
            $resp.ContentType     = 'text/plain'
            $resp.ContentLength64 = $msg.LongLength
            $resp.OutputStream.Write($msg, 0, $msg.Length)
        }
    } catch {
        # silently skip broken connections
    } finally {
        try { $resp.OutputStream.Close() } catch {}
    }
}
