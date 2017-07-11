#ifndef UTILS_HPP
#define UTILS_HPP

#include <QPointF>
#include <QTimeZone>

namespace urbanpulse {

#define WORLD_ZOOM_LEVEL 22.f

enum TimeResolutions {HourOfDay = 24, DayOfWeek = 7, MonthOfYear = 12};

QPointF geo2world(const QPointF &);
QPointF world2geo(const QPointF &);
double getGroundResolution(const QPointF &geo, float level = 22.f);
int getTime(uint32_t time, QTimeZone timeZone, TimeResolutions res);

QString getString(TimeResolutions res);
}

#endif // UTILS_HPP
