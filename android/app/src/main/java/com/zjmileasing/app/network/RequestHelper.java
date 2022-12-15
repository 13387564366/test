package com.zjmileasing.app.network;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.util.Pair;
import android.webkit.URLUtil;
import android.widget.Toast;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class RequestHelper {


    public  static  void sendRequest(Activity activity,String url, Callback callback){
        getAsynHttp(activity,url,callback);
    }
    public  static  void sendRequest(Activity activity, String url, ArrayList<Pair<String ,String> > params,Callback callback){
        getAsynHttp(activity,url,callback);
    }



    public static void sendRequest2(Activity activity,String url, String data,Callback callback){
        getAsynHttp2(activity,url,data,callback);
    }

    static private void getAsynHttp(final Activity activity,String url, final Callback callback) {
        OkHttpClient mOkHttpClient=new OkHttpClient();
//        Request.Builder requestBuilder = new Request.Builder().url("http://www.baidu.com");
        Request.Builder requestBuilder = new Request.Builder().url(url);
        //可以省略，默认是GET请求
//        String newUrl=url;
//        try {
//            newUrl = URLEncoder.encode(url,"UTF-8");
//        } catch (UnsupportedEncodingException e) {
//            e.printStackTrace();
//        }finally {
//            newUrl =url;
//        }
//        String newUrl=url;
        requestBuilder.method("GET",null);
        Request request = requestBuilder.build();
        Call mcall= mOkHttpClient.newCall(request);
        mcall.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if(callback != null){
                    callback.onFailure(call,e);
                }
            }

            /**
             * 我们希望获得返回的字符串，可以通过response.body().string()获取；
             * 如果希望获得返回的二进制字节数组，则调用response.body().bytes()；
             * 如果你想拿到返回的inputStream，则调用response.body().byteStream()
             * @param call
             * @param response
             * @throws IOException
             */
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (null != response.cacheResponse()) {
                    String str = response.cacheResponse().toString();
                    Log.i("yhf", "cache---" + str);
                } else {
//                    response.body().string();
                    String str = response.networkResponse().toString();
                    Log.i("yhf", "network---" + str);
                }
                if(callback != null){
                    callback.onResponse(call,response);
                }
//                activity.runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//                        Toast.makeText(activity, "请求成功", Toast.LENGTH_SHORT).show();
//                    }
//                });
            }
        });
    }


    static private void getAsynHttp(final Activity activity,String url, ArrayList<Pair<String,String> > params,final Callback callback) {
        OkHttpClient mOkHttpClient=new OkHttpClient();
//        Request.Builder requestBuilder = new Request.Builder().url("http://www.baidu.com");
        Request.Builder requestBuilder = new Request.Builder().url(url);
        //构建表单参数
        FormBody.Builder requestBuild=new FormBody.Builder();
        //添加请求体
        for ( Pair<String,String> item: params) {
            requestBuild.add(item.first,item.second);
        }
        RequestBody requestBody=requestBuild.build();
        //可以省略，默认是GET请求
        requestBuilder.method("GET",requestBody);
        Request request = requestBuilder.build();
        Call mcall= mOkHttpClient.newCall(request);
        mcall.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if(callback != null){
                    callback.onFailure(call,e);
                }
            }

            /**
             * 我们希望获得返回的字符串，可以通过response.body().string()获取；
             * 如果希望获得返回的二进制字节数组，则调用response.body().bytes()；
             * 如果你想拿到返回的inputStream，则调用response.body().byteStream()
             * @param call
             * @param response
             * @throws IOException
             */
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (null != response.cacheResponse()) {
                    String str = response.cacheResponse().toString();
                    Log.i("yhf", "cache---" + str);
                } else {
//                    response.body().string();
                    String str = response.networkResponse().toString();
                    Log.i("yhf", "network---" + str);
                }
                if(callback != null){
                    callback.onResponse(call,response);
                }
//                activity.runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//                        Toast.makeText(activity, "请求成功", Toast.LENGTH_SHORT).show();
//                    }
//                });
            }
        });
    }


    static private void getAsynHttp2(final Activity activity,String url, String data,final Callback callback) {
        OkHttpClient mOkHttpClient=new OkHttpClient();
//        Request.Builder requestBuilder = new Request.Builder().url("http://www.baidu.com");

        /**
         * //构建表单参数
         *         FormBody.Builder requestBuild=new FormBody.Builder();
         *         //添加请求体
         *         RequestBody requestBody=requestBuild
         *                     .add("username",name)
         *                     .add("password",password)
         *                     .build();
         *
         *         Request request=new Request.Builder()
         *                 .url(url)
         *                 .post(requestBody)
         *                 .build()

         */

        //构建表单参数
        FormBody.Builder requestBuild=new FormBody.Builder();
        //添加请求体
        RequestBody requestBody=requestBuild
                .add("fa_CheckData",data)
                .build();
        Request.Builder requestBuilder = new Request.Builder().url(url);
        //可以省略，默认是GET请求
        requestBuilder.method("GET",requestBody);

        Request request = requestBuilder.build();
        Call mcall= mOkHttpClient.newCall(request);
        mcall.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if(callback != null){
                    callback.onFailure(call,e);
                }
            }

            /**
             * 我们希望获得返回的字符串，可以通过response.body().string()获取；
             * 如果希望获得返回的二进制字节数组，则调用response.body().bytes()；
             * 如果你想拿到返回的inputStream，则调用response.body().byteStream()
             * @param call
             * @param response
             * @throws IOException
             */
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (null != response.cacheResponse()) {
                    String str = response.cacheResponse().toString();
                    Log.i("yhf", "cache---" + str);
                } else {
//                    response.body().string();
                    String str = response.networkResponse().toString();
                    Log.i("yhf", "network---" + str);
                }
                if(callback != null){
                    callback.onResponse(call,response);
                }
//                activity.runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//                        Toast.makeText(activity, "请求成功", Toast.LENGTH_SHORT).show();
//                    }
//                });
            }
        });
    }
}



