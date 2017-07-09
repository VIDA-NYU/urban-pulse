#ifndef UTILS_HPP
#define UTILS_HPP

#include <QPointF>

namespace urbanpulse {

#define WORLD_ZOOM_LEVEL 22.f

QPointF geo2world(const QPointF &);
QPointF world2geo(const QPointF &);


}

#endif // UTILS_HPP
