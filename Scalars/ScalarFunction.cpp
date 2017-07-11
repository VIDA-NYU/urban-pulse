#include "ScalarFunction.hpp"
#include "utils.hpp"

#include <QFile>
#include <QTextStream>
#include <QDebug>
#include <iostream>

using namespace urbanpulse;
using namespace std;

ScalarFunction::ScalarFunction() {
    this->initFilters();
    filterFns.resize(filters.size());
}

void ScalarFunction::setBounds(QPointF leftBottom, QPointF rightTop) {
    lb = geo2world(leftBottom);
    rt = geo2world(rightTop);
    if(lb.x() > rt.x()) {
        double x = lb.x();
        lb.setX(rt.x());
        rt.setX(x);
    }
    if(lb.y() > rt.y()) {
        double y = lb.y();
        lb.setY(rt.y());
        rt.setY(y);
    }
    gres = getGroundResolution((leftBottom + rightTop) / 2);
    cellSize = 50 / gres;

    resx = std::ceil((rt.x() - lb.x()) / cellSize);
    resy = std::ceil((rt.y() - lb.y()) / cellSize);
    qDebug() << "resolution: " << resx << resy;
    regular.hourly = QVector<Function>(24,Function(resx,resy));
    regular.daily = QVector<Function>(7,Function(resx,resy));
    regular.monthly = QVector<Function>(12,Function(resx,resy));
    regular.all = Function(resx,resy);
    regular.name = "";

    for(int i = 0;i < filters.size();i ++) {
        filterFns[i].all = Function(resx,resy);
        filterFns[i].name = filters[i].name;

        switch(filters[i].ignoreRes) {
        case HourOfDay:
            filterFns[i].daily = QVector<Function>(7,Function(resx,resy));
            filterFns[i].monthly = QVector<Function>(12,Function(resx,resy));
            break;

        case DayOfWeek:
            filterFns[i].hourly = QVector<Function>(24,Function(resx,resy));
            filterFns[i].monthly = QVector<Function>(12,Function(resx,resy));
            break;

        case MonthOfYear:
            filterFns[i].hourly = QVector<Function>(24,Function(resx,resy));
            filterFns[i].daily = QVector<Function>(7,Function(resx,resy));
            break;
        }
    }
}

void ScalarFunction::setFunction(int fnType) {
    this->fnType = fnType;
}

void ScalarFunction::setSpatialIndex(int latIn, int lonIn) {
    this->latIn = latIn;
    this->lonIn = lonIn;
}

void ScalarFunction::setTemporalIndex(int timeIn) {
    this->timeIn = timeIn;
}

void ScalarFunction::initFilters() {


    filters.clear();

    // filter by season
    // ignore column MONTH when filtering by SEASON
    this->filters << Filter<int>(MonthOfYear,QPair<int,int>(3,5), "-spring"); // spring
    this->filters << Filter<int>(MonthOfYear,QPair<int,int>(6,8), "-summer"); // summer
    this->filters << Filter<int>(MonthOfYear,QPair<int,int>(9,11), "-fall"); // fall
    this->filters << Filter<int>(MonthOfYear,QPair<int,int>(0,2), "-winter"); // winter

    // filter by hour
    this->filters << Filter<int>(HourOfDay,QPair<int,int>(6,9), "-day");
    this->filters << Filter<int>(HourOfDay,QPair<int,int>(9,6), "-night");

    // filter by weekend
    this->filters << Filter<int>(DayOfWeek,QPair<int,int>(0,4), "-week");
    this->filters << Filter<int>(DayOfWeek,QPair<int,int>(5,6), "-weekend");
}

void ScalarFunction::addWeightedCount(Function &fn, QPointF pt, double val) {
    // TODO: hard coding values used in paper. add use parameter?
    float radius = 500 / gres;
    float cutoff = 100 / gres;

    int ncells = (int) std::ceil(radius / cellSize);

    int cx = (pt.x() - lb.x()) / cellSize;
    int cy = (pt.y() - lb.y()) / cellSize;
    for(int x = cx - ncells; x <= cx + ncells;x ++) {
        for(int y = cy - ncells; y <= cy + ncells;y ++) {
            if(x < 0 || y < 0 || x >= resx || y >= resx) {
                continue;
            }
            QPointF center = lb + QPointF(cellSize * (x + 0.5),cellSize * (y + 0.5));
            double dist2 = QPointF::dotProduct(pt - center, pt - center);
            double wt = std::exp(-(dist2)/ (cutoff * cutoff));
            fn.addVal(x,y,val * wt,wt);
        }
    }
}

void ScalarFunction::generateFunctions(QString inputFile) {
    // read and organize the function at different resolutions and filters
    QFile fi(inputFile);
    if(!fi.open(QFile::ReadOnly | QIODevice::Text)) {
        qDebug() << "could not read input file: " << inputFile;
        exit(1);
    }
    QTextStream ip(&fi);
    // first line: header
    QStringList header = ip.readLine().split(",");
    if(fnType == 0) {
        fnName = "density";
    } else {
        fnName = header[fnType];
    }
    int ct = 0;
    while(!ip.atEnd()) {
        QStringList line = ip.readLine().split(",");
        if(line.size() == 0) {
            continue;
        }
        if(ct % 1000 == 0) {
            cerr << "\r" << "processed " << ct << " records";
        }
        ct ++;
        double lat = QString(line[latIn]).toDouble();
        double lon = QString(line[lonIn]).toDouble();

        QPointF coord = geo2world(QPointF(lat,lon));
        uint32_t etime = QString(line[timeIn]).toUInt();
        int hour = getTime(etime,tz,TimeResolutions::HourOfDay);
        int day = getTime(etime,tz,TimeResolutions::DayOfWeek);
        int month = getTime(etime,tz,TimeResolutions::MonthOfYear);

        double val = 0;
        if(this->fnType != 0) {
            val = QString(line[fnType]).toDouble();
        }

        // standard resolutions
        this->addWeightedCount(regular.all,coord,val);
        this->addWeightedCount(regular.hourly[hour],coord,val);
        this->addWeightedCount(regular.daily[day],coord,val);
        this->addWeightedCount(regular.monthly[month],coord,val);

        // filters
        for(int i = 0;i < filters.size();i ++) {
            int st = filters[i].aggRange.first;
            int en = filters[i].aggRange.second;
            bool inc;
            switch(filters[i].ignoreRes) {
            case HourOfDay:
                inc = false;
                if(en < st) {
                    if((hour >= st && hour < HourOfDay) || (hour >= 0 && hour < en)) {
                        inc = true;
                    }
                } else {
                    if(hour >= st && hour < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].daily[day],coord,val);
                    this->addWeightedCount(filterFns[i].monthly[month],coord,val);
                }
                break;

            case DayOfWeek:
                inc = false;
                if(en < st) {
                    if((day >= st && day < DayOfWeek) || (day >= 0 && day < en)) {
                        inc = true;
                    }
                } else {
                    if(day >= st && day < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].hourly[hour],coord,val);
                    this->addWeightedCount(filterFns[i].monthly[month],coord,val);
                }
                break;

            case MonthOfYear:
                inc = false;
                if(en < st) {
                    if((month >= st && month < MonthOfYear) || (month >= 0 && month < en)) {
                        inc = true;
                    }
                } else {
                    if(month >= st && month < en) {
                        inc = true;
                    }
                }
                if(inc) {
                    this->addWeightedCount(filterFns[i].all,coord,val);
                    this->addWeightedCount(filterFns[i].hourly[hour],coord,val);
                    this->addWeightedCount(filterFns[i].daily[day],coord,val);
                }
                break;

            default:
                qDebug() << "should not come here";
                exit(1);
            }
        }
    }
    cerr << "\r finished generating functions" << endl;
    fi.close();
}

void ScalarFunction::writeFunction(QString fileName, Function &fn) {
    QFile fo(fileName);
    if(!fo.open(QFile::WriteOnly | QIODevice::Text)) {
        qDebug() << "could not write file: " << fileName;
        exit(1);
    }
    QTextStream op(&fo);
    op << resx << "," << resy << "\n";
    QPointF glb = world2geo(lb);
    QPointF grt = world2geo(rt);
    op << qSetRealNumberPrecision(10) << glb.x() << "," << glb.y() << "," << grt.x() << "," << grt.y() << "\n\n";

    fn.write(op, (fnType == 0));

    fo.close();

    qDebug() << "writing" << fileName;
}

void ScalarFunction::writeFunction(QString filePrefix, QVector<Function> &fn, QString fnName) {
    for(int i = 0;i < fn.size();i ++) {
        this->writeFunction(filePrefix + QString::number(i) + fnName + ".scalars", fn[i]);
    }
}

void ScalarFunction::setTimeZone(const QString &tzone) {
    tz = QTimeZone(tzone.toLatin1());
    qDebug() << "setting time zone" << tzone << tz << tz.isValid();
}

void ScalarFunction::writeFunctions(QString filePrefix, PulseFunction &fn) {
    this->writeFunction(filePrefix + "ALL_0" + fn.name + ".scalars", fn.all);
    this->writeFunction(filePrefix + getString(HourOfDay) + "_", fn.hourly, fn.name);
    this->writeFunction(filePrefix + getString(DayOfWeek) + "_", fn.daily, fn.name);
    this->writeFunction(filePrefix + getString(MonthOfYear) + "_", fn.monthly, fn.name);
}

void ScalarFunction::setDataName(const QString &name) {
    dataName = name;
}

void ScalarFunction::writeOutput(QString opFolder) {
    cerr << "writing default functions" << endl;
    this->writeFunctions(opFolder+"/"+dataName+"_", regular);
    for(int i = 0;i < filters.size();i ++) {
        cerr << "writing filter " << filters[i].name.toStdString() << endl;
        this->writeFunctions(opFolder+"/"+dataName+"_", filterFns[i]);
    }
}

Function::Function(int resx, int resy) {
    this->resx = resx;
    this->resy = resy;

    this->vals.resize(resx * resy);
}

void Function::addVal(int x, int y, double val, double count) {
    int in = x + y * resx;
    vals[in].count += count;
    vals[in].sum += val;
}

FunctionVal Function::getVal(int x, int y) {
    int in = x + y * resx;
    return vals[in];
}

int Function::getCellId(int x, int y) {
    return (x + y * resx);
}

void Function::write(QTextStream &op, bool count) {
    for(int i = 0;i < vals.size(); i++) {
        if(count) {
            op << qSetRealNumberPrecision(10) << vals[i].count << "\n";
        } else {
            op << qSetRealNumberPrecision(10) << (vals[i].sum / vals[i].count) << "\n";
        }
    }
}
