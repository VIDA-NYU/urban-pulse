#include "ScalarFunction.hpp"
#include "utils.hpp"

using namespace urbanpulse;

ScalarFunction::ScalarFunction() {
    this->initFilters();
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
}

void ScalarFunction::setFunction(int fnType) {
    this->fnType = fnType;
}

void ScalarFunction::generateFunctions(QString inputFile) {
    // read and organize the function at different resolutions

    // aggregate across filters

}

void ScalarFunction::initFilters() {
    filters.clear();

    // filter by season
    // ignore column MONTH when filtering by SEASON
    this->filters << Filter<int>("SEASON","MONTH",QPair<int,int>(0,0), "-spring"); // spring
    this->filters << Filter<int>("SEASON","MONTH",QPair<int,int>(1,1), "-summer"); // summer
    this->filters << Filter<int>("SEASON","MONTH",QPair<int,int>(2,2), "-fall"); // fall
    this->filters << Filter<int>("SEASON","MONTH",QPair<int,int>(3,3), "-winter"); // winter

    // filter by hour
    this->filters << Filter<int>("HOUR","HOUR",QPair<int,int>(0,6), "-night");
    this->filters << Filter<int>("HOUR","HOUR",QPair<int,int>(6,12), "-morning");
    this->filters << Filter<int>("HOUR","HOUR",QPair<int,int>(12,18), "-afternoon");
    this->filters << Filter<int>("HOUR","HOUR",QPair<int,int>(18,24), "-evening");

    // filter by weekend
    this->filters << Filter<int>("DAYOFWEEK","DAYOFWEEK",QPair<int,int>(0,4), "-week");
    this->filters << Filter<int>("DAYOFWEEK","DAYOFWEEK",QPair<int,int>(5,6), "-weekend");
}
