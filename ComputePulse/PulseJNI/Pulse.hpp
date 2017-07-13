#ifndef PULSE_H
#define PULSE_H

#include <QString>

#include "utils.hpp"

namespace urbanpulse {

class Pulse
{
public:
    Pulse();

    void combineFeatures();
    void createFeatures();

    void setDataFolder(const QString &folder);
    void setDataName(const QString &name);

private:
    QString dataFolder;
    QString dataName;
    double cellSizeInMeters;
    QVector<Filter<int>> filters;
};

}

#endif // PULSE_H
