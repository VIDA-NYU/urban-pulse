#ifndef SCALARFUNCTION_HPP
#define SCALARFUNCTION_HPP

#include <QString>
#include <QPair>
#include <QPointF>
#include <QVector>
#include <QTimeZone>

#include "utils.hpp"

namespace urbanpulse {

struct FunctionVal {
    double sum;
    double count;

    FunctionVal() :sum(0), count(0){}
};

class Function {
public:
    Function(){}
    Function(int resx, int resy);
    void addVal(int x,int y, double val = 0, double count = 1);
    FunctionVal getVal(int x, int y);
    int getCellId(int x, int y);
    void write(QTextStream & op, bool count);

private:
    int resx,resy;
    QVector<FunctionVal> vals;
};

struct PulseFunction {
    QString name;
    Function all;
    QVector<Function> hourly, daily, monthly;
};

class ScalarFunction
{
public:
    ScalarFunction();

    void setBounds(QPointF leftBottom, QPointF rightTop);
    void setFunction(int fnType);
    void setSpatialIndex(int latIn, int lonIn);
    void setTemporalIndex(int timeIn);

    void generateFunctions(QString inputFile);
    void writeOutput(QString opFolder);

    void setDataName(const QString &name);
    void setTimeZone(const QString &tzone);

private:
    void initFilters();
    void addWeightedCount(Function &fn, QPointF pt, double val);
    void writeFunctions(QString filePrefix, PulseFunction &fn);
    void writeFunction(QString fileName, Function &fn);
    void writeFunction(QString filePrefix, QVector<Function> &fn, QString fnName);

private:
    QVector<Filter<int>> filters;
    int fnType;
    QPointF lb, rt;
    int latIn, lonIn, timeIn;
    double cellSize, cellSizeInMeters;
    QTimeZone tz;
    QString fnName;
    QString dataName;

private:
    PulseFunction regular;
    QVector<PulseFunction> filterFns;
    int resx, resy;
    double gres;
};

}

#endif // SCALARFUNCTION_HPP
