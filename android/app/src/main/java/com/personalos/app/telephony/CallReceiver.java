package com.personalos.app.telephony;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.telephony.TelephonyManager;
import androidx.core.app.NotificationCompat;
import com.personalos.app.MainActivity;
import com.personalos.app.R;

/**
 * Post-call interaction logger for Personal OS CRM.
 * Detects CALL_STATE_IDLE after an active call and posts a reminder notification
 * to capture client meeting notes or action items.
 */
public class CallReceiver extends BroadcastReceiver {

    private static final String CHANNEL_ID = "crm_call_capture_channel";
    private static int lastState = TelephonyManager.CALL_STATE_IDLE;
    private static boolean wasInCall = false;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!TelephonyManager.ACTION_PHONE_STATE_CHANGED.equals(intent.getAction())) {
            return;
        }

        String stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        if (stateStr == null) return;

        int state = TelephonyManager.CALL_STATE_IDLE;
        if (stateStr.equals(TelephonyManager.EXTRA_STATE_RINGING)) {
            state = TelephonyManager.CALL_STATE_RINGING;
        } else if (stateStr.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {
            state = TelephonyManager.CALL_STATE_OFFHOOK;
            wasInCall = true;
        }

        if (state == TelephonyManager.CALL_STATE_IDLE && wasInCall) {
            wasInCall = false;
            // Call just ended, prompt user to log notes
            showLogCallNotification(context);
        }

        lastState = state;
    }

    private void showLogCallNotification(Context context) {
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "CRM Interaction Prompts",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Prompts to log client notes after phone calls");
            manager.createNotificationChannel(channel);
        }

        Intent logIntent = new Intent(context, MainActivity.class);
        logIntent.setAction(Intent.ACTION_VIEW);
        logIntent.setData(Uri.parse("personalos://capture?quick_note=Call%20Summary"));
        logIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            102,
            logIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Log Client Interaction")
            .setContentText("Call ended. Tap to record voice note or capture follow-up task.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        manager.notify(8891, builder.build());
    }
}
