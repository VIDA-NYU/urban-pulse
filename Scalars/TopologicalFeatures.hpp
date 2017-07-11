#ifndef TOPOLOGICALFEATURES_H
#define TOPOLOGICALFEATURES_H

#include <jni.h>
#include <QPair>
#include <QVector>
#include <QString>
#include <vector>
#include <utility>

class TopologicalFeatures
{
public:
    enum NormType{LInfinity, Persistence};

public:
    TopologicalFeatures(QString classPath);
    void initMesh(QString featuresPath, int xres, int yres);
    bool combinePulses(QVector<QString> resolution, QString cityName, QString dataName, QString filter);
    bool computePulses(QVector<QString> resolution, QVector<int> st, QVector<int> ct, QString cityName, QString dataName, QString filter, int radius);

private:
    JavaVM *vm;
    JNIEnv *env;
    jclass clazz;
    jobject obj;

    QString featuresPath;
};

#endif // TOPOLOGICALFEATURES_H
