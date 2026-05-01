# Netlify Deploy Script
$file = "final-live-app.html"
$url = "https://api.netlify.com/api/v1/sites"

# Create multipart form data
$boundary = "----WebKitFormBoundary" + [System.Guid]::NewGuid().ToString()
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $file).Path)
$fileData = [System.Text.Encoding]::UTF8.GetBytes("--$boundary`r`nContent-Disposition: form-data; name=`"files[]`"; filename=`"$file`"`r`nContent-Type: text/html`r`n`r`n")
$endBoundary = [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")

$body = New-Object System.IO.MemoryStream
$body.Write($fileData, 0, $fileData.Length)
$body.Write($fileBytes, 0, $fileBytes.Length)
$body.Write($endBoundary, 0, $endBoundary.Length)

try {
    $web = New-Object System.Net.WebClient
    $web.Headers.Add("Content-Type", "multipart/form-data; boundary=$boundary")
    $response = $web.UploadData($url, $body.ToArray())
    $result = [System.Text.Encoding]::UTF8.GetString($response)
    Write-Host "Deploy Result: $result"
} catch {
    Write-Host "Error: $_"
}
