#include "Pulse.hpp"

#include "utils.hpp"

#include <QDebug>

using namespace urbanpulse;
using namespace std;

Pulse::Pulse() {
    cellSizeInMeters = getCellSizeInMeters();
    getFilters(this->filters);
    topoFeatures = new TopologicalFeatures(".");
}

void Pulse::createFeatures() {
    topoFeatures->useClass("hope/it/works/pulse/UrbanPulse");
    // without filter
    {
        QVector<QString> res;
        QVector<int> st;
        QVector<int> ct;

        res << getString(ALL) << getString(HourOfDay) << getString(DayOfWeek) << getString(MonthOfYear);
        st << 0 << 0 << 0 << 0;
        ct << 1 << HourOfDay << DayOfWeek << MonthOfYear;
        qDebug() << res << st << ct << dataFolder << dataName << "" << (int)ceil(100/this->cellSizeInMeters);
        topoFeatures->computePulses(res, st, ct, dataFolder, dataName, QString(""), (int)ceil(100/this->cellSizeInMeters));
        qDebug() << "done pulse for above!";
    }

    // with filter
    {
        for(int i=0;i < this->filters.size();i++) {
            QVector<QString> res;
            QVector<int> st;
            QVector<int> ct;

            st << 0 << 0 << 0;
            switch(filters[i].ignoreRes) {
            case HourOfDay:
                res << getString(ALL) << getString(DayOfWeek) << getString(MonthOfYear);
                ct << 1 << DayOfWeek << MonthOfYear;
                break;

            case DayOfWeek:
                res << getString(ALL) << getString(HourOfDay) << getString(MonthOfYear);
                ct << 1 << HourOfDay << MonthOfYear;
                break;

            case MonthOfYear:
                res << getString(ALL) << getString(HourOfDay) << getString(DayOfWeek);
                ct << 1 << HourOfDay << DayOfWeek;
                break;

            default:
                qDebug() << "should not come here";
                exit(1);
            }

            qDebug() << res << st << ct << dataFolder << dataName << this->filters[i].name << (int)ceil(100/this->cellSizeInMeters);
            topoFeatures->computePulses(res, st, ct, dataFolder, dataName, this->filters[i].name, (int)ceil(100/this->cellSizeInMeters));
            qDebug() << "done pulse for filter" << i << "of" << filters.size();
        }
    }
}

void Pulse::setDataFolder(const QString &folder) {
    dataFolder = folder;
}

void Pulse::setDataName(const QString &name) {
    dataName = name;
}

void Pulse::combineFeatures() {

    topoFeatures->useClass("hope/it/works/pulse/CombinedPulse");

    // without filter
    {
        QVector<QString> res;
        res << getString(ALL) << getString(HourOfDay) << getString(DayOfWeek) << getString(MonthOfYear);

        topoFeatures->combinePulses(res, dataFolder, dataName, QString(""));
        qDebug() << "done combine pulse for above!";
    }

    // with filter
   {
       for(int i = 0;i < this->filters.size();i++) {
           QVector<QString> res;

           switch(filters[i].ignoreRes) {
           case HourOfDay:
               res << getString(ALL) << getString(DayOfWeek) << getString(MonthOfYear);
               break;

           case DayOfWeek:
               res << getString(ALL) << getString(HourOfDay) << getString(MonthOfYear);
               break;

           case MonthOfYear:
               res << getString(ALL) << getString(HourOfDay) << getString(DayOfWeek);
               break;

           default:
               qDebug() << "should not come here";
               exit(1);
           }

           topoFeatures->combinePulses(res, dataFolder, dataName, this->filters[i].name);
           qDebug() << "done combine pulse for filter" << i << "of" << filters.size();
       }
   }
}
