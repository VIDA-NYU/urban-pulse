#include "utils.hpp"

#include <cmath>
#include <qmath.h>

#include <QDateTime>

namespace urbanpulse {

QPointF geo2world(const QPointF &geo) {
    double y;
    if (geo.x()==90.0)
        y = 256;
    else if (geo.x()==-90.0)
        y = 0;
    else
        y = (M_PI-atanh(sin(geo.x()*M_PI/180)))/M_PI*128;
    return QPointF((geo.y()+180)/360.0*256, y)*exp2(WORLD_ZOOM_LEVEL);
}

QPointF world2geo(const QPointF &world) {
    double s = exp2(WORLD_ZOOM_LEVEL);
    return QPointF(atan(sinh(M_PI*(1-world.y()/s/128)))*180/M_PI, world.x()*360/s/256-180);
}

double getGroundResolution(const QPointF &geo, float level) {
    return cos(geo.x() * M_PI/180) * 6378137 * 2 * M_PI / exp2(8+level);
}

int getTime(uint32_t time, QTimeZone timeZone, TimeResolutions res) {
    QDateTime dt;
    dt.setTimeZone(timeZone);
    dt.setSecsSinceEpoch(time);

    switch(res) {
    case HourOfDay:
        return dt.time().hour();
        break;

    case DayOfWeek:
        // 0 = Monday, 6 = Sunday
        return (dt.date().dayOfWeek() - 1);
        break;

    case MonthOfYear:
        // 0 = January, 11 - December
        return (dt.date().month() - 1);
        break;

    default:
        return -1;
    }
}

QString getString(TimeResolutions res) {
    switch(res) {
    case HourOfDay:
        return "HOUR";

    case DayOfWeek:
        return "DAYOFWEEK";

    case MonthOfYear:
        return "MONTH";

    default:
        return "ALL";
    }
}

double getCellSizeInMeters() {
    return 50.0;
}

void getFilters(QVector<Filter<int>> &filters) {
    filters.clear();

    // filter by season
    // ignore column MONTH when filtering by SEASON
    filters << Filter<int>(MonthOfYear,QPair<int,int>(3,5), "-spring"); // spring
    filters << Filter<int>(MonthOfYear,QPair<int,int>(6,8), "-summer"); // summer
    filters << Filter<int>(MonthOfYear,QPair<int,int>(9,11), "-fall"); // fall
    filters << Filter<int>(MonthOfYear,QPair<int,int>(0,2), "-winter"); // winter

    // filter by hour
    filters << Filter<int>(HourOfDay,QPair<int,int>(6,9), "-day");
    filters << Filter<int>(HourOfDay,QPair<int,int>(9,6), "-night");

    // filter by weekend
    filters << Filter<int>(DayOfWeek,QPair<int,int>(0,4), "-week");
    filters << Filter<int>(DayOfWeek,QPair<int,int>(5,6), "-weekend");
}

}

