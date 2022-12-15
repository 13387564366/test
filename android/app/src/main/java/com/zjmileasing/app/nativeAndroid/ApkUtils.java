package com.zjmileasing.app.nativeAndroid;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.support.v4.content.FileProvider;
import android.util.Log;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Created by admin on 2018/8/16.
 */

public class ApkUtils extends ReactContextBaseJavaModule {

    public ApkUtils(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ApkUtils";
    }

    @ReactMethod
    public void installApk(String apkFileStr, Promise promise) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            File apkFile = new File(apkFileStr);
            if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
                Context context = getReactApplicationContext();
                Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", apkFile);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.setDataAndType(uri, "application/vnd.android.package-archive");
            } else {
                Uri uri = getApkUri(apkFile);
                intent.setDataAndType(uri, "application/vnd.android.package-archive");
            }
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                currentActivity.startActivity(intent);
            } else {
                getReactApplicationContext().startActivity(intent);
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(new JSApplicationIllegalArgumentException(
                    "Could not open URL '" + apkFileStr + "': " + e.getMessage()));
        }
    }

    private static Uri getApkUri(File apkFile) {
        //如果没有设置 SDCard 写权限，或者没有 SDCard,apk 文件保存在内存中，需要授予权限才能安装
        try {
            String[] command = {"chmod", "777", apkFile.toString()};
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.start();
        } catch (IOException ignored) {
        }
        Uri uri = Uri.fromFile(apkFile);
        return uri;
    }
}