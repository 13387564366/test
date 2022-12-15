package com.zjmileasing.app.activity;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.zjmileasing.app.R;

public class H5PageActivity extends AppCompatActivity {
    WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pageforh5);


        Intent intent =getIntent();
                //getXxxExtra方法获取Intent传递过来的数据
        String msg=intent.getStringExtra("reportIndex");
        System.out.println("yhf : 页面index ="+msg);
        String reportName = intent.getStringExtra("reportName");
        System.out.println("yhf : 页面名字 ="+reportName);
        String userId = intent.getStringExtra("userId");
        System.out.println("yhf : 用户名 ="+userId);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
//        toolbar.setTitle(getString(R.string.toolbar_title_for_h5_report));
        toolbar.setTitle(reportName);
        toolbar.setTitleTextColor(Color.WHITE);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //What to do on back clicked
                onBackPressed();
            }
        });

//        外网可以访问的，下面隐藏的是''
//        http://115.231.102.41:8081/reportForm/backToArticleReport
//        内网可以访问的
//       "http://10.112.50.60:81/reportForm/backToArticleReport";
        int reportIndex = Integer.valueOf(msg);
        String url = null;
        if(reportIndex==0){
//           url= "http://10.112.50.60:81/reportForm/throwInReport";
            url= "http://115.231.102.41:8081/reportForm/throwInReport";
        }else if(reportIndex == 1){
//            url= "http://10.112.50.60:81/reportForm/backToArticleReport";
            url= "http://115.231.102.41:8081/reportForm/backToArticleReport";
        }else if(reportIndex == 2){
//            url= "http://10.112.50.60:81/reportForm/backToArticleReport";
            url= "http://115.231.102.41:8081/reportForm/backToArticleReport";
        }else if(reportIndex == 3){
//            url= "http://10.112.50.60:81/reportForm/backToArticleReport";
            // url= "http://10.112.50.63:90/file/mobile";
            url= "http://115.231.102.44:90/file/mobile";
        }else if(reportIndex == 4){
            url= "http://115.231.102.41:8081/reportForm/yqContractReport";
        }else if(reportIndex == 5){
            url= "http://115.231.102.41:8081/reportForm/customerContractInfoReport";
        }else if(reportIndex == 6){
            url= "http://115.231.102.41:8081/reportForm/sj_throwInReport";
        }
//        yhf h5界面的request需要添加userId参数 做权限判断
        String appendId = "?userid=";
        StringBuilder builder = new StringBuilder(appendId);
        url= new StringBuilder(url).append(builder.append(userId).toString()).toString();

//        String url = intent.getStringExtra("reportUrl");
//        String url ="http://10.112.50.60:81/reportForm/throwInReport";
//        String url2= "http://10.112.50.60:81/reportForm/backToArticleReport";
        //获得控件
         webView = (WebView) findViewById(R.id.webViewForh5);
        webView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//            // chromium, enable hardware acceleration
//            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
//        } else {
//            // older android version, disable hardware acceleration
//            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
//        }
        //访问网页
//        webView.loadUrl("http://www.baidu.com");
        webView.loadUrl(url);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        //系统默认会通过手机浏览器打开网页，为了能够直接通过WebView显示网页，则必须设置
        webView.setWebViewClient(new WebViewClient() {

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, String url) {
                //使用WebView加载显示url
                view.loadUrl(url);
                //返回true
                return true;
            }

        });
//        2种方式，另一种在下面onKeyDown
        // 点击后退按钮,让WebView后退一页(也可以覆写Activity的onKeyDown方法)
//        webView.setOnKeyListener(new View.OnKeyListener() {
//            @Override
//            public boolean onKey(View v, int keyCode, KeyEvent event) {
//                if (event.getAction() == KeyEvent.ACTION_DOWN) {
//                    if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) { // 表示按返回键
//                        // 时的操作
//                        webView.goBack(); // 后退
//                        // webview.goForward();//前进
//                        return true; // 已处理
//                    }
//                }
//                return false;
//            }
//        });
    }

    @Override
    public void onBackPressed() {
//        super.onBackPressed();
        if(!handleBackInsideWebViewIfNeeded()){
            super.onBackPressed();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();// 返回前一个页面
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private boolean handleBackInsideWebViewIfNeeded(){
        if ( webView.canGoBack()) {
            webView.goBack();// 返回前一个页面
            return  true;
        }
        return  false;
    }

}
