package com.personalos.app.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;
import com.personalos.app.MainActivity;
import com.personalos.app.R;

/**
 * Android Home Screen Widget for Personal OS.
 * Provides quick glance at daily focus and instant 1-tap capture.
 */
public class PersonalOSWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_personal_os);

            // Intent for clicking the widget body -> open workstation
            Intent openIntent = new Intent(context, MainActivity.class);
            openIntent.setAction(Intent.ACTION_VIEW);
            openIntent.setData(Uri.parse("personalos://dashboard"));
            PendingIntent openPendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                openIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_root, openPendingIntent);

            // Intent for clicking "+ Quick Capture" -> open voice/note capture modal
            Intent captureIntent = new Intent(context, MainActivity.class);
            captureIntent.setAction(Intent.ACTION_VIEW);
            captureIntent.setData(Uri.parse("personalos://capture?voice=true"));
            PendingIntent capturePendingIntent = PendingIntent.getActivity(
                context, 
                1, 
                captureIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_btn_capture, capturePendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
