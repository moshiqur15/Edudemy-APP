# Test login script
$loginData = @{
    username = "superadmin"
    password = "superadmin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8000/auth/login' -Method POST -Body $loginData -ContentType 'application/json'
    Write-Host "Login successful!"
    Write-Host "Token: $($response.access_token)"
    Write-Host "User: $($response.user | ConvertTo-Json)"
    
    # Test students endpoint with token
    $headers = @{
        'Authorization' = "Bearer $($response.access_token)"
        'Content-Type' = 'application/json'
    }
    
    Write-Host "`nTesting students endpoint..."
    $studentsResponse = Invoke-RestMethod -Uri 'http://localhost:8000/students/' -Method GET -Headers $headers
    Write-Host "Students endpoint working: $($studentsResponse | ConvertTo-Json)"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody"
    }
}