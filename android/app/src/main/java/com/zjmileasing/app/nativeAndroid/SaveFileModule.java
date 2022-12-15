package com.zjmileasing.app.nativeAndroid;

import android.os.Environment;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;


/**
 * Created by vison on 16/5/17.
 */
public class SaveFileModule extends ReactContextBaseJavaModule {
    ReactApplicationContext reactContext;

    @Override
    public String getName() {
        return "SaveFileModule";
    }

    public SaveFileModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void saveToFile(final String url,final Promise promise) {
        int startIndex = url.lastIndexOf('/');
        int endIndex = url.lastIndexOf('&');
        int length = url.length();
        String msg = "url : " + url + "startIndex : " + startIndex + "endIndex : " + endIndex + "length : " + length;
        Log.d("saveToFile",msg);
        String fileName = url.substring(startIndex + 1);
        File photoDir = new File(this.getCurrentActivity().getExternalFilesDir(null)+ "/images");
        if (!photoDir.exists()) {
            photoDir.mkdir();
        }
        final File file = new File(photoDir.getAbsolutePath() + "/"+ fileName);
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    InputStream is = NetworkUtils.getInputStreamFromUri(url);
                    FileUtils.inputStreamToFile(is, file);
                    if(file.exists()){
                        promise.resolve(file.getAbsolutePath());
                    } else {
                        promise.reject("保存失败");
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    promise.reject(e);
                }
            }
        }).start();
    }
}
