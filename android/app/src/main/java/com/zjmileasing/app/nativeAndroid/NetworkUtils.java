package com.zjmileasing.app.nativeAndroid;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

/**
 * Created by tenwa on 16/12/23.
 */

public class NetworkUtils {
    public static InputStream getInputStreamFromUri(String uri)throws IOException{
        InputStream is = null;

            URL url = new URL(uri);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5 * 1000);
            conn.setDoInput(true);
            conn.setDoOutput(false);
            conn.setReadTimeout(5 * 1000);
            conn.setUseCaches(false);

            int statusCode = conn.getResponseCode();
            if(statusCode == 200){
                is = conn.getInputStream();
            }

        return is;
    }
}
