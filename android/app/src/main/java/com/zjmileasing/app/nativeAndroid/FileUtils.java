package com.zjmileasing.app.nativeAndroid;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Created by tenwa on 16/12/23.
 */

public final class FileUtils {
    public static void inputStreamToFile(InputStream is, File file)throws IOException {
        if(is != null){
            try (
                    FileOutputStream fos=new FileOutputStream(file) ;
                    BufferedOutputStream bos = new BufferedOutputStream(fos);
            ){
                byte[] buf = new byte[8 * 1024];
                int len = -1;
                while ((len = is.read(buf)) != -1) {
                    bos.write(buf, 0, len);
                }
                bos.flush();
            }
        }
    }
}
