package com.zjmileasing.app;

import com.common.app.utils.BadgeUtils;
import com.facebook.react.ReactActivity;
import com.cboy.rn.splashscreen.SplashScreen;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends ReactActivity {


    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "rzzl";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this,true);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onResume() {
        super.onResume();
//        TODO: when open, clear badge count
        BadgeUtils.setCount(0, this);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
}
