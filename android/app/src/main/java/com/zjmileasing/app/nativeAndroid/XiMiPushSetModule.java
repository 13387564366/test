package com.zjmileasing.app.nativeAndroid;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.xiaomi.mipush.sdk.MiPushClient;

import java.util.List;

/**
 * Created by tenwa on 16/12/24.
 */

public class XiMiPushSetModule extends ReactContextBaseJavaModule {

    public XiMiPushSetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "XiMiPushSetModule";
    }

    @ReactMethod
    public void setAlias(String alias, Promise promise){
        MiPushClient.setAlias(getReactApplicationContext(),alias,null);
    }

    @ReactMethod
    public void unSetAlias(String alias, Promise promise){
        MiPushClient.unsetAlias(getReactApplicationContext(),alias,null);
    }

    @ReactMethod
    public void unSetAllAlias(Promise promise){
        List<String> allAlias = MiPushClient.getAllAlias(getReactApplicationContext());
        for(String alias: allAlias){
            MiPushClient.unsetAlias(getReactApplicationContext(),alias,null);
        }
    }

    @ReactMethod
    public void getRegId(Promise promise){
        String regId = MiPushClient.getRegId(getReactApplicationContext());
        regId = regId != null ? regId : "10000";
        promise.resolve(regId);
    }

}
