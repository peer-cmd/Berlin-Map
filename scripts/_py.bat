@echo off
rem Runs a Python script with the Windows launcher (py -3) or python, whichever exists.
where py >nul 2>nul && (py -3 %* & exit /b %errorlevel%)
where python >nul 2>nul && (python %* & exit /b %errorlevel%)
echo ERROR: Python 3 not found. Install it from https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^).
exit /b 1
