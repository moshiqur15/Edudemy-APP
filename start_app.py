#!/usr/bin/env python3
"""
One-click startup script for Edudemy APP
Automatically starts both backend and frontend servers in parallel
"""

import os
import sys
import subprocess
import time
import threading
import signal
from pathlib import Path

class AppStarter:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.processes = []
        self.running = True
        
    def run_command(self, cmd, shell=True, capture_output=False, cwd=None):
        """Run a command with error handling"""
        try:
            if capture_output:
                result = subprocess.run(cmd, shell=shell, check=True, 
                                      capture_output=True, text=True, cwd=cwd)
                return result.stdout.strip()
            else:
                process = subprocess.Popen(cmd, shell=shell, cwd=cwd)
                return process
        except subprocess.CalledProcessError as e:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {e}")
            return None
        except Exception as e:
            print(f"❌ Error running command: {e}")
            return None

    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        print("🔍 Checking prerequisites...")
        
        # Check Python
        try:
            version = self.run_command("python --version", capture_output=True)
            if version:
                print(f"✅ Python: {version}")
            else:
                version = self.run_command("python3 --version", capture_output=True)
                if version:
                    print(f"✅ Python: {version}")
                else:
                    print("❌ Python not found")
                    return False
        except:
            print("❌ Python not found")
            return False
        
        # Check Node.js
        try:
            version = self.run_command("node --version", capture_output=True)
            if version:
                print(f"✅ Node.js: {version}")
            else:
                print("❌ Node.js not found")
                return False
        except:
            print("❌ Node.js not found")
            return False
        
        # Check npm
        try:
            version = self.run_command("npm --version", capture_output=True)
            if version:
                print(f"✅ npm: {version}")
            else:
                print("❌ npm not found")
                return False
        except:
            print("❌ npm not found")
            return False
        
        # Check PostgreSQL
        try:
            if sys.platform == "win32":
                result = self.run_command("netstat -an | findstr :5432", capture_output=True)
            else:
                result = self.run_command("ss -tlnp | grep :5432", capture_output=True)
            
            if result and "5432" in result:
                print("✅ PostgreSQL is running on port 5432")
            else:
                print("⚠️  PostgreSQL may not be running. Database operations may fail.")
        except:
            print("⚠️  Could not check PostgreSQL status")
        
        return True

    def start_backend(self):
        """Start the backend server"""
        print("🚀 Starting backend server...")
        backend_dir = Path(__file__).parent / "backend"
        
        if not backend_dir.exists():
            print("❌ Backend directory not found")
            return False
        
        # Change to backend directory and start server
        try:
            if sys.platform == "win32":
                # Use python directly on Windows
                process = subprocess.Popen(
                    ["python", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
                    cwd=backend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1
                )
            else:
                process = subprocess.Popen(
                    ["python3", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
                    cwd=backend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1
                )
            
            self.backend_process = process
            self.processes.append(process)
            
            # Monitor backend output in a separate thread
            def monitor_backend():
                try:
                    for line in iter(process.stdout.readline, ''):
                        if self.running:
                            print(f"[Backend] {line.strip()}")
                        else:
                            break
                except:
                    pass
            
            backend_thread = threading.Thread(target=monitor_backend, daemon=True)
            backend_thread.start()
            
            print("✅ Backend server started at http://127.0.0.1:8000")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False

    def start_frontend(self):
        """Start the frontend development server"""
        print("🚀 Starting frontend development server...")
        frontend_dir = Path(__file__).parent / "frontend"
        
        if not frontend_dir.exists():
            print("❌ Frontend directory not found")
            return False
        
        try:
            # Use shell=True on Windows to find npm in PATH
            if sys.platform == "win32":
                process = subprocess.Popen(
                    "npm run dev",
                    cwd=frontend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1,
                    shell=True
                )
            else:
                process = subprocess.Popen(
                    ["npm", "run", "dev"],
                    cwd=frontend_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    bufsize=1
                )
            
            self.frontend_process = process
            self.processes.append(process)
            
            # Monitor frontend output in a separate thread
            def monitor_frontend():
                try:
                    for line in iter(process.stdout.readline, ''):
                        if self.running:
                            print(f"[Frontend] {line.strip()}")
                        else:
                            break
                except:
                    pass
            
            frontend_thread = threading.Thread(target=monitor_frontend, daemon=True)
            frontend_thread.start()
            
            print("✅ Frontend development server started at http://localhost:5173")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False

    def wait_for_servers(self):
        """Wait for servers to start and become available"""
        print("⏳ Waiting for servers to start...")
        
        # Wait for backend
        backend_ready = False
        for i in range(30):  # Wait up to 30 seconds
            try:
                # Try to make a simple HTTP request using Python
                import urllib.request
                import urllib.error
                
                response = urllib.request.urlopen("http://127.0.0.1:8000/docs", timeout=2)
                if response.getcode() == 200:
                    backend_ready = True
                    break
            except (urllib.error.URLError, ConnectionError, OSError):
                pass
            except Exception:
                pass
            time.sleep(1)
        
        if backend_ready:
            print("✅ Backend server is ready")
        else:
            print("⚠️  Backend server may not be fully ready yet")
        
        # Frontend usually takes a bit longer
        time.sleep(3)
        print("✅ Frontend server should be ready")

    def signal_handler(self, signum, frame):
        """Handle interrupt signals"""
        print("\n🛑 Shutting down servers...")
        self.cleanup()
        sys.exit(0)

    def cleanup(self):
        """Clean up processes"""
        self.running = False
        
        for process in self.processes:
            try:
                if process and process.poll() is None:
                    process.terminate()
                    # Wait a bit for graceful shutdown
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
            except Exception as e:
                print(f"Error stopping process: {e}")
        
        self.processes.clear()

    def run(self):
        """Main run method"""
        print("=" * 60)
        print("🎓 Edudemy APP - One-Click Startup")
        print("=" * 60)
        
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        if hasattr(signal, 'SIGTERM'):
            signal.signal(signal.SIGTERM, self.signal_handler)
        
        # Check prerequisites
        if not self.check_prerequisites():
            print("❌ Prerequisites check failed. Please install missing components.")
            return False
        
        print("-" * 50)
        
        # Start backend
        if not self.start_backend():
            print("❌ Failed to start backend server")
            return False
        
        # Give backend a moment to start
        time.sleep(2)
        
        # Start frontend
        if not self.start_frontend():
            print("❌ Failed to start frontend server")
            self.cleanup()
            return False
        
        # Wait for servers to be ready
        self.wait_for_servers()
        
        print("=" * 60)
        print("🎉 Edudemy APP is now running!")
        print("")
        print("🌐 Frontend: http://localhost:5173")
        print("🔧 Backend API: http://127.0.0.1:8000")
        print("📚 API Docs: http://127.0.0.1:8000/docs")
        print("")
        print("Default login credentials:")
        print("  Username: superadmin")
        print("  Password: superadmin123")
        print("")
        print("Press Ctrl+C to stop all servers")
        print("=" * 60)
        
        # Keep the script running
        try:
            while self.running:
                # Check if processes are still running
                all_running = True
                for process in self.processes:
                    if process.poll() is not None:
                        all_running = False
                        break
                
                if not all_running:
                    print("⚠️  One or more servers stopped unexpectedly")
                    break
                
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()
        
        print("👋 All servers stopped. Goodbye!")
        return True

def main():
    """Main function"""
    app = AppStarter()
    try:
        app.run()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        app.cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()