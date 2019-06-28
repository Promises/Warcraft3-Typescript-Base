@echo off

if not exist settings.bat (
  @echo WARNING: settings.bat missing, generating default ...
  copy "settings-base.bat" "settings.bat"
)

call settings.bat
call clean.bat
if %alwaysnpm%==true call npm i

if "%gamepath%"=="" (
  @echo: ERROR: gamepath not configured
  @echo: Open up 'settings.bat' and add the path to your warcraft III installation like shown
  EXIT /B 1
)

set map=map.w3x
set lib=app\src\lib
set input=maps
set output=target

mkdir "%output%"
copy "%input%\%map%" "%output%\%map%" > nul

@echo Exporting original map script ...
"tools\MPQEditor\x64\MPQEditor.exe" extract "%output%\%map%" "war3map.lua" "%input%\map\"
if %ERRORLEVEL% GEQ 1 EXIT /B 1
@echo.

if %alwaysgeneratedefinitions%==true (
  @echo Converting standard libraries ...
  node "node_modules/convertjasstots/dist/index.js" "%lib%\core\blizzard.j" "%lib%\core\blizzard.d.ts"
  if %ERRORLEVEL% GEQ 1 EXIT /B 1
  node "node_modules/convertjasstots/dist/index.js" "%lib%\core\common.j" "%lib%\core\common.d.ts"
  if %ERRORLEVEL% GEQ 1 EXIT /B 1
  @echo.
)

@echo Converting TypeScript to Lua ...
@echo.
call tstl -p tsconfig.json
if %ERRORLEVEL% GEQ 1 EXIT /B 1
move "src\app\src\main.lua" "src\"

@echo Processing map script ...
@echo.
"tools/ceres/ceres.exe" build "map"
if %ERRORLEVEL% GEQ 1 EXIT /B 1
@echo.

@echo Importing processed map script ...
"tools\MPQEditor\x64\MPQEditor.exe" add "%output%\%map%" "%output%\map\war3map.lua" "war3map.lua"
if %ERRORLEVEL% GEQ 1 EXIT /B 1
