GECKO_SDK_PATH="/home/rcm/gecko-sdk"
!IF "$(CFG)" == ""
CFG=ChickenSleep - Win32 Debug
!MESSAGE No configuration specified. Defaulting to ChickenSleep - Win32 Debug.
!ENDIF 

!IF "$(CFG)" != "ChickenSleep - Win32 Release" && "$(CFG)" != "ChickenSleep - Win32 Debug"
!MESSAGE Invalid configuration "$(CFG)" specified.
!MESSAGE You can specify a configuration when running NMAKE
!MESSAGE by defining the macro CFG on the command line. For example:
!MESSAGE 
!MESSAGE NMAKE /f "ChickenSleep.mak" CFG="ChickenSleep - Win32 Debug"
!MESSAGE 
!MESSAGE Possible choices for configuration are:
!MESSAGE 
!MESSAGE "ChickenSleep - Win32 Release" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE "ChickenSleep - Win32 Debug" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE 
!ERROR An invalid configuration is specified.
!ENDIF 

!IF "$(OS)" == "Windows_NT"
NULL=
!ELSE 
NULL=nul
!ENDIF 

!IF  "$(CFG)" == "ChickenSleep - Win32 Release"

OUTDIR=.\Release
INTDIR=.\Release
# Begin Custom Macros
OutDir=.\Release
# End Custom Macros

ALL : "$(OUTDIR)\ChickenSleep.dll" "$(OUTDIR)\ChickenSleep.bsc"


CLEAN :
	-@erase "$(INTDIR)\ChickenSleep.obj"
	-@erase "$(INTDIR)\ChickenSleep.sbr"
	-@erase "$(INTDIR)\ChickenSleepModule.obj"
	-@erase "$(INTDIR)\ChickenSleepModule.sbr"
	-@erase "$(INTDIR)\vc60.idb"
	-@erase "$(OUTDIR)\ChickenSleep.bsc"
	-@erase "$(OUTDIR)\ChickenSleep.dll"
	-@erase "$(OUTDIR)\ChickenSleep.exp"
	-@erase "$(OUTDIR)\ChickenSleep.lib"

"$(OUTDIR)" :
    if not exist "$(OUTDIR)/$(NULL)" mkdir "$(OUTDIR)"

CPP=cl.exe
CPP_PROJ=/nologo /MD /W3 /O1 /I "$(GECKO_SDK_PATH)\include" /FI"$(GECKO_SDK_PATH)\include\mozilla-config.h" /D "NDEBUG" /D "WIN32" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "XPCOM_GLUE" /FR"$(INTDIR)\\" /Fp"$(INTDIR)\ChickenSleep.pch" /YX /Fo"$(INTDIR)\\" /Fd"$(INTDIR)\\" /FD /c 

.c{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cpp{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cxx{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.c{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cpp{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cxx{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

MTL=midl.exe
MTL_PROJ=/nologo /D "NDEBUG" /mktyplib203 /win32 
RSC=rc.exe
BSC32=bscmake.exe
BSC32_FLAGS=/nologo /o"$(OUTDIR)\ChickenSleep.bsc" 
BSC32_SBRS= \
	"$(INTDIR)\ChickenSleep.sbr" \
	"$(INTDIR)\ChickenSleepModule.sbr" 

"$(OUTDIR)\ChickenSleep.bsc" : "$(OUTDIR)" $(BSC32_SBRS)
    $(BSC32) @<<
  $(BSC32_FLAGS) $(BSC32_SBRS)
<<

LINK32=link.exe
LINK32_FLAGS=kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib nspr4.lib plds4.lib plc4.lib xpcomglue.lib shlwapi.lib /nologo /dll /incremental:no /pdb:"$(OUTDIR)\ChickenSleep.pdb" /machine:I386 /out:"$(OUTDIR)\ChickenSleep.dll" /implib:"$(OUTDIR)\ChickenSleep.lib" /libpath:"$(GECKO_SDK_PATH)\lib"   
LINK32_OBJS= \
	"$(INTDIR)\ChickenSleep.obj" \
	"$(INTDIR)\ChickenSleepModule.obj" 

"$(OUTDIR)\ChickenSleep.dll" : "$(OUTDIR)" $(DEF_FILE) $(LINK32_OBJS)
    $(LINK32) @<<
  $(LINK32_FLAGS) $(LINK32_OBJS)
<<

TargetPath=.\Release\ChickenSleep.dll
SOURCE="$(InputPath)"

# Begin Custom Macros
OutDir=.\Release
# End Custom Macros

!ELSEIF  "$(CFG)" == "ChickenSleep - Win32 Debug"

OUTDIR=.\Debug
INTDIR=.\Debug
# Begin Custom Macros
OutDir=.\Debug
# End Custom Macros

ALL : "$(OUTDIR)\ChickenSleep.dll" "$(OUTDIR)\ChickenSleep.bsc"


CLEAN :
	-@erase "$(INTDIR)\ChickenSleep.obj"
	-@erase "$(INTDIR)\ChickenSleep.sbr"
	-@erase "$(INTDIR)\ChickenSleepModule.obj"
	-@erase "$(INTDIR)\ChickenSleepModule.sbr"
	-@erase "$(INTDIR)\vc60.idb"
	-@erase "$(INTDIR)\vc60.pdb"
	-@erase "$(OUTDIR)\ChickenSleep.bsc"
	-@erase "$(OUTDIR)\ChickenSleep.dll"
	-@erase "$(OUTDIR)\ChickenSleep.exp"
	-@erase "$(OUTDIR)\ChickenSleep.ilk"
	-@erase "$(OUTDIR)\ChickenSleep.lib"
	-@erase "$(OUTDIR)\ChickenSleep.pdb"

"$(OUTDIR)" :
    if not exist "$(OUTDIR)/$(NULL)" mkdir "$(OUTDIR)"

CPP=cl.exe
CPP_PROJ=/nologo /MDd /W3 /Gm /ZI /Od /I "$(GECKO_SDK_PATH)\include"  /FI"$(GECKO_SDK_PATH)\include\mozilla-config.h" /D "_DEBUG" /D "WIN32" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "XPCOM_GLUE" /FR"$(INTDIR)\\" /Fp"$(INTDIR)\ChickenSleep.pch" /YX /Fo"$(INTDIR)\\" /Fd"$(INTDIR)\\" /FD /GZ /c 

.c{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cpp{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cxx{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.c{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cpp{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

.cxx{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $< 
<<

MTL=midl.exe
MTL_PROJ=/nologo /D "_DEBUG" /mktyplib203 /win32 
RSC=rc.exe
BSC32=bscmake.exe
BSC32_FLAGS=/nologo /o"$(OUTDIR)\ChickenSleep.bsc" 
BSC32_SBRS= \
	"$(INTDIR)\ChickenSleep.sbr" \
	"$(INTDIR)\ChickenSleepModule.sbr" 

"$(OUTDIR)\ChickenSleep.bsc" : "$(OUTDIR)" $(BSC32_SBRS)
    $(BSC32) @<<
  $(BSC32_FLAGS) $(BSC32_SBRS)
<<

LINK32=link.exe
LINK32_FLAGS=kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib nspr4.lib plds4.lib plc4.lib xpcomglue.lib shlwapi.lib /nologo /dll /incremental:yes /pdb:"$(OUTDIR)\ChickenSleep.pdb" /debug /machine:I386 /out:"$(OUTDIR)\ChickenSleep.dll" /implib:"$(OUTDIR)\ChickenSleep.lib" /pdbtype:sept /libpath:"$(GECKO_SDK_PATH)\lib"  
LINK32_OBJS= \
	"$(INTDIR)\ChickenSleep.obj" \
	"$(INTDIR)\ChickenSleepModule.obj" 

"$(OUTDIR)\ChickenSleep.dll" : "$(OUTDIR)" $(DEF_FILE) $(LINK32_OBJS)
    $(LINK32) @<<
  $(LINK32_FLAGS) $(LINK32_OBJS)
<<

TargetPath=.\Debug\ChickenSleep.dll
SOURCE="$(InputPath)"

# Begin Custom Macros
OutDir=.\Debug
# End Custom Macros

!ENDIF 

NO_EXTERNAL_DEPS=1

!IF "$(NO_EXTERNAL_DEPS)" != "1"
!IF EXISTS("ChickenSleep.dep")
!INCLUDE "ChickenSleep.dep"
!ELSE 
!MESSAGE Warning: cannot find "ChickenSleep.dep"
!ENDIF 
!ENDIF 


!IF "$(CFG)" == "ChickenSleep - Win32 Release" || "$(CFG)" == "ChickenSleep - Win32 Debug"
SOURCE=.\ChickenSleep.cpp

"$(INTDIR)\ChickenSleep.obj"	"$(INTDIR)\ChickenSleep.sbr" : $(SOURCE) "$(INTDIR)"
	$(CPP) $(CPP_PROJ) $(SOURCE)

SOURCE=.\ChickenSleepModule.cpp

"$(INTDIR)\ChickenSleepModule.obj"	"$(INTDIR)\ChickenSleepModule.sbr" : $(SOURCE) "$(INTDIR)"

!ENDIF 

