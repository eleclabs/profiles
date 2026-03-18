@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe
echo Done!
echo.
echo Starting backend...
cd /d "d:\profile2\backend"
start cmd /k "npm start"
echo.
echo Starting frontend...
cd /d "d:\profile2\frontend"
start cmd /k "npm run dev"
echo.
echo Both servers should be starting now...
pause
