package com.zjmileasing.app;

import android.app.Application;
import android.app.ActivityManager;
import android.app.NotificationManager;
import android.content.Context;
import android.util.Log;

import com.facebook.react.ReactApplication;
import me.hauvo.thumbnail.RNThumbnailPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.zjmileasing.app.nativeAndroid.CommonPackages;
import com.reactlibrary.RNReactNativeDocViewerPackage;
import com.fileopener.FileOpenerPackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.cboy.rn.splashscreen.SplashScreenReactPackage;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;

import com.xiaomi.channel.commonutils.logger.LoggerInterface;
import com.xiaomi.mipush.sdk.Logger;
import com.xiaomi.mipush.sdk.MiPushClient;

import com.zjmileasing.app.nativeAndroid.XiMiPushSetPackage;

import com.zjmileasing.app.nativeAndroid.SaveFilePackage;
import com.zjmileasing.app.reactPackage.MyReactPackage;

public class MainApplication extends Application implements ReactApplication {

    public static final String APP_ID = "2882303761518360755";
    public static final String APP_KEY = "5461836094755";
    public static final String TAG = "com.zjmileasing.app";

    public static String regId = "";
    public static String deviceModel = "";

    private static MainApplication singleton;
    private Context mAppContext = null;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new RNDeviceInfo(),
                    new MainReactPackage(),
                    new RNReactNativeDocViewerPackage(),
                    new FileOpenerPackage(),
                    new RNFSPackage(),
                    new SplashScreenReactPackage(),
                    new ImagePickerPackage(),
                    new SaveFilePackage(),
                    new XiMiPushSetPackage(),
                    new CommonPackages(),
                    new OrientationPackage(),
                    new RNThumbnailPackage(),
                    new MyReactPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
//        ZXingLibrary.initDisplayOpinion(this);

        singleton = this;
        mAppContext = getApplicationContext();
        //初始化push推送服务
        if (shouldInit()) {
            MiPushClient.registerPush(this, APP_ID, APP_KEY);
        }

        //打开Log
        LoggerInterface newLogger = new LoggerInterface() {

            @Override
            public void setTag(String tag) {
                // ignore
            }

            @Override
            public void log(String content, Throwable t) {
                Log.d(TAG, content, t);
            }

            @Override
            public void log(String content) {
                Log.d(TAG, content);
            }
        };
        Logger.setLogger(this, newLogger);
    }

    private boolean shouldInit() {
        ActivityManager am = ((ActivityManager) getSystemService(Context.ACTIVITY_SERVICE));
        List<ActivityManager.RunningAppProcessInfo> processInfos = am.getRunningAppProcesses();
        String mainProcessName = getPackageName();
        int myPid = android.os.Process.myPid();
        for (ActivityManager.RunningAppProcessInfo info : processInfos) {
            if (info.pid == myPid && mainProcessName.equals(info.processName)) {
                return true;
            }
        }
        return false;
    }

    public static MainApplication getInstance() {
        return singleton;
    }

    public Context getContext() {
        return mAppContext;
    }
}
