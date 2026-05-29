@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Environment]::CurrentDirectory = '%~dp0'; .\organize_assets.ps1 }"
pause
