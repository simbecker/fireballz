@echo off
echo ========================================
echo    Fireballz Multiplayer Server
echo ========================================
echo.

echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo Your IP address is: %IP%
echo.

echo Starting server...
echo.
echo Local access: http://localhost:3000
echo Network access: http://%IP%:3000
echo.
echo Other devices on your network can connect using:
echo http://%IP%:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js 