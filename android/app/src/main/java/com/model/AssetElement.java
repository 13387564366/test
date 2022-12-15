package com.model;

import com.zjmileasing.app.MainApplication;
import com.zjmileasing.app.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import static com.constant.ConfigurationInformation.MODIFY;

/**
 * <string name="scanner_result_assets_id">资产编码</string>
 *     <string name="scanner_result_assets_name">资产名称</string>
 *     <string name="scanner_result_assets_specifications">资产规格</string>
 *     <string name="scanner_result_assets_department">使用部门</string>
 *     <string name="scanner_result_assets_person">使用人员</string>
 *     <string name="scanner_result_assets_begin_date">开始使用日期</string>
 */
public class AssetElement {


    final  int NULL_VALUE_FOR_CHANGE_STATUS = 99;
    String msg;
    String code;
    String rawData;

//    具体信息
    String assetId;
    String assetName;
    String assetSpecs;
    String assetDepartment;
    String assetKeeper;
    String assetBeginDate;
    int  assetChangeStatus;
    String assetChangeDate;


    JSONObject assetJson;
    JSONObject checkDataJson;



    private String getString(int id){
        return MainApplication.getInstance().getApplicationContext().getString(id);
    }

    /**
     *
     * @param response

     */
    public AssetElement(String response){
        JSONObject json= null;
        try {
            json = new JSONObject(response);
            prase2(json);
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    public AssetElement(JSONObject json){
         this(json,false);
    }

    public AssetElement(JSONObject json, boolean partial){
        if(partial){
            praseBasicInformation(json);
        }else {
            prase2(json);
        }
    }

    public String getMsg() {
        return msg;
    }

    public String getCode() {
        return code;
    }

    public String getRawData() {
        return rawData;
    }

    public String getAssetId() {
        return assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public String getAssetSpecs() {
        return assetSpecs;
    }

    public String getAssetDepartment() {
        return assetDepartment;
    }

    public String getAssetKeeper() {
        return assetKeeper;
    }

    public String getAssetBeginDate() {
        return assetBeginDate;
    }

    public int getAssetChangeStatus() {
        return assetChangeStatus;
    }

    /**
     * ChangeStatus -1：报废；0 ：盘点；1：更改  ChangeDate  变更时间 "yyyy-MM-dd HH:mm:ss
     * @return
     */
    public String getAssetChangeStatusString(){
        if(assetChangeStatus == NULL_VALUE_FOR_CHANGE_STATUS){
            return "null";
        }
        String result="unknow";
        if(assetChangeStatus == -1){
            result ="报废";
        }else if(assetChangeStatus == 0){
            result = "盘点";
        }else if (assetChangeStatus == 1){
            result = "更改";
        }
        return result;
//        return String.valueOf(assetChangeStatus);
    }

    public String getAssetChangeDate() {
        return assetChangeDate;
    }


//    void prase(String result){
//        int assetsIdBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_id));
//        int assetsNameBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_name));
//        int assetsSpecificationsBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_specifications));
//        int assetsDepartmentBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_department));
//        int assetsPersionBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_person));
//        int assetsBeginDateBeginIndex = result.indexOf(getString(R.string.scanner_result_assets_begin_date));
////        信息是2个名称之间
//         assetId = result.substring(getRealStartIndex(assetsIdBeginIndex, R.string.scanner_result_assets_id), assetsNameBeginIndex-1);
//         assetName = result.substring(getRealStartIndex(assetsNameBeginIndex, R.string.scanner_result_assets_name), assetsSpecificationsBeginIndex-1);
//         assetSpecs = result.substring(getRealStartIndex(assetsSpecificationsBeginIndex, R.string.scanner_result_assets_specifications), assetsDepartmentBeginIndex-1);
//         assetDepartment = result.substring(getRealStartIndex(assetsDepartmentBeginIndex, R.string.scanner_result_assets_department), assetsPersionBeginIndex-1);
//         assetKeeper = result.substring(getRealStartIndex(assetsPersionBeginIndex, R.string.scanner_result_assets_person), assetsBeginDateBeginIndex-1);
//         assetBeginDate = result.substring(getRealStartIndex(assetsBeginDateBeginIndex, R.string.scanner_result_assets_begin_date));
//    }

    private int getRealStartIndex(int beginIndex,int stringId){
        String str = getString(stringId);
        if(getString(stringId) ==null){
            return beginIndex;
        }
        return  beginIndex+str.length()+1; //1 为了分号
    }

    void prase2(JSONObject result){
        JSONObject json= result;
        try {
//            json = new JSONObject(result);
            msg=json.optString("msg","");
            code = json.optString("code","");
            rawData =json.optString("data","");
//            String data =json.optString("data");
            JSONObject rawDataJson = new JSONObject(rawData);

            if(rawDataJson.has("data")) {
                JSONObject dataJson = rawDataJson.optJSONObject("data");
/*
                if (dataJson.has("faCard")) {
                    assetJson = dataJson.optJSONObject("faCard");
                    praseBasicInformation(assetJson);
                }
                 */
                if(dataJson.has("checkData")){
                    assetJson=dataJson.optJSONObject("checkData");
                    praseBasicInformation(assetJson);
                }
            }
//            String returnData=getUpdatedAssetString(1);
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }


    //     "changeStatus": null,
//             "changeDate": null
    void praseBasicInformation(JSONObject assetJson){
        if(assetJson ==null){
            return;
        }
        assetId = assetJson.optString("sAssetNum");
        assetName = assetJson.optString("sAssetName");
        assetBeginDate = assetJson.optString("dStartdate");
        assetSpecs = assetJson.optString("sStyle");
        assetDepartment = assetJson.optString("sDeptNames");
        assetKeeper = assetJson.optString("sKeeper");
//        2021.12.31 为了在 "盘点单详情"中 再显示2列 信息而添加，其实changeStatus是可以
        assetChangeDate = assetJson.optString("changeDate","null");
        assetChangeStatus = assetJson.optInt("changeStatus",NULL_VALUE_FOR_CHANGE_STATUS);

    }
//    "changeStatus":0,"changeDate
//    ChangeStatus -1：报废；0 ：盘点；1：更改  ChangeDate  变更时间 "yyyy-MM-dd HH:mm:ss
//    2021.12.31. 这2个数据其实在JSON串中都有的
   public String getUpdatedAssetString(int changeStatus){
//        JSONObject jsonObject = null;
        try {
//            jsonObject = new JSONObject(rawData);
            assetJson.put("changeStatus",changeStatus);
//            if(changeStatus == MODIFY)
            {
                DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//             df.format(new Date());
                assetJson.put("changeDate", df.format(new Date()));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return  assetJson.toString();

    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public void setAssetSpecs(String assetSpecs) {
        this.assetSpecs = assetSpecs;
    }

    public void setAssetDepartment(String assetDepartment) {
        this.assetDepartment = assetDepartment;
    }

    public void setAssetKeeper(String assetKeeper) {
        this.assetKeeper = assetKeeper;
    }

    public void setAssetBeginDate(String assetBeginDate) {
        this.assetBeginDate = assetBeginDate;
    }

    public void updateAssetJson(){
        try {
            assetJson.put("sAssetNum",assetId);
            assetJson.put("sAssetName",assetName);
            assetJson.put("sStyle",assetSpecs);
            assetJson.put("sDeptNames",assetDepartment);
            assetJson.put("sKeeper",assetKeeper);
            assetJson.put("dStartdate",assetBeginDate);
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }
}
