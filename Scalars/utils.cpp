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

}

