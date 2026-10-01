@echo off
cd /d "%~dp0"
call scripts\_py.bat scripts\acquire.py || (echo Download failed. & pause & exit /b 1)
call scripts\_py.bat scripts\process.py || (echo Processing failed. & pause & exit /b 1)
echo Done. Start the map with run.bat.
pause
