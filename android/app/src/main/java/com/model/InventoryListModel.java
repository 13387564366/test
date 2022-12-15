package com.model;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;

public class InventoryListModel {
    String mainListResponse;
    String msg;
    String code;
    String rawData;
//    盘点号
    ArrayList<String> options = new ArrayList<>();

    public InventoryListModel(String response){
        mainListResponse = response;
        praseJSON(response);
    }

    void praseJSON(String str){
        try {
            JSONObject json= new JSONObject(str);
            msg=json.optString("msg","");
            code = json.optString("code","");
            rawData =json.optString("data","");
//            String data =json.optString("data");
            JSONObject jsonData = new JSONObject(rawData);
            if(jsonData.has("data")) {
                JSONArray array = jsonData.getJSONArray("data");
                for (int i = 0; i < array.length(); ++i) {
                    JSONObject object = array.getJSONObject(i);
                    options.add(object.optString("sNum"));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
//        System.out.println("yhf response content+"+data);
    }

    public ArrayList<String> getOptions() {
        return options;
    }

    public ArrayList<String> getReadOnlyOptions(){
        ArrayList<String> listCopy=new ArrayList<>();
        for (String str : options) {
            listCopy.add(str);
            System.out.println("yhf get main list"+str);
        }
        return listCopy;
    }
}
