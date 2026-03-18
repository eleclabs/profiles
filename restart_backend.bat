@echo off
echo Restarting backend server...
taskkill /F /IM node.exe >nul 2>&1
cd /d "d:\profile2\backend"
start cmd /k "npm start"
echo Backend restarted on port 8000
pause
