package com.personalos.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        handleIncomingIntent(getIntent());
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        handleIncomingIntent(intent);
        super.onNewIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        String type = intent.getType();

        // Convert Android system share (ACTION_SEND) into deep link capture event
        if (Intent.ACTION_SEND.equals(action) && type != null && "text/plain".equals(type)) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (sharedText != null && !sharedText.trim().isEmpty()) {
                Uri captureUri = new Uri.Builder()
                    .scheme("personalos")
                    .authority("capture")
                    .appendQueryParameter("shared_text", sharedText.trim())
                    .build();
                intent.setData(captureUri);
                intent.setAction(Intent.ACTION_VIEW);
            }
        }
    }
}
