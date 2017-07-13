#include "TopologicalFeatures.hpp"

#include <QDebug>
#include <cassert>

// "hope/it/works/test/PersistenceDiagram"
// "hope/it/works/test/UrbanPulse"
// "hope/it/works/test/CombinedPulse"
TopologicalFeatures::TopologicalFeatures(QString classPath, QString jarPath) {
    JavaVMInitArgs vm_args;
    vm_args.version = JNI_VERSION_1_8;
    vm_args.nOptions = 1;
    vm_args.ignoreUnrecognized = JNI_TRUE;
    JavaVMOption* options = new JavaVMOption[1];

    std::string stdstr = QString("-Djava.class.path=" + jarPath + "/topoFeatures.jar:"+ jarPath + "/javaml-0.1.7.jar").toStdString();
    options[0].optionString = (char *) stdstr.c_str();
//    options[1].optionString = "-Xdebug";
//    options[2].optionString = "-agentlib:jdwp=transport=dt_socket,server=y,address=9836,suspend=n";
    vm_args.options = options;
    qDebug() << options[0].optionString;

    jint res = JNI_CreateJavaVM(&vm, (void **)&env, &vm_args);
    assert(res != JNI_ERR);
    qDebug() << "successfully created jvm" << jarPath;

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
static jobjectArray make_string_row(JNIEnv *env, QVector<QString> elements)
{
    jclass stringClass = env->FindClass("java/lang/String");
    jobjectArray row = env->NewObjectArray(elements.size(), stringClass, 0);
    jsize i;

    for (i = 0; i < elements.size(); ++i) {
        env->SetObjectArrayElement(row, i, env->NewStringUTF(elements[i].toStdString().c_str()));
    }
    return row;
}

static void make_int_row(JNIEnv *env, QVector<int> values, jintArray *iar, jint *args)
{
    *iar = (env->NewIntArray(values.size()));
    args = new jint[values.size()];
    for(int i=0; i<values.size(); ++i)
        args[i] = values[i];

    env->SetIntArrayRegion(*iar, 0, values.size(), args);
}


bool TopologicalFeatures::computePulses(QVector<QString> resolution, QVector<int> st, QVector<int> ct, QString cityName, QString dataName, QString filter, int radius)
{
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
//    jmethodID computeMethod = env->GetMethodID(clazz, "test","()Z"); // test
    if(computeMethod == NULL) {
        qDebug() << "method not found!";
        assert(false);
    }
    jboolean err = env->CallBooleanMethod(obj,computeMethod,jresolution, jst, jct, jcityname, jdataname, jfilter, jradius);
//    jboolean err = env->CallBooleanMethod(obj, computeMethod); // test
    qDebug() << "done" << err;

    env->ReleaseIntArrayElements(jst, argsst, 0);
    env->ReleaseIntArrayElements(jct, argsct, 0);

    qDebug() << "end";
    return true;
}

bool TopologicalFeatures::combinePulses(QVector<QString> resolution, QString cityName, QString dataName, QString filter)
{
    jobjectArray jresolution = make_string_row(env, resolution);
    jstring jcityname = env->NewStringUTF(cityName.toStdString().c_str());
    jstring jdataname = env->NewStringUTF(dataName.toStdString().c_str());
    jstring jfilter = env->NewStringUTF(filter.toStdString().c_str());

    qDebug() << "calling singleData";
    jmethodID computeMethod = env->GetMethodID(clazz, "singleData","([Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Z");
    if(computeMethod == NULL) {
        qDebug() << "method not found!";
        assert(false);
    }
    jboolean err = env->CallBooleanMethod(obj,computeMethod, jresolution, jcityname, jdataname, jfilter);
    qDebug() << "done" << err;
    return true;
}
