#!/usr/bin/env pwsh

Write-Host "EduDemy App Server Launcher" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $false  # Port is available
    }
    catch {
        return $true   # Port is in use
    }
}

# Check if ports are available
Write-Host "`nChecking port availability..." -ForegroundColor Yellow

if (Test-Port 8000) {
    Write-Host "✗ Port 8000 (Backend) is already in use" -ForegroundColor Red
    Write-Host "  Backend may already be running or another service is using this port" -ForegroundColor Gray
} else {
    Write-Host "✓ Port 8000 (Backend) is available" -ForegroundColor Green
}

if (Test-Port 5174) {
    Write-Host "✗ Port 5174 (Frontend) is already in use" -ForegroundColor Red
    Write-Host "  Frontend may already be running or another service is using this port" -ForegroundColor Gray
} else {
    Write-Host "✓ Port 5174 (Frontend) is available" -ForegroundColor Green
}

# Start backend server
Write-Host "`nStarting Backend Server..." -ForegroundColor Yellow
$backendPath = "E:\3. Trinamics\Edudemy APP\backend"
$frontendPath = "E:\3. Trinamics\Edudemy APP\frontend"

# Check if paths exist
if (-not (Test-Path $backendPath)) {
    Write-Host "✗ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "✗ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Start backend in new window
Write-Host "Launching backend server in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'EduDemy Backend Server' -ForegroundColor Green; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "Launching frontend server in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'EduDemy Frontend Server' -ForegroundColor Blue; npm run dev"

Write-Host "`nServers launching..." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:5174" -ForegroundColor Gray

Write-Host "`nWait a few moments for both servers to fully start." -ForegroundColor Yellow
Write-Host "Check the new PowerShell windows for any startup errors." -ForegroundColor Yellow
Write-Host "`nTo stop the servers, close the PowerShell windows or press Ctrl+C in each." -ForegroundColor Gray

# Optional: Wait and check if servers are responding
Write-Host "`nWaiting 10 seconds to check server status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nChecking server health..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend server is responding (HTTP $($backendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend server not responding: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5174/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Frontend server is responding (HTTP $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend server not responding: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Open your browser and navigate to: http://localhost:5174" -ForegroundColor Cyan