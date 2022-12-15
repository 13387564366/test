package com.constant;

/**
 * 用于放置一些可能会被改的 常量，比如url
 */
public class ConfigurationInformation {
    //    盘点界面 5个API的url前缀
    public static String inventoryUrl = "http://115.231.102.41/gdzcCheck/";

//    下面涉及5个API请求
//    获取当前用户的所有盘点单号
    public static final int CHECK_MAIN_LIST_TYPE = 0;
    //    获取当前盘点单的详情
    public static final int CHECK_DATA_TEMP_TYPE = 1;
    //    根据资产编码获取资产详情
    public static final int GET_FA_CARD_TYPE = 2;
    //    报废/盘点/更改 按钮发出的请求
    public static final int CHECK_DATA_UPDATE_TYPE = 3;
    //    "生成盘点单"按钮发出的请求
    public static final int COMFIRM_SUBMIT_TYPE = 4;

    public static String CHECK_MAIN_LIST_STR = "CheckMainList";
    public static String CHECK_DATA_TEMP_STR = "CheckDataTemp";
    public static String GET_FA_CARD_STR = "GetFaCard";
    public static String CHECK_DATA_UPDATE_STR = "CheckDataUpdate";
    public static String CONFIRM_SUBMIT_STR = "ConfirmSubmit";

    public static final int DISCARD = -1;
    public static final int INVENTORY = 0;
    public static final int MODIFY = 1;

}
