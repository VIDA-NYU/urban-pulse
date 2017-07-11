#include <QCoreApplication>
#include <QDebug>
#include <QTimeZone>

#include "ScalarFunction.hpp"

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
    ScalarFunction fn;
    QString inputFile;
    QString outputFolder;
    int fnType = 0;
    for(int i = 0;i < args.size();i ++) {

        if(args[i] == "--bound") {
            double lat1 = QString(args[i+1]).toDouble();
            double lon1 = QString(args[i+2]).toDouble();
            double lat2 = QString(args[i+3]).toDouble();
            double lon2 = QString(args[i+4]).toDouble();
            fn.setBounds(QPointF(lat1,lon1), QPointF(lat2,lon2));
            validArgs ++;
        }

        if(args[i] == "--input") {
            inputFile = args[i + 1];
            validArgs ++;
        }

        if(args[i] == "--fn") {
            fnType = QString(args[i+1]).toInt();
        }

        if(args[i] == "--output") {
            outputFolder = args[i+1];
            validArgs ++;
        }

        if(args[i] == "--space") {
            int latIn = QString(args[i+1]).toInt();
            int lonIn = QString(args[i+2]).toInt();
            fn.setSpatialIndex(latIn, lonIn);
            validArgs ++;
        }

        if(args[i] == "--time") {
            int timeIn = QString(args[i+1]).toInt();
            fn.setTemporalIndex(timeIn);
            validArgs ++;
        }

        if(args[i] == "--timezone") {
            fn.setTimeZone(args[i+1]);
            validArgs ++;
        }

        if(args[i] == "--name") {
            fn.setDataName(args[i+1]);
            validArgs ++;
        }

        if(args[i] == "--help") {
            QString hval = args[i+1];
            if(hval == "timezone") {
                QList<QByteArray> tz = QTimeZone::availableTimeZoneIds();
                cerr << "The following time zones are available:" << endl;
                for(int i = 0;i < tz.size();i ++) {
                    cerr << "\t" << QString(tz[i]).toStdString() << endl;
                }
                exit(1);
            }
        }
    }
    if(validArgs != 7) {
        cerr << "usage: " << QString(args[0]).toStdString() << " <options>" << endl;
        cerr << "options:" << endl;
        cerr << "  --name \t name of the data set" << endl;
        cerr << "  --input \t input csv file" << endl;
        cerr << "  --space \t <i,j> where i and j are index of attributes corresponding to latitude and longitude" << endl;
        cerr << "  --time \t index of time attribute. time is assumed to be in UTC and specified as unix epoch time" << endl;
        cerr << "  --output \t output folder" << endl;
        cerr << "  --bound \t bounding box of region to analyze. specified as latitude and longitude of the diagonal" << endl;
        cerr << "  --timezone \t time zone of the analysis region. use flag --help timezone to see allowed values" << endl;
        cerr << "  --fn \t\t function to compute [default: 0]" << endl;
        return -1;
    }
    fn.setFunction(fnType);
    fn.generateFunctions(inputFile);
    fn.writeOutput(outputFolder);
    return 0;
}
