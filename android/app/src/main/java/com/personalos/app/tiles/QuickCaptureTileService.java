package com.personalos.app.tiles;

import android.content.Intent;
import android.net.Uri;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;
import com.personalos.app.MainActivity;

/**
 * Android Quick Settings Tile for 1-tap capture on POCO C61 / Android.
 * Launches Personal OS directly into the Quick Capture voice modal.
 */
public class QuickCaptureTileService extends TileService {

    @Override
    public void onStartListening() {
        super.onStartListening();
        Tile tile = getQsTile();
        if (tile != null) {
            tile.setState(Tile.STATE_INACTIVE);
            tile.setLabel("Quick Capture");
            tile.updateTile();
        }
    }

    @Override
    public void onClick() {
        super.onClick();
        
        Intent intent = new Intent(this, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("personalos://capture?voice=true"));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // On Android 14+ (API 34) startPendingIntentBackgrounding or startActivityAndCollapse
        try {
            startActivityAndCollapse(intent);
        } catch (Exception e) {
            startActivity(intent);
        }
    }
}
