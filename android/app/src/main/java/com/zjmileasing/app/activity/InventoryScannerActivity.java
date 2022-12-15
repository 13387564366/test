package com.zjmileasing.app.activity;

import android.content.Intent;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

//import com.zjmileasing.app.MainActivity;
//import com.zjmileasing.app.MainActivity;
//import com.facebook.imageutils.BitmapUtil;
//import com.google.android.gms.common.internal.Constants;
//import com.google.zxing.integration.android.IntentIntegrator;
//import com.google.zxing.integration.android.IntentResult;
//import com.journeyapps.barcodescanner.CaptureActivity;
//import com.zjmileasing.app.MainActivity;
import com.zjmileasing.app.R;

// 二维码扫描 https://blog.csdn.net/weixin_42274773/article/details/102853342
// https://www.jianshu.com/p/31697578b229 这个扫描是效果是山下的
public class InventoryScannerActivity extends AppCompatActivity {
    TextView scanResult;
    Button sannerButton;
    Button pickPictureFromLocalButton;

    final  int SELECT_IMAGE_REQUEST_CODE = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        setContentView(R.layout.scanner_activity_layout);
        setContentView(R.layout.scanner_activity_layout);
        sannerButton = (Button) findViewById(R.id.cameraButton);
//        CaptureActivity a = new CaptureActivity();

//        sannerButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
////        // 创建IntentIntegrator对象
//                IntentIntegrator intentIntegrator = new IntentIntegrator(InventoryScannerActivity.this);
////                // 开始扫描
//               intentIntegrator.initiateScan();
////                IntentIntegrator
//
//            }
//        });
        pickPictureFromLocalButton = (Button) findViewById(R.id.pickPictureButton);
       pickPictureFromLocalButton.setOnClickListener(new View.OnClickListener() {
           @Override
           public void onClick(View view) {
               //打开手机中的相册
//               Intent innerIntent = new Intent(Intent.ACTION_GET_CONTENT);
//               innerIntent.setType("image/*");
//               startActivityForResult(innerIntent, REQUEST_CODE_SCAN_GALLERY)

               Intent innerIntent = new Intent(Intent.ACTION_PICK,
                       MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
               Intent wrapperIntent = Intent.createChooser(innerIntent, "选择二维码图片");
               startActivityForResult(wrapperIntent, SELECT_IMAGE_REQUEST_CODE);
           }
       });

       scanResult = (TextView) findViewById(R.id.scannerResult);
    }

//    @Override
//    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
//
//        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
//        if (result != null) {
//            if (result.getContents() == null) {
//                Toast.makeText(this, "取消扫描", Toast.LENGTH_LONG).show();
//            } else {
//                Toast.makeText(this, "扫描内容:" + result.getContents() + ",发送后台校验", Toast.LENGTH_LONG).show();
//                scanResult.setText(result.getContents());
//                // 向后台请求校验送货单号
////                ...
//            }
//        } else {
////            BitmapUtil
//            // 获取拍照结果并处理
////            ...
//        }
//        super.onActivityResult(requestCode, resultCode, data);
//    }
}