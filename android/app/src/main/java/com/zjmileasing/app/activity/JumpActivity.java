package com.zjmileasing.app.activity;

import android.content.Intent;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.Button;

import com.zjmileasing.app.R;

/**
 * is not used yet
 */
public class JumpActivity extends AppCompatActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.jump_page);

        System.out.println("yhf come to JumpActivity");

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbarForJumpPage);
        toolbar.setTitle("跳转页");

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

        Intent intent =getIntent();
        //getXxxExtra方法获取Intent传递过来的数据
        String msg=intent.getStringExtra("params");
        System.out.println("yhf  come to  JumpActivity: "+msg);
        final int reportIndex = Integer.valueOf(msg);
        String url = null;
        //
        if(reportIndex==0){
            url= "http://10.112.50.60:81/reportForm/throwInReport";
        }else if(reportIndex == 1){
            url= "http://10.112.50.60:81/reportForm/backToArticleReport";
        }else if(reportIndex == 2){
            url= "http://10.112.50.60:81/reportForm/backToArticleReport";
        }
        final String reportUrl =url;

        Button button1 = (Button) findViewById(R.id.button1);
        Button button2 = (Button) findViewById(R.id.button2);
//        View.OnClickListener clickListener = new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                Intent it = new Intent(JumpActivity.this, H5PageActivity.class);
//                Bundle bundle=new Bundle();
//                bundle.putString("reportUrl", reportUrl);
////                bundle.putString("reportUrl", String.valueOf(reportIndex));
//                it.putExtras(bundle);       // it.putExtra(“test”, "shuju”);
//                startActivity(it);
//
//            }
//        };
//        button1.setOnClickListener(clickListener);
//        button2.setOnClickListener(clickListener);


//        String url ="http://10.112.50.60:81/reportForm/throwInReport";
//        String url2= "http://10.112.50.60:81/reportForm/backToArticleReport";
        //获得控件
//        WebView webView = (WebView) findViewById(R.id.webViewForh5);
//        //访问网页
////        webView.loadUrl("http://www.baidu.com");
//        webView.loadUrl(url);
//        WebSettings webSettings = webView.getSettings();
//        webSettings.setJavaScriptEnabled(true);
//        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
//        //系统默认会通过手机浏览器打开网页，为了能够直接通过WebView显示网页，则必须设置
//        webView.setWebViewClient(new WebViewClient() {
//
//            @Override
//            public boolean shouldOverrideUrlLoading(
//                    WebView view, String url) {
//                //使用WebView加载显示url
//                view.loadUrl(url);
//                //返回true
//                return true;
//            }
//
//        });
    }
}
