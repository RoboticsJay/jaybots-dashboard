package com.acmerobotics.dashboard.path.reflection;

import android.util.Log;

import com.acmerobotics.dashboard.path.DashboardPath;
import com.qualcomm.robotcore.eventloop.opmode.Disabled;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Set;

public class ReflectionPath {
    private static final String TAG = "ReflectionPath";

    private ReflectionPath() {}

    public static ArrayList<FieldProvider> scanForClasses(final Set<String> packageIgnorePrefixes) {
        final ArrayList<FieldProvider> fields = new ArrayList();
        ClasspathScanner scanner = new ClasspathScanner(new ClasspathScanner.Callback() {
            @Override
            public boolean shouldProcessClass(String className) {
                for (String prefix : packageIgnorePrefixes)
                    if (className.startsWith(prefix))
                        return false;
                return true;
            }

            @Override
            public void processClass(Class<?> pathClass) {
                if (pathClass.isAnnotationPresent(DashboardPath.class)
                        && !pathClass.isAnnotationPresent(Disabled.class)) {
                    Log.i(TAG, "Using Dashboard Path: " + pathClass.getName());

                    for (Field field : pathClass.getFields()) {
                        if (Modifier.isStatic(field.getModifiers())
                            && !Modifier.isFinal(field.getModifiers())
                            && field.getName().equals("dashboardPath")
                        )  fields.add(new FieldProvider<Boolean>(field, null));
;
                    }
                }
            }
        });
        scanner.scanClasspath();

        return fields;
    }
}
