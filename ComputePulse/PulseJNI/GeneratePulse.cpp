#include <QCoreApplication>
#include <QDebug>
#include <QTimeZone>

#include "Pulse.hpp"

#include <iostream>

using namespace urbanpulse;
using namespace std;

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

    /**
      * Take as input
      * 1. bounding box diagonal of region in (lat, lon)
      * 2. csv file
      * 3. function type
      * 4. data folder
      **/
    /// TODO: Need to take as input time zone?

    QStringList args = a.arguments();
    int validArgs = 0;
    Pulse pulse;
    QString dataFolder;
    for(int i = 0;i < args.size();i ++) {
        if(args[i] == "--data") {
            dataFolder = args[i+1];
            pulse.setDataFolder(dataFolder);
            validArgs ++;
        }

        if(args[i] == "--name") {
            pulse.setDataName(args[i+1]);
            validArgs ++;
        }
    }

    if(validArgs != 2) {
        cerr << "usage: " << QString(args[0]).toStdString() << " <options>" << endl;
        cerr << "options:" << endl;
        cerr << "  --name \t name of the data set" << endl;
        cerr << "  --data \t data folder" << endl;
        cerr << " --create | --combine\t first call create, then call combine" << endl;
        return -1;
    }
    pulse.createFeatures();
    pulse.combineFeatures();
    return 0;
}
