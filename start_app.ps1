# Edudemy APP - PowerShell Startup Script
# This script properly handles Windows environments and PowerShell

param(
    [string]$Mode = "interactive"  # Options: backend, frontend, both, interactive
)

# Set console properties
$Host.UI.RawUI.WindowTitle = "Edudemy APP - Startup Script"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to start backend server
function Start-Backend {
    Write-ColorOutput "[BACKEND] Starting backend server..." "Green"
    
    $backendDir = Join-Path $PSScriptRoot "backend"
    
    if (-not (Test-Path $backendDir)) {
        Write-ColorOutput "[ERROR] Backend directory not found: $backendDir" "Red"
        return $false
    }
    
    try {
        Push-Location $backendDir
        
        # Check if virtual environment exists
        if (Test-Path "venv") {
            Write-ColorOutput "[INFO] Activating virtual environment..." "Yellow"
            & "venv\Scripts\Activate.ps1"
        }
        
        # Install requirements if they exist
        if (Test-Path "requirements.txt") {
            Write-ColorOutput "[INFO] Installing Python dependencies..." "Yellow"
            python -m pip install -r requirements.txt
        }
        
        # Start the server
        Write-ColorOutput "[SUCCESS] Starting FastAPI server at http://127.0.0.1:8000" "Green"
        python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
        
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to start backend: $_" "Red"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Function to start frontend server
function Start-Frontend {
    Write-ColorOutput "[FRONTEND] Starting frontend development server..." "Green"
    
    $frontendDir = Join-Path $PSScriptRoot "frontend"
    
    if (-not (Test-Path $frontendDir)) {
        Write-ColorOutput "[ERROR] Frontend directory not found: $frontendDir" "Red"
        return $false
    }
    
    try {
        Push-Location $frontendDir
        
        # Check if node_modules exists, if not install dependencies
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "[INFO] Installing Node.js dependencies..." "Yellow"
            npm install
        }
        
        # Start the development server
        Write-ColorOutput "[SUCCESS] Starting React development server at http://localhost:5173" "Green"
        npm run dev
        
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to start frontend: $_" "Red"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Function to start both servers
function Start-Both {
    Write-ColorOutput "[INFO] Starting both backend and frontend servers..." "Green"
    
    # Start backend in a new PowerShell window
    $backendScript = Join-Path $PSScriptRoot "start_app.ps1"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-File", "`"$backendScript`"", "-Mode", "backend" -WindowStyle Normal
    
    # Give backend time to start
    Start-Sleep -Seconds 3
    
    # Start frontend in current window
    Start-Frontend
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-ColorOutput "[CHECK] Checking prerequisites..." "Cyan"
    
    $allGood = $true
    
    # Check Python
    if (Test-Command "python") {
        $pythonVersion = python --version
        Write-ColorOutput "[OK] Python: $pythonVersion" "Green"
    } else {
        Write-ColorOutput "[ERROR] Python not found. Please install Python 3.8+" "Red"
        $allGood = $false
    }
    
    # Check Node.js
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-ColorOutput "[OK] Node.js: $nodeVersion" "Green"
    } else {
        Write-ColorOutput "[ERROR] Node.js not found. Please install Node.js 16+" "Red"
        $allGood = $false
    }
    
    # Check npm
    if (Test-Command "npm") {
        $npmVersion = npm --version
        Write-ColorOutput "[OK] npm: $npmVersion" "Green"
    } else {
        Write-ColorOutput "[ERROR] npm not found" "Red"
        $allGood = $false
    }
    
    # Check PostgreSQL (optional)
    $pgRunning = netstat -an | Select-String ":5432"
    if ($pgRunning) {
        Write-ColorOutput "[OK] PostgreSQL appears to be running on port 5432" "Green"
    } else {
        Write-ColorOutput "[WARNING] PostgreSQL may not be running on port 5432" "Yellow"
        Write-ColorOutput "[INFO] Database operations may fail if PostgreSQL is not started" "Yellow"
    }
    
    return $allGood
}

# Main script logic
Write-ColorOutput "============================================================" "Cyan"
Write-ColorOutput "                EDUDEMY APP STARTUP" "Cyan"
Write-ColorOutput "============================================================" "Cyan"
Write-ColorOutput ""

# Check prerequisites
if (-not (Test-Prerequisites)) {
    Write-ColorOutput "[ERROR] Prerequisites check failed. Please install missing components." "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "[SUCCESS] Prerequisites check passed!" "Green"
Write-ColorOutput ""

# Handle different modes
switch ($Mode.ToLower()) {
    "backend" {
        Start-Backend
        Read-Host "Press Enter to exit"
    }
    "frontend" {
        Start-Frontend
        Read-Host "Press Enter to exit"
    }
    "both" {
        Start-Both
        Read-Host "Press Enter to exit"
    }
    "interactive" {
        do {
            Write-ColorOutput "Choose startup option:" "Cyan"
            Write-ColorOutput "[1] Start everything (Backend + Frontend)" "White"
            Write-ColorOutput "[2] Start Backend only" "White"
            Write-ColorOutput "[3] Start Frontend only" "White"
            Write-ColorOutput "[4] Exit" "White"
            Write-ColorOutput ""
            
            $choice = Read-Host "Enter your choice (1-4)"
            
            switch ($choice) {
                "1" {
                    Write-ColorOutput ""
                    Start-Both
                    break
                }
                "2" {
                    Write-ColorOutput ""
                    Start-Backend
                    break
                }
                "3" {
                    Write-ColorOutput ""
                    Start-Frontend
                    break
                }
                "4" {
                    Write-ColorOutput "[INFO] Goodbye!" "Green"
                    exit 0
                }
                default {
                    Write-ColorOutput "[ERROR] Invalid choice. Please select 1-4." "Red"
                    Write-ColorOutput ""
                }
            }
        } while ($choice -notin @("1", "2", "3", "4"))
    }
}