#include "TopologicalFeatures.hpp"

#include <QDebug>
#include <cassert>

TopologicalFeatures::TopologicalFeatures(QString jarPath) {
    JavaVMInitArgs vm_args;
    vm_args.version = JNI_VERSION_1_8;
    vm_args.nOptions = 1;
    vm_args.ignoreUnrecognized = JNI_TRUE;
    JavaVMOption* options = new JavaVMOption[1];

    std::string stdstr = QString("-Djava.class.path=" + jarPath + "/topoFeatures.jar").toStdString();
    options[0].optionString = (char *) stdstr.c_str();
//    options[1].optionString = "-Xdebug";
//    options[2].optionString = "-agentlib:jdwp=transport=dt_socket,server=y,address=9836,suspend=n";
    vm_args.options = options;
    qDebug() << options[0].optionString;

    jint res = JNI_CreateJavaVM(&vm, (void **)&env, &vm_args);
    assert(res != JNI_ERR);
    qDebug() << "successfully created jvm" << jarPath;
}

void TopologicalFeatures::useClass(QString classPath) {
    qDebug() << "finding class" << classPath;
    clazz = env->FindClass(classPath.toStdString().c_str());
    if(clazz == NULL) {
        qDebug() << "class not found!";
        assert(false);
    }
    // Get the method that you want to call
    jmethodID constructor = env->GetMethodID(clazz, "<init>","()V");
    obj = env->NewObject(clazz,constructor);
    qDebug() << "done!";
}

// helper functions to call array of string in jni
static jobjectArray make_string_row(JNIEnv *env, QVector<QString> elements) {
    jclass stringClass = env->FindClass("java/lang/String");
    jobjectArray row = env->NewObjectArray(elements.size(), stringClass, 0);
    jsize i;

    for (i = 0; i < elements.size(); ++i) {
        env->SetObjectArrayElement(row, i, env->NewStringUTF(elements[i].toStdString().c_str()));
    }
    return row;
}

bool TopologicalFeatures::computePulses(QVector<QString> resolution, QVector<int> st, QVector<int> ct, QString cityName, QString dataName, QString filter, int radius) {
    jobjectArray jresolution = make_string_row(env, resolution);
    jintArray jst = env->NewIntArray(st.size());
    jintArray jct = env->NewIntArray(ct.size());
    jint *argsst = new jint[st.size()];
    jint *argsct = new jint[ct.size()];
    for(int i=0; i<st.size(); ++i)
        argsst[i] = st[i];

    env->SetIntArrayRegion(jst, 0, st.size(), argsst);

    for(int i=0; i<ct.size(); ++i)
        argsct[i] = ct[i];
    env->SetIntArrayRegion(jct, 0, ct.size(), argsct);

    jstring jcityname = env->NewStringUTF(cityName.toStdString().c_str());
    jstring jdataname = env->NewStringUTF(dataName.toStdString().c_str());
    jstring jfilter = env->NewStringUTF(filter.toStdString().c_str());
    jint jradius = radius;

    jmethodID computeMethod = env->GetMethodID(clazz, "computePulses","([Ljava/lang/String;[I[ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;I)Z");
    if(computeMethod == NULL) {
        qDebug() << "method not found!";
        assert(false);
    }
    jboolean err = env->CallBooleanMethod(obj,computeMethod,jresolution, jst, jct, jcityname, jdataname, jfilter, jradius);
    qDebug() << "done" << err;

    env->ReleaseIntArrayElements(jst, argsst, 0);
    env->ReleaseIntArrayElements(jct, argsct, 0);

    qDebug() << "end";
    return true;
}

bool TopologicalFeatures::combinePulses(QVector<QString> resolution, QString cityName, QString dataName, QString filter) {
    jobjectArray jresolution = make_string_row(env, resolution);
    jstring jcityname = env->NewStringUTF(cityName.toStdString().c_str());
    jstring jdataname = env->NewStringUTF(dataName.toStdString().c_str());
    jstring jfilter = env->NewStringUTF(filter.toStdString().c_str());

    qDebug() << "calling combinePulses";
    jmethodID computeMethod = env->GetMethodID(clazz, "combinePulses","([Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Z");
    if(computeMethod == NULL) {
        qDebug() << "method not found!";
        assert(false);
    }
    jboolean err = env->CallBooleanMethod(obj,computeMethod, jresolution, jcityname, jdataname, jfilter);
    qDebug() << "done" << err;
    return true;
}
