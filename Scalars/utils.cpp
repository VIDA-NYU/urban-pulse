#include "utils.hpp"
#include <cmath>
#include <qmath.h>

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

}

