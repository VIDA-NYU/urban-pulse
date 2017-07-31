QT += core
QT -= gui

CONFIG += c++11

TARGET = Pulse
CONFIG += console
CONFIG -= app_bundle

TEMPLATE = app

HEADERS += \
    ../common/utils.hpp \
    TopologicalFeatures.hpp \
    Pulse.hpp

SOURCES += \
    ../common/utils.cpp \
    TopologicalFeatures.cpp \
    GeneratePulse.cpp \
    Pulse.cpp

DESTDIR = ../build

INCLUDEPATH += ../common/

# The following define makes your compiler emit warnings if you use
# any feature of Qt which as been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if you use deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

# Unix configuration
unix:!macx{
    # JNI
    JAVA_HOME=$$(JAVA_HOME) #/usr/lib/jvm/java-8-oracle/#
    QMAKE_CXXFLAGS += -I$$JAVA_HOME/include/ -I$$JAVA_HOME/include/linux/
    LIBS += -L$$JAVA_HOME/jre/lib/amd64/server/ -ljvm -Xlinker -rpath -Xlinker $$JAVA_HOME/jre/lib/amd64/server/
}

# OsX configuration
macx{
    # JNI
    JAVA_HOME = $$system(/usr/libexec/java_home -v 1.8)
    QMAKE_CXXFLAGS += -I$$JAVA_HOME/include/ -I$$JAVA_HOME/include/darwin/
    QMAKE_LFLAGS += -L$$JAVA_HOME/jre/lib/server/ -ljvm -Xlinker -rpath -Xlinker $$JAVA_HOME/jre/lib/server/
    QMAKE_CXXFLAGS += /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.11.sdk/System/Library/Frameworks/JavaVM.framework/Versions/A/Headers/
}

win32{
    #JNI
    INCLUDEPATH  += "$$(JAVA_HOME)/include"
    INCLUDEPATH  += "$$(JAVA_HOME)/include/win32"
    LIBS += "-L$$(JAVA_HOME)/lib" -ljvm
}
