#ifndef UTILS_HPP
#define UTILS_HPP

#include <QPointF>
#include <QTimeZone>
#include <QVector>

namespace urbanpulse {

#define WORLD_ZOOM_LEVEL 22.f

enum TimeResolutions {ALL = 1, HourOfDay = 24, DayOfWeek = 7, MonthOfYear = 12};

template<class T>
class Filter
{
public:
    Filter(){}
    Filter(TimeResolutions ignoreRes, QPair<T,T> aggRange, QString name = "") {
        this->ignoreRes = ignoreRes;
        this->aggRange = aggRange;
        this->name = name;
    }

public:
    TimeResolutions ignoreRes;
    QString name;
    QPair<T,T> aggRange;
};



QPointF geo2world(const QPointF &);
QPointF world2geo(const QPointF &);
double getGroundResolution(const QPointF &geo, float level = 22.f);
int getTime(uint32_t time, QTimeZone timeZone, TimeResolutions res);

QString getString(TimeResolutions res);
double getCellSizeInMeters();
void getFilters(QVector<Filter<int>> &filters);
}

#endif // UTILS_HPP
