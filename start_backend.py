#!/usr/bin/env python3
"""
Backend startup script for Edudemy APP
Automatically installs dependencies and starts the FastAPI server
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd, shell=True, check=True, capture_output=False):
    """Run a command with error handling"""
    try:
        if capture_output:
            result = subprocess.run(cmd, shell=shell, check=check, 
                                  capture_output=True, text=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=shell, check=check)
            return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e}")
        if capture_output and e.stdout:
            print(f"Output: {e.stdout}")
        if capture_output and e.stderr:
            print(f"Error output: {e.stderr}")
        return False

def check_python():
    """Check if Python is available"""
    try:
        version = run_command("python --version", capture_output=True)
        print(f"✅ Python found: {version}")
        return "python"
    except:
        try:
            version = run_command("python3 --version", capture_output=True)
            print(f"✅ Python found: {version}")
            return "python3"
        except:
            print("❌ Python not found. Please install Python 3.8+")
            return None

def check_pip(python_cmd):
    """Check if pip is available"""
    try:
        version = run_command(f"{python_cmd} -m pip --version", capture_output=True)
        print(f"✅ Pip found: {version}")
        return True
    except:
        print("❌ Pip not found. Please install pip")
        return False

def install_requirements(python_cmd):
    """Install requirements if requirements.txt exists"""
    backend_dir = Path(__file__).parent / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        print("📦 Installing requirements...")
        result = run_command(f"{python_cmd} -m pip install -r {requirements_file}")
        if result:
            print("✅ Requirements installed successfully")
        else:
            print("❌ Failed to install requirements")
            return False
    else:
        print("⚠️  No requirements.txt found, installing common dependencies...")
        packages = [
            "fastapi",
            "uvicorn[standard]",
            "sqlalchemy",
            "psycopg2-binary",
            "python-multipart",
            "python-jose[cryptography]",
            "passlib[bcrypt]",
            "python-dotenv",
            "pydantic",
            "email-validator"
        ]
        
        for package in packages:
            print(f"Installing {package}...")
            if not run_command(f"{python_cmd} -m pip install {package}"):
                print(f"❌ Failed to install {package}")
                return False
        print("✅ Common dependencies installed")
    
    return True

def check_database():
    """Check if PostgreSQL is running"""
    try:
        # Try to connect to PostgreSQL using psql if available
        result = run_command("pg_isready -h localhost -p 5432", capture_output=True)
        if result:
            print("✅ PostgreSQL is running")
            return True
    except:
        pass
    
    # Alternative check using netstat/ss
    try:
        if sys.platform == "win32":
            result = run_command("netstat -an | findstr :5432", capture_output=True)
        else:
            result = run_command("ss -tlnp | grep :5432", capture_output=True)
        
        if result and "5432" in result:
            print("✅ PostgreSQL appears to be running on port 5432")
            return True
    except:
        pass
    
    print("⚠️  PostgreSQL may not be running. Please start PostgreSQL service.")
    print("   You can continue, but database operations may fail.")
    return False

def setup_environment():
    """Setup environment file if it doesn't exist"""
    backend_dir = Path(__file__).parent / "backend"
    env_file = backend_dir / ".env"
    
    if not env_file.exists():
        print("📝 Creating .env file with default settings...")
        env_content = """# Database Configuration
DATABASE_URL=postgresql://postgres:1122@localhost:5432/edudemy_db

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Server Configuration
HOST=127.0.0.1
PORT=8000
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ Created {env_file}")
        print("   Please review and update the configuration as needed.")
    else:
        print("✅ Environment file exists")

def start_server(python_cmd):
    """Start the FastAPI server"""
    backend_dir = Path(__file__).parent / "backend"
    main_file = backend_dir / "app" / "main.py"
    
    if not main_file.exists():
        print(f"❌ Main file not found: {main_file}")
        print("Looking for main.py in backend/app/ directory...")
        return False
    
    print("🚀 Starting FastAPI server...")
    print("   Server will be available at: http://127.0.0.1:8000")
    print("   API documentation: http://127.0.0.1:8000/docs")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Change to backend directory and start server
    os.chdir(backend_dir)
    
    try:
        subprocess.run([python_cmd, "-m", "uvicorn", "app.main:app", 
                       "--host", "127.0.0.1", "--port", "8000", "--reload"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("🎓 Edudemy APP - Backend Startup Script")
    print("=" * 60)
    
    # Check Python
    python_cmd = check_python()
    if not python_cmd:
        sys.exit(1)
    
    # Check pip
    if not check_pip(python_cmd):
        sys.exit(1)
    
    # Install requirements
    if not install_requirements(python_cmd):
        print("⚠️  Continuing despite installation issues...")
    
    # Check database
    check_database()
    
    # Setup environment
    setup_environment()
    
    print("-" * 50)
    print("🔧 Setup complete!")
    print("💡 Tip: Make sure PostgreSQL is running before starting the server")
    print("-" * 50)
    
    # Ask user if they want to start the server
    try:
        response = input("Start the server now? (y/n): ").lower().strip()
        if response in ['y', 'yes', '']:
            start_server(python_cmd)
        else:
            print("👍 Setup complete. Run this script again to start the server.")
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")

if __name__ == "__main__":
    main()