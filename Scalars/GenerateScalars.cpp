#include <QCoreApplication>

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
    }
    if(validArgs != 3) {
        cerr << "usage: " << QString(args[0]).toStdString() << " <options>" << endl;
        cerr << "options:" << endl;
        cerr << "  --input \t input csv file" << endl;
        cerr << "  --fn \t\t function to compute [default: 0]" << endl;
        cerr << "  --output \t output folder" << endl;
        cerr << "  --bound \t bounding box of region to analyze. specified as latitude and longitude of the diagonal" << endl;
        return -1;
    }
    fn.setFunction(fnType);

    return 0;
}
