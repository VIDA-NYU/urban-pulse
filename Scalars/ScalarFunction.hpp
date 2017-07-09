#ifndef SCALARFUNCTION_HPP
#define SCALARFUNCTION_HPP

#include <QString>
#include <QPair>
#include <QPointF>
#include <QVector>

namespace urbanpulse {

template<class T>
class Filter
{
public:
    Filter(){}
    Filter(QString columnName, QString ignoreColumn, QPair<T,T> range, QString name = "")
    {
        this->columnName = columnName;
        this->ignoreColumn = ignoreColumn;
        this->range = range;
        this->name = name;
    }

public:
    QString columnName;
    QString ignoreColumn;
    QString name;
    QPair<T,T> range;
};

class ScalarFunction
{
public:
    ScalarFunction();

    void setBounds(QPointF leftBottom, QPointF rightTop);
    void setFunction(int fnType);
    void generateFunctions(QString inputFile);

private:
    void initFilters();

private:
    QVector<Filter<int>> filters;
    int fnType;
    QPointF lb, rt;

};

}

#endif // SCALARFUNCTION_HPP
