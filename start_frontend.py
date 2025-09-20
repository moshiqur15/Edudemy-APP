#!/usr/bin/env python3
"""
Frontend startup script for Edudemy APP
Automatically installs Node.js dependencies and starts the React development server
"""

import os
import sys
import subprocess
import time
import json
from pathlib import Path

def run_command(cmd, shell=True, check=True, capture_output=False, cwd=None):
    """Run a command with error handling"""
    try:
        if capture_output:
            result = subprocess.run(cmd, shell=shell, check=check, 
                                  capture_output=True, text=True, cwd=cwd)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=shell, check=check, cwd=cwd)
            return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e}")
        if capture_output and e.stdout:
            print(f"Output: {e.stdout}")
        if capture_output and e.stderr:
            print(f"Error output: {e.stderr}")
        return False
    except FileNotFoundError as e:
        print(f"❌ Command not found: {cmd}")
        print(f"Error: {e}")
        print("Make sure the command is installed and in your PATH")
        return False

def check_node():
    """Check if Node.js is available"""
    try:
        version = run_command("node --version", capture_output=True)
        print(f"✅ Node.js found: {version}")
        return True
    except:
        print("❌ Node.js not found. Please install Node.js 16+")
        print("   Download from: https://nodejs.org/")
        return False

def check_npm():
    """Check if npm is available"""
    try:
        version = run_command("npm --version", capture_output=True)
        print(f"✅ npm found: {version}")
        return "npm"
    except:
        try:
            version = run_command("yarn --version", capture_output=True)
            print(f"✅ yarn found: {version}")
            return "yarn"
        except:
            print("❌ Neither npm nor yarn found")
            return None

def check_package_manager(frontend_dir):
    """Determine which package manager to use"""
    package_lock = frontend_dir / "package-lock.json"
    yarn_lock = frontend_dir / "yarn.lock"
    
    if yarn_lock.exists():
        print("📦 Found yarn.lock, using yarn")
        return "yarn"
    elif package_lock.exists():
        print("📦 Found package-lock.json, using npm")
        return "npm"
    else:
        # Default to npm if no lock files exist
        print("📦 No lock files found, defaulting to npm")
        return "npm"

def install_dependencies(package_manager, frontend_dir):
    """Install Node.js dependencies"""
    print("📦 Installing dependencies...")
    
    # Use shell=True on Windows to find package managers in PATH
    import sys
    shell = sys.platform == "win32"
    
    if package_manager == "yarn":
        cmd = "yarn install"
    else:
        cmd = "npm install"
    
    result = run_command(cmd, cwd=frontend_dir, shell=shell)
    if result:
        print("✅ Dependencies installed successfully")
        return True
    else:
        print("❌ Failed to install dependencies")
        return False

def check_package_json(frontend_dir):
    """Check if package.json exists and is valid"""
    package_json = frontend_dir / "package.json"
    
    if not package_json.exists():
        print("❌ package.json not found in frontend directory")
        return False
    
    try:
        with open(package_json, 'r') as f:
            data = json.load(f)
        
        print(f"✅ Found package.json for: {data.get('name', 'Unknown')}")
        
        # Check if it's a React project
        dependencies = data.get('dependencies', {})
        dev_dependencies = data.get('devDependencies', {})
        
        if 'react' in dependencies or 'react' in dev_dependencies:
            print("✅ React project detected")
        else:
            print("⚠️  This doesn't appear to be a React project")
        
        return True
    except json.JSONDecodeError as e:
        print(f"❌ Invalid package.json: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading package.json: {e}")
        return False

def check_vite_config(frontend_dir):
    """Check Vite configuration"""
    vite_config = frontend_dir / "vite.config.js"
    vite_config_ts = frontend_dir / "vite.config.ts"
    
    if vite_config.exists() or vite_config_ts.exists():
        print("✅ Vite configuration found")
        return True
    else:
        print("⚠️  No Vite configuration found, using default settings")
        return False

def create_env_file(frontend_dir):
    """Create .env file if it doesn't exist"""
    env_file = frontend_dir / ".env"
    
    if not env_file.exists():
        print("📝 Creating .env file with default settings...")
        env_content = """# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000

# Development Configuration
VITE_NODE_ENV=development
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ Created {env_file}")
        print("   Please review and update the configuration as needed.")
    else:
        print("✅ Environment file exists")

def start_dev_server(package_manager, frontend_dir):
    """Start the development server"""
    print("🚀 Starting React development server...")
    print("   Frontend will be available at: http://localhost:5173")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Use shell=True on Windows to properly find npm/yarn in PATH
        import sys
        
        if package_manager == "yarn":
            if sys.platform == "win32":
                subprocess.run("yarn dev", cwd=frontend_dir, shell=True)
            else:
                subprocess.run(["yarn", "dev"], cwd=frontend_dir)
        else:
            if sys.platform == "win32":
                subprocess.run("npm run dev", cwd=frontend_dir, shell=True)
            else:
                subprocess.run(["npm", "run", "dev"], cwd=frontend_dir)
                
    except KeyboardInterrupt:
        print("\n🛑 Development server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start development server: {e}")
        return False
    
    return True

def check_backend_server():
    """Check if backend server is running"""
    try:
        # Try with requests first if available
        import requests
        response = requests.get("http://127.0.0.1:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running at http://127.0.0.1:8000")
            return True
    except ImportError:
        # requests not available, try with urllib
        try:
            import urllib.request
            import urllib.error
            
            response = urllib.request.urlopen("http://127.0.0.1:8000/docs", timeout=5)
            if response.getcode() == 200:
                print("✅ Backend server is running at http://127.0.0.1:8000")
                return True
        except (urllib.error.URLError, ConnectionError, OSError):
            pass
        except Exception:
            pass
    except (requests.exceptions.RequestException, ConnectionError, OSError):
        pass
    except Exception:
        pass
    
    print("⚠️  Backend server doesn't appear to be running")
    print("   Please start the backend server first using: python start_backend.py")
    return False

def main():
    """Main function"""
    print("=" * 60)
    print("🎓 Edudemy APP - Frontend Startup Script")
    print("=" * 60)
    
    # Check Node.js
    if not check_node():
        sys.exit(1)
    
    # Check package manager
    package_manager = check_npm()
    if not package_manager:
        sys.exit(1)
    
    # Check frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        sys.exit(1)
    
    print(f"✅ Frontend directory found: {frontend_dir}")
    
    # Check package.json
    if not check_package_json(frontend_dir):
        sys.exit(1)
    
    # Determine which package manager to use based on lock files
    preferred_package_manager = check_package_manager(frontend_dir)
    if preferred_package_manager != package_manager and preferred_package_manager == "yarn":
        # If yarn.lock exists but yarn is not available, warn user
        print("⚠️  yarn.lock found but yarn is not installed")
        print("   Consider installing yarn or removing yarn.lock")
    
    # Use the available package manager
    actual_package_manager = package_manager
    
    # Check Vite config
    check_vite_config(frontend_dir)
    
    # Install dependencies
    if not install_dependencies(actual_package_manager, frontend_dir):
        print("⚠️  Continuing despite installation issues...")
    
    # Create environment file
    create_env_file(frontend_dir)
    
    # Check backend server
    check_backend_server()
    
    print("-" * 50)
    print("🔧 Setup complete!")
    print("💡 Tip: Make sure the backend server is running for full functionality")
    print("-" * 50)
    
    # Ask user if they want to start the server
    try:
        response = input("Start the development server now? (y/n): ").lower().strip()
        if response in ['y', 'yes', '']:
            start_dev_server(actual_package_manager, frontend_dir)
        else:
            print("👍 Setup complete. Run this script again to start the development server.")
            print("   Or manually run: npm run dev (or yarn dev) from the frontend directory")
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")

if __name__ == "__main__":
    main()