call build.bat
if %ERRORLEVEL% GEQ 1 EXIT /B 1
@echo "%~dp0out\target\map.w3x"
"%gamepath%" -loadfile "%~dp0target\map.w3x" %arguments%