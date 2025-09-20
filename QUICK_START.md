# 🚀 Edudemy APP - Quick Start Guide

## 🎯 Multiple Ways to Start Your App

### 🥇 **RECOMMENDED: PowerShell Script (Best for Windows)**
```powershell
.\start_app.ps1
```
- ✅ Native Windows PowerShell support
- ✅ Colored console output
- ✅ Interactive menu
- ✅ Handles npm/node perfectly
- ✅ Option to run backend and frontend in separate windows

### 🥈 **Python Scripts (Cross-platform)**

#### Start Everything
```bash
python start_app.py
```

#### Start Individual Services
```bash
# Backend only
python start_backend.py

# Frontend only  
python start_frontend.py
```

### 🥉 **Windows Batch File (Simple)**
```cmd
start_app.bat
```
Double-click the file or run from command prompt.

## 📋 What Each Startup Method Does

### ✨ **Automatic Setup**
- 🔍 **Checks prerequisites** (Python, Node.js, npm, PostgreSQL)
- 📦 **Installs dependencies** automatically if missing
- 📝 **Creates .env files** with default settings
- 🚀 **Starts servers** with proper configuration

### 🌐 **Access Points After Startup**
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

### 🔑 **Default Login**
- **Username**: `superadmin`
- **Password**: `superadmin123`

## 🛠️ Manual Startup (If You Prefer)

### Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

## 🐛 Troubleshooting

### ❌ "npm not found" or similar errors
- **Solution**: Use the PowerShell script (`.\start_app.ps1`)
- **Why**: Python subprocess sometimes can't find npm in Windows PATH

### ❌ Backend connection issues
1. Make sure PostgreSQL is running
2. Check if port 8000 is available
3. Verify .env file configuration

### ❌ Frontend won't start
1. Ensure Node.js 16+ is installed
2. Delete `node_modules` and run `npm install` manually
3. Check if port 5173 is available

## 💡 Pro Tips

### 🎯 **For Development**
- Use `.\start_app.ps1` and choose option **[1]** to run both servers
- Backend runs in a separate window, frontend in current window
- Both have hot-reload enabled

### 🔧 **For Backend Only**
```powershell
.\start_app.ps1 -Mode backend
```

### 🎨 **For Frontend Only**
```powershell
.\start_app.ps1 -Mode frontend
```

### 📦 **For Production**
- Update .env files with production settings
- Use a proper web server (nginx) for frontend
- Use gunicorn or similar for backend

## 📞 Need Help?

1. **Check the comprehensive README.md** for detailed documentation
2. **Run the automatic startup scripts** - they handle most issues
3. **Verify prerequisites** are installed correctly
4. **Check console output** for detailed error messages

---

**🎓 Happy coding with Edudemy APP!** 

Choose the startup method that works best for your environment and enjoy the smooth development experience! 🚀