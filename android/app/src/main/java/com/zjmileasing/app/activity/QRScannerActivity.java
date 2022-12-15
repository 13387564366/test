package com.zjmileasing.app.activity;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
//
//import com.google.zxing.integration.android.IntentIntegrator;
//import com.google.zxing.integration.android.IntentResult;
import com.constant.ConfigurationInformation;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.model.AssetElement;
import com.model.AssetElementList;
import com.model.InventoryListModel;
import com.zjmileasing.app.R;
import com.zjmileasing.app.customcomponent.RecycleViewDivider;
import com.zjmileasing.app.network.RequestHelper;
import com.zjmileasing.app.sanner.QRCodeDecoder;
import com.zjmileasing.app.sanner.RealPathFromUriUtils;
import com.zjmileasing.app.utils.loadDialogUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.ref.WeakReference;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

import static com.constant.ConfigurationInformation.DISCARD;
import static com.constant.ConfigurationInformation.INVENTORY;
import static com.constant.ConfigurationInformation.MODIFY;

public class QRScannerActivity extends AppCompatActivity implements View.OnClickListener {


    Spinner spinner;
    Button spinnerDetailButton;
    String inventoryOption;
    TextView scanResult;
    Button sannerButton;
    Button pickPictureFromLocalButton;
    LinearLayout scanResultLayout;
    //6个
    EditText scanResultAssetsId;
    EditText scanResultAssetsName;
    EditText scanResultAssetsSpecifications;
    EditText scanResultAssetsDepartment;
    EditText scanResultAssetsKeeper;
    EditText scanResultAssetsBeginDate;

//    6个 在 "详情"按钮后显示的详情列表
    TextView detailAssetsId;
    TextView detailAssetsName;
    TextView detailAssetsSpecifications;
    TextView detailAssetsDepartment;
    TextView detailAssetsKeeper;
    TextView detailAssetsBeginDate;
    Button detailAssetsConfirmButton;//只提供确认功能，不发请求

    Button inventoryButton;
    Button modifyButton;
    Button discardButton;
    Button generateInventoryButton;
    //    用来显示 只读的对话框
    AlertDialog inventoryDetailDialog;  //盘点单号详情弹出框,scanResultDialog里面的盘点/更改/报废 操作之后，按下"详情" 打开的
    AlertDialog dialog;   // 盘点/更改/报废 三个按钮操作后的 操作反馈确认
    AlertDialog scanResultDialog; // 扫描后显示资产详情弹出框
    AlertDialog scanBarcodeErrorDialog;
//    AlertDialog detailDialog;  //
    //    可修改内容的对话框
//    AlertDialog modifyDialog;
    LinearLayout modifyEditLayout;
    LinearLayout scanResultViewInDialog;
    LinearLayout onlyInventoryDetailView;
    EditText modifyEditText;
    ArrayList<String> inventoryList = new ArrayList<String>();

    //    data from js
    String userId;

    //    const Url for 盘点
    final String inventoryUrlPrefix = ConfigurationInformation.inventoryUrl;

    //loading dialog
    private Dialog loadingDialog;

    final int REQUEST_CODE_SCAN = 5;
    final int REQUEST_CODE_PICK_PICTURE = 7;
    final int SELECT_IMAGE_REQUEST_CODE = 3;


    final int ASSETS_ID = 1;
//    final  int ASS

    //    盘点单下拉菜单
    ArrayAdapter<String> adapter;
    InventoryListModel listModel;
    AssetElement assetElement;
    AssetElement assetElementFromDetailButtonClicked;
//   "详情"按钮下去后，返回的是 资产单列表
    AssetElementList detailButtonResult;
//    private Handler mHandler = new Handler() {
//        @Override
//        public void handleMessage(Message msg) {
//            super.handleMessage(msg);
//            switch (msg.what) {
//                case 1:
//                    loadDialogUtils.closeDialog(loadingDialog);
//                    break;
//            }
//        }
//    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initParams();
        setContentView(R.layout.scanner_activity_layout);
        //申明一个权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(new String[]{Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
        }
        spinner = (Spinner) findViewById(R.id.scanner_activity_spinner);
//        String[] mItems = getSpinnerOptions();
        // 建立Adapter并且绑定数据源
        adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, new ArrayList<String>());

        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                String option = (String) adapterView.getItemAtPosition(i);
                inventoryOption = option;
//                Toast.makeText(view.getContext(),option,Toast.LENGTH_LONG);
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {

            }
        });
        spinnerDetailButton = (Button) findViewById(R.id.scanner_activity_spinner_option_detail_button);
        spinnerDetailButton.setOnClickListener(this);
        getMainList(userId);

        sannerButton = (Button) findViewById(R.id.cameraButton);
        sannerButton.setOnClickListener(this);
//        CaptureActivity a = new CaptureActivity();
//
//        sannerButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
////                scanResult.setText(null);
//                scanResultLayout.setVisibility(View.INVISIBLE);
//
////        // 创建IntentIntegrator对象
//                IntentIntegrator intentIntegrator = new IntentIntegrator(QRScannerActivity.this);
////                // 开始扫描
//                intentIntegrator.initiateScan();
//
//            }
//        });
        pickPictureFromLocalButton = (Button) findViewById(R.id.pickPictureButton);
        pickPictureFromLocalButton.setOnClickListener(this);
//        pickPictureFromLocalButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
////                scanResult.setText(null);
//                scanResultLayout.setVisibility(View.INVISIBLE);
//                Intent innerIntent = new Intent(Intent.ACTION_GET_CONTENT);
//                innerIntent.setType("image/*");
//                Intent wrapperIntent = Intent.createChooser(innerIntent, "选择二维码图片");
//                startActivityForResult(wrapperIntent, REQUEST_CODE_PICK_PICTURE);
//            }
//        });


        /*
        scanResult = (TextView) findViewById(R.id.scannerResult);
        scanResultLayout = (LinearLayout) findViewById(R.id.qrScanResultLayout);
        //        在刚开始的时候没有扫描结果结果
        scanResultLayout.setVisibility(View.INVISIBLE);
        scanResultAssetsIdText = (TextView) findViewById(R.id.scanner_result_assets_id);
        scanResultAssetsIdName = (TextView) findViewById(R.id.scanner_result_assets_name);
        scanResultAssetsSpecifications = (TextView) findViewById(R.id.scanner_result_assets_specifications);
        scanResultAssetsDepartment = (TextView) findViewById(R.id.scanner_result_department);
        scanResultAssetsPerson = (TextView) findViewById(R.id.scanner_result_assets_person);
        scanResultAssetsBeginDate = (TextView) findViewById(R.id.scanner_result_assets_begin_date);
        inventoryButton = (Button) findViewById(R.id.inventoryButton);
        inventoryButton.setOnClickListener(this);
        modifyButton = (Button) findViewById(R.id.modifyButton);
        modifyButton.setOnClickListener(this);
        discardButton = (Button) findViewById(R.id.discardButton);
        discardButton.setOnClickListener(this);
        */

        generateInventoryButton = (Button) findViewById(R.id.generateInventoryButton);
        generateInventoryButton.setOnClickListener(this);
//        modifyEditLayout = (LinearLayout) getLayoutInflater().inflate(R.layout.modify_dialog_layout,null);
        modifyEditLayout = (LinearLayout) View.inflate(this, R.layout.modify_dialog_layout, null);
        initViewsInScanResultDialog();
        initViewsInDetailsDialog();

    }

    /**
     * 扫描二维码后凭借 单号发送请求获取的资产详情 弹出框
     */
    private void initViewsInScanResultDialog() {
//        scanResultViewInDialog = (LinearLayout) View.inflate(this,R.layout.scan_result_dialog,null);
        scanResultViewInDialog = (LinearLayout) View.inflate(this, R.layout.scan_result_dialog_editable, null);
//        scanResultViewInDialog = (LinearLayout) View.inflate(this,R.layout.scan_result_dialog_editable_test,null);
        scanResult = (TextView) scanResultViewInDialog.findViewById(R.id.scannerResult);
        scanResultLayout = (LinearLayout) scanResultViewInDialog.findViewById(R.id.qrScanResultLayout);
        //        在刚开始的时候没有扫描结果结果
//        scanResultLayout.setVisibility(View.INVISIBLE);
//        扫描结果
        scanResultAssetsId = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_assets_id);
        scanResultAssetsName = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_assets_name);
        scanResultAssetsSpecifications = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_assets_specifications);
        scanResultAssetsDepartment = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_asset_department);
        scanResultAssetsKeeper = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_assets_person);
        scanResultAssetsBeginDate = (EditText) scanResultViewInDialog.findViewById(R.id.scanner_result_assets_begin_date);
//        三个按钮
        inventoryButton = (Button) scanResultViewInDialog.findViewById(R.id.inventoryButton);
        inventoryButton.setOnClickListener(this);
        modifyButton = (Button) scanResultViewInDialog.findViewById(R.id.modifyButton);
        modifyButton.setOnClickListener(this);
        discardButton = (Button) scanResultViewInDialog.findViewById(R.id.discardButton);
        discardButton.setOnClickListener(this);
    }


    /**
     *  按下"详情"后显示的对话框内的内容
     */
    private void initViewsInDetailsDialog(){
//         onlyInventoryDetailView = (LinearLayout) View.inflate(this, R.layout.asset_details_view, null);
        onlyInventoryDetailView = (LinearLayout) View.inflate(this, R.layout.inventory_details_listview, null);
        detailAssetsId = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_assets_id);
        detailAssetsName = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_assets_name);
        detailAssetsDepartment = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_asset_department);
        detailAssetsSpecifications = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_assets_specifications);
        detailAssetsKeeper = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_assets_person);
        detailAssetsBeginDate = (TextView) onlyInventoryDetailView.findViewById(R.id.detail_assets_begin_date);
        detailAssetsConfirmButton = (Button) onlyInventoryDetailView.findViewById(R.id.inventoryDetailResultCheckButton);
        detailAssetsConfirmButton.setOnClickListener(this);

    }


    private void initParams() {
        Intent intent = getIntent();
//        intent.putExtra("reportIndex", reportIndex);
//        intent.putExtra("reportName",reportName);
        if (intent.hasExtra("userId")) {
            userId = intent.getStringExtra("userId");
        } else {
            userId = "";
        }
    }

    String[] getSpinnerOptions() {
        return new String[]{"盘点单1", "盘点单2", "盘点单3", "盘点单4", "盘点单5", "盘点单6", "盘点单7", "盘点单8", "盘点单9", "盘点单10"};
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // 扫描二维码/条码回传
//        if (requestCode == REQUEST_CODE_SCAN && resultCode == RESULT_OK) {
        if (resultCode == RESULT_OK) {
            if (requestCode == REQUEST_CODE_PICK_PICTURE) {
                String photoPath = null;
                if (data != null) {
//                    首先获取到此图片的Uri,然后获取选取的图片的绝对地址
                    photoPath = RealPathFromUriUtils.getRealPathFromUri(this, data.getData());
                } else {
                    Toast.makeText(this, "图片损坏，请重新选择", Toast.LENGTH_SHORT).show();
                }
                System.out.println("yhf" + photoPath);
                if (photoPath == null) {
                    Toast.makeText(getApplicationContext(), "路径获取失败", Toast.LENGTH_SHORT).show();
                } else {
                    //解析图片
                    parsePhoto(photoPath);
                }
            } else {
                IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
                if (result != null) {
                    if (result.getContents() == null) {
                        Toast.makeText(this, "取消扫描", Toast.LENGTH_LONG).show();
                    } else {
//                        Toast.makeText(this, "扫描内容:" + result.getContents() + ",发送后台校验", Toast.LENGTH_LONG).show();
//                        scanResult.setText("扫描结果为：" + result.getContents());

//                        showScanResult(result.getContents());
//                        之前是直接显示结果
//                        showScanDetailResultDialog("扫描结果",result.getContents());
//                        从扫描中获取 asset num,利用这个发网络请求去获取资产详情。
//                        System.out.println(" --------------crash scan result---------------");
//                        System.out.println("crash scan result getErrorCorrectionLevel:" +result.getErrorCorrectionLevel());
//                        System.out.println("crash scan result getFormatName:" +result.getFormatName());
//                        System.out.println("crash scan result getOrientation:" +result.getOrientation());

//                        这里出现过闪退 ，扫描将二维码识别成了条形码，产生了后序的字符串的越界错误
                        /**
                         * 如下是正确的result内容
                         * crash scan result getErrorCorrectionLevel:L
                         * crash scan result getFormatName:QR_CODE
                         *  crash scan result getOrientation:null
                         *  如下是识别错误的result内容
                         *  rash scan result getErrorCorrectionLevel:null
                         *  crash scan result getFormatName:UPC_E
                         *  crash scan result getOrientation:180
                         */
                        ;
                        if(result.getFormatName().equals(BarcodeFormat.QR_CODE.toString())) {
                            getAssetDetailByAssetNumFromScanResult(result.getContents());
                        }else{
                            showScanBarcodeErroDialog();
                        }
//                        System.out.println(" --------------crash scan result---------------");
//                        getAssetDetailByAssetNum();
                        // 向后台请求校验送货单号
//                ...
                    }
                }
            }
        }

        if (resultCode == RESULT_OK) {

        }
    }


    void getAssetDetailByAssetNumFromScanResult(String message) {
        String assetId = getAssetId(message);
//        getAssetDetailByAssetNum(assetId);
        loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
        sendRequestForAssetDetailAfterScan2DBarcode(inventoryOption, assetId);
    }

    void showAssetScanDetailResultDialog(String title, String message) {
        if (scanResultDialog == null) {
            scanResultDialog = new AlertDialog.Builder(this)
                    .setTitle("这是标题")
                    .setMessage("")
                    .setIcon(R.mipmap.ic_launcher).create();
            scanResultDialog.setView(scanResultViewInDialog);
            //        当获取到焦点的 EditText 位于屏幕下方，软键盘弹出会遮挡到 EditText 时，整个 DecorView 会往上移动，至于上移多少并不确定。
//一般是上移至使 EditText 刚好不被软键盘遮挡住为止。
            scanResultDialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

        }
        scanResultDialog.setTitle(title);
        fillScanResult(message,0);
        alignLeftTextAndEditText();
        scanResultDialog.show();
    }

    void alignLeftTextAndEditText() {
        if (scanResultViewInDialog != null) {
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_id_left_wrapper_layout), scanResultAssetsId.getPaddingBottom());
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_name_left_wrapper_layout), scanResultAssetsName.getPaddingBottom());
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_spec_left_wrapper_layout), scanResultAssetsSpecifications.getPaddingBottom());
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_department_left_wrapper_layout), scanResultAssetsDepartment.getPaddingBottom());
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_person_left_wrapper_layout), scanResultAssetsKeeper.getPaddingBottom());
            updatePaddingBottom(scanResultViewInDialog.findViewById(R.id.assets_begin_date_left_wrapper_layout), scanResultAssetsBeginDate.getPaddingBottom());
        }
    }

    void updatePaddingBottom(View view, int paddingBottom) {
        if (view != null) {
            view.setPadding(view.getPaddingLeft(), view.getPaddingTop(), view.getPaddingRight(), paddingBottom);
        }
    }


    //
    void showScanDetailResultDialog2(String title, String message) {

    }


//    ********************


    void getAssetDetailByAssetNum(String assetNumber) {
//        Toast.makeText(this,"获取所选盘点单:"+userId+"详情",Toast.LENGTH_LONG).show();
//        showReadOnlyDialog(inventoryId+"详情","这里放详情");
//        if(loadingDialog == null) {
//            loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
//        }
//        Dialog tDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
//        if(loadingDialog == null)
//        {
//            loadingDialog = tDialog;
//        }
        loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
        sendRequestForAssetDetailAfterScan2DBarcode(inventoryOption, assetNumber);
    }

    //    GetFaCard(string sCheckNum, string assetNum)
    void sendRequestForAssetDetailAfterScan2DBarcode(final String checkNum, final String assetNumber) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                RequestHelper.sendRequest(QRScannerActivity.this, getUrlForGetFaCard(checkNum, assetNumber), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        QRScannerActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                loadDialogUtils.closeDialog(loadingDialog);
                                Toast.makeText(QRScannerActivity.this, " GetFaCard 请求失败", Toast.LENGTH_LONG).show();
                            }
                        });

                    }

                    @Override
                    public void onResponse(Call call, final Response response) throws IOException {

                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
//                                    https://blog.csdn.net/qq_28347599/article/details/107506193
//                                    reponse.body()之类的操作才是从输入流中读取数据，本质还是属于网络操作。
//                                    response.body() 这句话不能放在主线程，因为这个获取也是一个异步过程，其他onResponse里面曾经出现这个问题
                                    final String str = response.body().string();
                                    QRScannerActivity.this.runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            loadDialogUtils.closeDialog(loadingDialog);
//                                            Toast.makeText(QRScannerActivity.this," yhf 测试获取资产详情请求成功",Toast.LENGTH_LONG).show();
                                            showAssetScanDetailResultDialog("资产详情", str);
                                        }
                                    });
                                    System.out.println("yhf response content+" + str);
                                } catch (IOException e) {
//                                    怀疑这边会抛异常,但这个异常可能不属于这个类型
                                    loadDialogUtils.closeDialog(loadingDialog);
                                    e.printStackTrace();
                                }catch (Exception exception){
                                    //  怀疑这边会抛异常
                                    loadDialogUtils.closeDialog(loadingDialog);
                                }
                            }
                        }).start();
                    }
                });
            }
        }).start();


    }

//    *********************


    /**
     * 启动线程解析二维码图片
     *
     * @param path
     */
    private void parsePhoto(String path) {
        //启动线程完成图片扫码
        new QrCodeAsyncTask(this, path).execute(path);
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.scanner_activity_spinner_option_detail_button:
                getInventoryDetail(inventoryOption);
                break;
//                从相册中选择照片
            case R.id.pickPictureButton:
                pickPictureFromLocal();
                break;
//                直接扫描二维码
            case R.id.cameraButton:
                scanDirectly();
                break;
//                盘点按钮
            case R.id.inventoryButton:
                doInvetory();
                break;
//                更改
            case R.id.modifyButton:
                modify();
                break;
//                报废
            case R.id.discardButton:
                discard();
                break;
            case R.id.generateInventoryButton:
                generateInventory();
            case R.id.inventoryDetailResultCheckButton:
                dismissInventoryDetailDialog();
                break;
        }
    }

    String getCurrentDate() {
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        return df.format(new Date());
    }

    /**
     * API 1 获取当前用户的所有盘点单号
     * ?Begin=2020-01-13&end=2020-01-15&userid=123
     *
     * @param userId
     * @return
     */
    String getUrlForMainList(String userId) {
        StringBuilder stringBuilder = new StringBuilder(inventoryUrlPrefix);
        stringBuilder.append(ConfigurationInformation.CHECK_MAIN_LIST_STR);
        stringBuilder.append("?Begin=2000-01-13").append("&").append("end=").append(getCurrentDate()).append("&")
                .append("&userid=").append(userId);
        return stringBuilder.toString();
    }

    /**
     * API 2
     * ?sCheckNum=00002
     * 获取当前盘点单的详情
     *
     * @return
     */
    String getUrlForCheckDataTemp(String index) {
        StringBuilder stringBuilder = new StringBuilder(inventoryUrlPrefix);
        stringBuilder.append(ConfigurationInformation.CHECK_DATA_TEMP_STR).append("?sCheckNum=").append(index);
        return stringBuilder.toString();
    }

//

    /**
     * API 3
     * assetNum=001500000019
     * 根据资产编码获取资产详情
     *
     * @param assetNum
     * @return
     */
    String getUrlForGetFaCard(String checkNum, String assetNum) {
        StringBuilder stringBuilder = new StringBuilder(inventoryUrlPrefix);
        stringBuilder.append(ConfigurationInformation.GET_FA_CARD_STR).append("?assetNum=").append(assetNum)
                .append("&sCheckNum=").append(checkNum);
        return stringBuilder.toString();
    }


    /**
     * API 4
     * 报废/盘点/更改 按钮发出的请求   ?fa_CheckData= CheckDataGet中的Data,修改后提交给此接口
     *
     * @return
     */
    String getUrlForCheckDataUpdate(int changeStatus) {
        StringBuilder stringBuilder = new StringBuilder(inventoryUrlPrefix);
        stringBuilder.append(ConfigurationInformation.CHECK_DATA_UPDATE_STR).append("?fa_CheckData=");
//        stringBuilder.append(ConfigurationInformation.CHECK_DATA_UPDATE_STR);
        try {
            stringBuilder.append(URLEncoder.encode(assetElement.getUpdatedAssetString(changeStatus), "UTF-8"));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }


    /**
     * API 5
     * ?sCheckNum=00002
     * "生成盘点单"按钮发出的请求
     *
     * @param checkNum
     * @return
     */
    String getUrlForConfirmSubmit( String checkNum) {
        StringBuilder stringBuilder = new StringBuilder(inventoryUrlPrefix);
        stringBuilder.append(ConfigurationInformation.CONFIRM_SUBMIT_STR).append("?sCheckNum=").append(checkNum);
        return stringBuilder.toString();
    }


    void getInventoryDetail(final String inventoryIndex) {

//        Toast.makeText(this,"获取所选盘点单:"+inventoryIndex+"详情",Toast.LENGTH_LONG).show();
//        showReadOnlyDialog(inventoryId+"详情","这里放详情");

//        Dialog tDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
//        if(loadingDialog == null)
//        {
//            loadingDialog = tDialog;
//        }
        loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
        new Thread(new Runnable() {
            @Override
            public void run() {
                RequestHelper.sendRequest(QRScannerActivity.this, getUrlForCheckDataTemp(inventoryIndex), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        QRScannerActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                loadDialogUtils.closeDialog(loadingDialog);
                                Toast.makeText(QRScannerActivity.this, " yhf 测试okhttp请求失败", Toast.LENGTH_LONG).show();
                            }
                        });

                    }

                    @Override
                    public void onResponse(Call call, final Response response) throws IOException {
                        new Thread(new Runnable() {
                            @Override
                            public void run() {

                                try {
                                    final String str = response.body().string();
                                 QRScannerActivity.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
//                        mHandler.sendEmptyMessageDelayed(1, 3000);
                                        loadDialogUtils.closeDialog(loadingDialog);
                                        showInventoryDetailDialog("盘点单详情", str);
                                        //                        Toast.makeText(QRScannerActivity.this," yhf 测试okhttp请求成功",Toast.LENGTH_LONG).show();
                                    }
                                });
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                            }
                        }).start();

                    }
                });
            }
        }).start();

    }

    /**
     * 下面放5个API请求
     */
    void getMainList(String userId) {
//        Toast.makeText(this,"获取所选盘点单:"+userId+"详情",Toast.LENGTH_LONG).show();
//        showReadOnlyDialog(inventoryId+"详情","这里放详情");
//        if(loadingDialog == null) {
//            loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
//        }
//        Dialog tDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
//        if(loadingDialog == null)
//        {
//            loadingDialog = tDialog;
//        }
        loadingDialog = loadDialogUtils.createLoadingDialog(QRScannerActivity.this, "加载中...");
        sendRequestForMainList();
    }

    void sendRequestForMainList() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                RequestHelper.sendRequest(QRScannerActivity.this, getUrlForMainList(userId), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        QRScannerActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                loadDialogUtils.closeDialog(loadingDialog);
                                Toast.makeText(QRScannerActivity.this, " yhf 获取main list请求失败", Toast.LENGTH_LONG).show();
                            }
                        });

                    }

                    @Override
                    public void onResponse(Call call, final Response response) throws IOException {

                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    String str = response.body().string();
                                    listModel = new InventoryListModel(str);
                                    QRScannerActivity.this.runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
//                                            先更新，再删除loading页面，运行用户继续操作
                                            updateInventoryListData(listModel.getReadOnlyOptions());
                                            loadDialogUtils.closeDialog(loadingDialog);
                                            Toast.makeText(QRScannerActivity.this," yhf 获取main List请求成功",Toast.LENGTH_LONG).show();
                                        }
                                    });

                                    System.out.println("yhf response content+" + str);
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                            }
                        }).start();
                    }
                });
            }
        }).start();

    }

    void updateInventoryListData(ArrayList<String> strings) {
        inventoryList.clear();
        inventoryList.addAll(strings);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                adapter.clear();
                adapter.addAll(inventoryList);
                adapter.notifyDataSetChanged();
            }
        });

    }

    //    5个API请求代码结束
    void pickPictureFromLocal() {
//        scanResultLayout.setVisibility(View.INVISIBLE);
        Intent innerIntent = new Intent(Intent.ACTION_GET_CONTENT);
        innerIntent.setType("image/*");
        Intent wrapperIntent = Intent.createChooser(innerIntent, "选择二维码图片");
        startActivityForResult(wrapperIntent, REQUEST_CODE_PICK_PICTURE);
    }

    void scanDirectly() {
        //                scanResult.setText(null);
//        scanResultLayout.setVisibility(View.INVISIBLE);
//        // 创建IntentIntegrator对象
        IntentIntegrator intentIntegrator = new IntentIntegrator(QRScannerActivity.this);
//                // 开始扫描
        intentIntegrator.initiateScan();
    }

    /**
     * 盘点按钮
     */
    void doInvetory() {
//        Toast.makeText(this,"点击盘点按钮",Toast.LENGTH_LONG).show();
//        showReadOnlyDialog("盘点","这里放盘点的信息");
        sendRequestForDataUpdate(INVENTORY);
    }

    /**
     * 更改按钮逻辑
     */
    void modify() {
//        Toast.makeText(this,"点击更改按钮",Toast.LENGTH_LONG).show();
//        showEditAbleDialog("修改","这里放修改盘点单的信息");
//        首先要从editTextView里面读入 已经修改的数值
        updateAssetModel();
//        根据更新后的数值
        sendRequestForDataUpdate(MODIFY);
    }

    /**
     * TextView scanResultAssetsIdText;
     * TextView scanResultAssetsIdName;
     * TextView scanResultAssetsSpecifications;
     * TextView scanResultAssetsDepartment;
     * TextView scanResultAssetsKeeper;
     * TextView  scanResultAssetsBeginDate;
     * 在按下按钮后去更新model数值，其实也可以用editText 的 onTextChanged函数
     */
    private void updateAssetModel() {
        if (assetElement != null) {
            assetElement.setAssetId(scanResultAssetsId.getText().toString());
            assetElement.setAssetName(scanResultAssetsName.getText().toString());
            assetElement.setAssetSpecs(scanResultAssetsSpecifications.getText().toString());
            assetElement.setAssetDepartment(scanResultAssetsDepartment.getText().toString());
            assetElement.setAssetKeeper(scanResultAssetsKeeper.getText().toString());
            assetElement.setAssetBeginDate(scanResultAssetsBeginDate.getText().toString());
            assetElement.updateAssetJson();
        }
    }

    /**
     * 废弃按钮逻辑
     */
    void discard() {
//        Toast.makeText(this,"点击废弃按钮",Toast.LENGTH_LONG).show();
//        showReadOnlyDialog("废弃","这里放废弃盘点单的信息");
        sendRequestForDataUpdate(DISCARD);
    }


    //https://blog.csdn.net/qq_43122641/article/details/98597957
    void sendRequestForDataUpdate(final int changeStatus) {
//        scanResultDialog.dismiss();
        new Thread(new Runnable() {
            @Override
            public void run() {
                RequestHelper.sendRequest(QRScannerActivity.this, getUrlForCheckDataUpdate(changeStatus), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        QRScannerActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                loadDialogUtils.closeDialog(loadingDialog);
                                String str = "请求失败";
//                                try {
//                                    str= response.body().string();
//                                } catch (IOException e) {
//                                    e.printStackTrace();
//                                }
                                showSimpleFeedBackDialog(getButtonText(changeStatus), str);
                                Toast.makeText(QRScannerActivity.this, " yhf 测试okhttp请求失败", Toast.LENGTH_LONG).show();
                            }
                        });

                    }

                    @Override
                    public void onResponse(Call call, final Response response) throws IOException {

                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                //                                    String str = response.body().string();
//                                    listModel = new InventoryListModel(str);
                                String str = "no message";
                                try {
                                    str = response.body().string();
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                                final String finalStr = str;
                                QRScannerActivity.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
//                                            先更新，再删除loading页面，运行用户继续操作
//                                            updateInventoryListData(listModel.getReadOnlyOptions());
                                        loadDialogUtils.closeDialog(loadingDialog);
//                                        当操作成功后，去除这个细节弹窗，但是失败的时候，这个弹窗还是保留
                                        scanResultDialog.dismiss();

                                        //需要获取data里面的message
                                        showSimpleFeedBackDialog(getButtonText(changeStatus), finalStr);
//                                        Toast.makeText(QRScannerActivity.this," yhf 测试okhttp请求成功",Toast.LENGTH_LONG).show();
                                    }
                                });

//                                    System.out.println("yhf response content+"+str);
                            }
                        }).start();

                        ////

                        //                                    String str = response.body().string();
//                                    listModel = new InventoryListModel(str);
//                        QRScannerActivity.this.runOnUiThread(new Runnable() {
//                            @Override
//                            public void run() {
////                                            先更新，再删除loading页面，运行用户继续操作
////                                            updateInventoryListData(listModel.getReadOnlyOptions());
//                                loadDialogUtils.closeDialog(loadingDialog);
////                                        当操作成功后，去除这个细节弹窗，但是失败的时候，这个弹窗还是保留
//                                scanResultDialog.dismiss();
//                                String str="no message";
//                                try {
//                                    str= response.body().string();
//                                } catch (IOException e) {
//                                    e.printStackTrace();
//                                }
//                                //需要获取data里面的message
//                                showSimpleFeedBackDialog(getButtonText(changeStatus),str);
////                                        Toast.makeText(QRScannerActivity.this," yhf 测试okhttp请求成功",Toast.LENGTH_LONG).show();
//                            }
//                        });

                        ////

                    }
                });
            }
        }).start();

    }


    //  这里需要做二次验证，需要弹出js的登陆界面，需要研究一下
    void generateInventory() {
//        Toast.makeText(this,"生成盘点单:"+inventoryOption+"详情",Toast.LENGTH_LONG).show();
//        Intent intent = new Intent(QRScannerActivity.this, MainActivity.class);
//        startActivity(intent);
        sendRequestForGenerateInventoryList(inventoryOption);
    }


    //https://blog.csdn.net/qq_43122641/article/details/98597957
    void sendRequestForGenerateInventoryList( final String checkNum) {
//        scanResultDialog.dismiss();
        new Thread(new Runnable() {
            @Override
            public void run() {
                RequestHelper.sendRequest(QRScannerActivity.this, getUrlForConfirmSubmit(checkNum), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        QRScannerActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                loadDialogUtils.closeDialog(loadingDialog);
                                String str = "请求失败";
//                                try {
//                                    str= response.body().string();
//                                } catch (IOException e) {
//                                    e.printStackTrace();
//                                }
                                showSimpleFeedBackDialog("生成盘点单", str);
                                Toast.makeText(QRScannerActivity.this, " yhf 测试okhttp请求失败", Toast.LENGTH_LONG).show();
                            }
                        });

                    }

                    @Override
                    public void onResponse(Call call, final Response response) throws IOException {

                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                //                                    String str = response.body().string();
//                                    listModel = new InventoryListModel(str);
                                String str = "no message";
                                try {
                                    str = response.body().string();
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                                final String finalStr = str;
                                QRScannerActivity.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
//                                            先更新，再删除loading页面，运行用户继续操作
//                                            updateInventoryListData(listModel.getReadOnlyOptions());
                                        loadDialogUtils.closeDialog(loadingDialog);
//                                        当操作成功后，去除这个细节弹窗，但是失败的时候，这个弹窗还是保留
                                        if(scanResultDialog != null) {
                                            scanResultDialog.dismiss();
                                        }

                                        //需要获取data里面的message
                                        showSimpleFeedBackDialog("生成盘点单", finalStr);
//                                        Toast.makeText(QRScannerActivity.this," yhf 测试okhttp请求成功",Toast.LENGTH_LONG).show();
                                    }
                                });

//                                    System.out.println("yhf response content+"+str);
                            }
                        }).start();

                        ////

                        //                                    String str = response.body().string();
//                                    listModel = new InventoryListModel(str);
//                        QRScannerActivity.this.runOnUiThread(new Runnable() {
//                            @Override
//                            public void run() {
////                                            先更新，再删除loading页面，运行用户继续操作
////                                            updateInventoryListData(listModel.getReadOnlyOptions());
//                                loadDialogUtils.closeDialog(loadingDialog);
////                                        当操作成功后，去除这个细节弹窗，但是失败的时候，这个弹窗还是保留
//                                scanResultDialog.dismiss();
//                                String str="no message";
//                                try {
//                                    str= response.body().string();
//                                } catch (IOException e) {
//                                    e.printStackTrace();
//                                }
//                                //需要获取data里面的message
//                                showSimpleFeedBackDialog(getButtonText(changeStatus),str);
////                                        Toast.makeText(QRScannerActivity.this," yhf 测试okhttp请求成功",Toast.LENGTH_LONG).show();
//                            }
//                        });

                        ////

                    }
                });
            }
        }).start();

    }

    String getButtonText(int changeStatus) {
        switch (changeStatus) {
            case -1:
                return getString(R.string.scanner_activity_discard);
            case 0:
                return getString(R.string.scanner_activity_inventory);
            case 1:
                return getString(R.string.scanner_activity_modify);
            default:
                return "";
        }
    }

    /**
     * 当盘点/报废按钮 按下后 发送请求后的回馈，表示成功或者失败
     *
     * @param title
     * @param message
     */
    void showSimpleFeedBackDialog(String title, String message) {
        if (dialog == null) {
            dialog = new AlertDialog.Builder(this)
                    .setTitle("这是标题")
                    .setMessage("")
                    .setIcon(R.mipmap.ic_launcher)
                    .setPositiveButton("确定", new DialogInterface.OnClickListener() {//添加"Yes"按钮
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
//                            Toast.makeText(QRScannerActivity.this, "这是确定按钮", Toast.LENGTH_SHORT).show();
                        }
                    })

//                    .setNegativeButton("取消", new DialogInterface.OnClickListener() {//添加取消
//                        @Override
//                        public void onClick(DialogInterface dialogInterface, int i) {
////                            Toast.makeText(QRScannerActivity.this, "这是取消按钮", Toast.LENGTH_SHORT).show();
//                        }
//                    })
                    .create();
        }
        dialog.setTitle(title);

        /**
         * {
         *   "code": "200",
         *   "msg": "调用成功",
         *   "data": "{\"code\":1,\"result\":true,\"message\":\"已修改,临时保存成功\",\"data\":null}"
         * }
         */
        String feedBack = "";
        try {
            JSONObject jsonObject = new JSONObject(message);
            String data = jsonObject.getString("data");
            JSONObject dataJson = new JSONObject(data);
            feedBack = dataJson.getString("message");
        } catch (JSONException e) {
            e.printStackTrace();
        }
//        dialog.setMessage(message);
        dialog.setMessage(feedBack);
        dialog.show();
//                .setNeutralButton("普通按钮", new DialogInterface.OnClickListener() {//添加普通按钮
//                    @Override
//                    public void onClick(DialogInterface dialogInterface, int i) {
//                        Toast.makeText(QRScannerActivity.this, "这是普通按钮按钮", Toast.LENGTH_SHORT).show();
//                    }
//                }).create()
    }


    /**
     * 当扫描二维码出错的时候，之前回闪退，现在提示重新扫描的弹窗
     *
     */
    void showScanBarcodeErroDialog() {
        if (scanBarcodeErrorDialog == null) {
            scanBarcodeErrorDialog = new AlertDialog.Builder(this)
                    .setTitle("扫描二维码失败")
                    .setMessage("扫描二维码失败，请重新扫描")
                    .setIcon(R.mipmap.ic_launcher)
                    .setPositiveButton("确定", new DialogInterface.OnClickListener() {//添加"Yes"按钮
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
//                            Toast.makeText(QRScannerActivity.this, "这是确定按钮", Toast.LENGTH_SHORT).show();
                        }
                    })

//                    .setNegativeButton("取消", new DialogInterface.OnClickListener() {//添加取消
//                        @Override
//                        public void onClick(DialogInterface dialogInterface, int i) {
////                            Toast.makeText(QRScannerActivity.this, "这是取消按钮", Toast.LENGTH_SHORT).show();
//                        }
//                    })
                    .create();
        }
//        scanBarcodeErrorDialog.setTitle("扫描二维码失败");
//        scanBarcodeErrorDialog.setMessage("扫描二维码失败，请重新扫描");
        scanBarcodeErrorDialog.show();
    }


    //https://blog.csdn.net/qq_35698774/article/details/79779238
    void showInventoryDetailDialogOld(String title, String message) {
        if (inventoryDetailDialog == null) {
            inventoryDetailDialog = new AlertDialog.Builder(this)
                    .setTitle("这是标题")
                    .setMessage("")
                    .setIcon(R.mipmap.ic_launcher)
                    .setPositiveButton("确定", new DialogInterface.OnClickListener() {//添加"Yes"按钮
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
//                            Toast.makeText(QRScannerActivity.this, "这是确定按钮", Toast.LENGTH_SHORT).show();
                        }
                    })

                    .setNegativeButton("取消", new DialogInterface.OnClickListener() {//添加取消
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
//                            Toast.makeText(QRScannerActivity.this, "这是取消按钮", Toast.LENGTH_SHORT).show();
                        }
                    }).create();
            inventoryDetailDialog.setView(onlyInventoryDetailView);
        }
        inventoryDetailDialog.setTitle(title);
        inventoryDetailDialog.setMessage(message);
        inventoryDetailDialog.show();
    }

    void showInventoryDetailDialog(String title, String message) {
        if (inventoryDetailDialog == null) {
            inventoryDetailDialog = new AlertDialog.Builder(this)
                    .setTitle("这是标题")
                    .setMessage("")
                    .setIcon(R.mipmap.ic_launcher).
                            setPositiveButton("确定", new DialogInterface.OnClickListener() {//添加"Yes"按钮
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
//                            Toast.makeText(QRScannerActivity.this, "这是确定按钮", Toast.LENGTH_SHORT).show();
                                }
                            }).setNegativeButton("取消", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {

                        }
                    })

                    .create();
            inventoryDetailDialog.setView(onlyInventoryDetailView);
        }
        inventoryDetailDialog.setTitle(title);
//       data
        fillScanResult(message, 1);
//        从上面函数的data作为列表数据
        initAssetElementListView();
//        alignLeftTextAndEditText();
        inventoryDetailDialog.show();
    }

    void dismissInventoryDetailDialog(){
        if(inventoryDetailDialog != null && inventoryDetailDialog.isShowing()){
            inventoryDetailDialog.dismiss();
        }
    }

    private void initAssetElementListView(){
        AssetElementAdapter assetElementAdapter = new AssetElementAdapter(detailButtonResult.getList());
        RecyclerView assetElementListView = (RecyclerView) onlyInventoryDetailView.findViewById(R.id.inventoryDetailList);
        assetElementListView.setAdapter(assetElementAdapter);
        assetElementListView.setLayoutManager(new LinearLayoutManager(this, RecyclerView.VERTICAL, false));
        //添加分割线
        assetElementListView.addItemDecoration(new RecycleViewDivider(this,LinearLayoutManager.VERTICAL));
        assetElementListView.setVerticalScrollBarEnabled(true);
//        RecycleViewDivider dec = new DividerItemDecoration(mContext,DividerItemDecoration.VERTICAL);

    }

    /*
    void showEditAbleDialog(String title,String message){
        if(modifyDialog == null) {
             modifyDialog = new AlertDialog.Builder(this)
                    .setTitle("这是标题")
                    .setMessage("")
                    .setIcon(R.mipmap.ic_launcher)
                    .setPositiveButton("确定", new DialogInterface.OnClickListener() {//添加"Yes"按钮
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            Toast.makeText(QRScannerActivity.this, "这是确定按钮", Toast.LENGTH_SHORT).show();
                        }
                    })

                    .setNegativeButton("取消", new DialogInterface.OnClickListener() {//添加取消
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            Toast.makeText(QRScannerActivity.this, "这是取消按钮", Toast.LENGTH_SHORT).show();
                        }
                    }).create();
        }
        modifyDialog.setTitle(title);
        modifyDialog.setView(modifyEditLayout);
        modifyEditText = (EditText) modifyEditLayout.findViewById(R.id.modifyDialogEditText);
        modifyEditText.setText(message);
        modifyEditText.setCursorVisible(true);
//        dialog.setMessage(message);
        modifyDialog.show();
    }
     */

    /**
     * AsyncTask 静态内部类，防止内存泄漏
     */
    static class QrCodeAsyncTask extends AsyncTask<String, Integer, String> {
        private WeakReference<Activity> mWeakReference;
        private String path;

        public QrCodeAsyncTask(Activity activity, String path) {
            mWeakReference = new WeakReference<>(activity);
            this.path = path;
        }

        @Override
        protected String doInBackground(String... strings) {
            // 解析二维码/条码
            return QRCodeDecoder.syncDecodeQRCode(path);
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            //识别出图片二维码/条码，内容为s
            QRScannerActivity activity = (QRScannerActivity) mWeakReference.get();
            if (activity != null) {
//                activity.handleQrCode(s);
                activity.getAssetDetailByAssetNumFromScanResult(s);
            }
        }
    }

    /**
     * 处理图片二维码解析的数据
     *
     * @param s
     */
    public void handleQrCode(String s) {
        if (null == s) {
            Toast.makeText(getApplicationContext(), "图片格式有误", Toast.LENGTH_LONG).show();
        } else {
            // 识别出图片二维码/条码，内容为s
            handleResult(s);
//            Toast.makeText(getApplicationContext(), s, Toast.LENGTH_LONG).show();
        }
    }

    private void handleResult(String result) {
//        showScanResult(result);
        showAssetScanDetailResultDialog("扫描结果", result);
    }


//    private void fillScanResult(String result) {
//        scanResultLayout.setVisibility(View.VISIBLE);
//        int assetsIdBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_id));
//        int assetsNameBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_name));
//        int assetsSpecificationsBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_specifications));
//        int assetsDepartmentBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_department));
//        int assetsPersionBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_person));
//        int assetsBeginDateBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_begin_date));
////        信息是2个名称之间
//        String assetsId = result.substring(getRealStartIndex(assetsIdBeginIndex, R.string.scanner_result_assets_id), assetsNameBeginIndex-1);
//        String assetsName = result.substring(getRealStartIndex(assetsNameBeginIndex, R.string.scanner_result_assets_name), assetsSpecificationsBeginIndex-1);
//        String assetsSpecifications = result.substring(getRealStartIndex(assetsSpecificationsBeginIndex, R.string.scanner_result_assets_specifications), assetsDepartmentBeginIndex-1);
//        String assetsDepartment = result.substring(getRealStartIndex(assetsDepartmentBeginIndex, R.string.scanner_result_assets_department), assetsPersionBeginIndex-1);
//        String assetsPersion = result.substring(getRealStartIndex(assetsPersionBeginIndex, R.string.scanner_result_assets_person), assetsBeginDateBeginIndex-1);
//        String assetsBeginDate = result.substring(getRealStartIndex(assetsBeginDateBeginIndex, R.string.scanner_result_assets_begin_date));
//
//        scanResultAssetsIdText.setText(assetsId);
//        scanResultAssetsIdName.setText(assetsName);
//        scanResultAssetsSpecifications.setText(assetsSpecifications);
//        scanResultAssetsDepartment.setText(assetsDepartment);
//        scanResultAssetsPerson.setText(assetsPersion);
//        scanResultAssetsBeginDate.setText(assetsBeginDate);
//    }

    /**
     *
     * @param result
     * @param whichDialog 0 代表扫描二维码后显示的dialog,1 代表按下"详情"后显示的dialog
     */
    private void fillScanResult(String result,int whichDialog) {
        if(whichDialog ==0){
            assetElement = new AssetElement(result);
            scanResultAssetsId.setText(assetElement.getAssetId());
            scanResultAssetsName.setText(assetElement.getAssetName());
            scanResultAssetsSpecifications.setText(assetElement.getAssetSpecs());
            scanResultAssetsDepartment.setText(assetElement.getAssetDepartment());
            scanResultAssetsKeeper.setText(assetElement.getAssetKeeper());
            scanResultAssetsBeginDate.setText(assetElement.getAssetBeginDate());
        }else{
            detailButtonResult = new AssetElementList(result);
//            detailAssetsId.setText(assetElementFromDetailButtonClicked.getAssetId());
//            detailAssetsName.setText(assetElementFromDetailButtonClicked.getAssetName());
//            detailAssetsSpecifications.setText(assetElementFromDetailButtonClicked.getAssetSpecs());
//            detailAssetsDepartment.setText(assetElementFromDetailButtonClicked.getAssetDepartment());
//            detailAssetsKeeper.setText(assetElementFromDetailButtonClicked.getAssetKeeper());
//            detailAssetsBeginDate.setText(assetElementFromDetailButtonClicked.getAssetBeginDate());
        }
//        scanResultLayout.setVisibility(View.VISIBLE);

    }




//    void fillAssetElementObject(AssetElement assetElement,String result){
//        if(assetElement != null){
//
//        }
//    }

    private void praseAssetDetaiJson(String response) {

    }

    private String getAssetId(String scanResult) {
        System.out.println(" crash scanResult= "+scanResult);
        int assetsIdBeginIndex = scanResult.indexOf(getString(R.string.scanner_result_assets_id));
        System.out.println(" crash assetsIdBeginIndex = "+assetsIdBeginIndex);
        int assetsNameBeginIndex = scanResult.indexOf(getString(R.string.scanner_result_assets_name));
        System.out.println(" crash assetsNameBeginIndex = "+assetsNameBeginIndex);
//        信息是2个名称之间
        String assetsId = scanResult.substring(getRealStartIndex(assetsIdBeginIndex, R.string.scanner_result_assets_id), assetsNameBeginIndex - 1);
        return assetsId;
    }

    private int getRealStartIndex(int beginIndex, int stringId) {
        String str = getString(stringId);
        System.out.println(" crash getRealStartIndex str = "+str);
        if (getString(stringId) == null) {
            System.out.println(" crash getRealStartIndex getString(stringId) == null ");
            return beginIndex;
        }
        int result =beginIndex + str.length() + 1;
        System.out.println(" crash getRealStartIndex return "+result);
        return beginIndex + str.length() + 1; //1 为了分号
    }


//    https://www.cnblogs.com/rustfisher/p/12254732.html
//    RecyclerView
    private class VH extends RecyclerView.ViewHolder {
        TextView assetId;
        TextView assetName;
        TextView assetChangeDate;
        TextView assetChangeStatus;

        public VH(View itemView) {
            super(itemView);
            assetId = (TextView) itemView.findViewById(R.id.inventory_list_item_asset_id);
            assetName = (TextView) itemView.findViewById(R.id.inventory_list_item_asset_name);
            assetChangeDate = (TextView) itemView.findViewById(R.id.inventory_list_item_asset_changeDate);
            assetChangeStatus = (TextView) itemView.findViewById(R.id.inventory_list_item_asset_changeStatus);
        }
    }

    private class AssetElementAdapter extends RecyclerView.Adapter<VH> {

        private List<AssetElement> dataList;

        public AssetElementAdapter(List<AssetElement> dataList) {
            this.dataList = dataList;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.inventory_item_horizontalscroll, parent, false));
//            return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.inventory_item, parent, false));
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            AssetElement assetElement = dataList.get(position);
            holder.assetId.setText(assetElement.getAssetId());
            holder.assetName.setText(assetElement.getAssetName());
            holder.assetChangeDate.setText(assetElement.getAssetChangeDate());
            holder.assetChangeStatus.setText(String.valueOf(assetElement.getAssetChangeStatusString()));

        }

        @Override
        public int getItemCount() {
            return dataList.size();
        }
    }



//    private int getRealEndIndex()
}