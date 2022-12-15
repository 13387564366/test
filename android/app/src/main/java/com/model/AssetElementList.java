package com.model;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

/**
 * 按下详情后获取的结果
 */
public class AssetElementList {
    String msg;
    String code;
    String rawData;
    ArrayList<AssetElement> list = new ArrayList<>();

    public ArrayList<AssetElement> getList() {
        return list;
    }

    public AssetElementList(String result) {
        prase(result);
    }

    void prase(String result) {
        JSONObject json = null;
        try {
            json = new JSONObject(result);
            msg = json.optString("msg", "");
            code = json.optString("code", "");
            rawData = json.optString("data", "");
//            String data =json.optString("data");
            JSONObject rawDataJson = new JSONObject(rawData);
            if (rawDataJson.has("data")) {
                JSONArray dataJson = rawDataJson.getJSONArray("data");
                for (int i = 0; i < dataJson.length(); i++) {
                    JSONObject jsonObject = dataJson.getJSONObject(i);
                    AssetElement assetElement = new AssetElement(jsonObject,true);
                    list.add(assetElement);
                }
            }
//            String returnData=getUpdatedAssetString(1);
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }
}
