# Image Mapping Fix Documentation

## Problem

Specific teams and circuits had images that weren't loading:

### Teams Not Loading:
- ❌ Red Bull Racing
- ❌ Racing Bulls (RB)
- ❌ Kick Sauber
- ❌ Haas

### Circuits Not Loading:
- ❌ All circuit images

## Root Cause

**Mismatch between database IDs and image filenames:**

### Circuit ID Mismatches
Backend database uses different IDs than image filenames:

| Backend Circuit ID | Image Filename | Location |
|-------------------|----------------|----------|
| `jeddah` | `circuit-saudi_arabia.png` | Saudi Arabia |
| `albert_park` | `circuit-australia.png` | Australia |
| `villeneuve` | `circuit-canada.png` | Canada |
| `red_bull_ring` | `circuit-austria.png` | Austria |
| `catalunya` | `circuit-spain.png` | Spain |
| `hungaroring` | `circuit-hungary.png` | Hungary |
| `spa` | `circuit-belgium.png` | Belgium |
| `zandvoort` | `circuit-netherlands.png` | Netherlands |
| `monza` | `circuit-italy.png` | Italy |
| `baku` | `circuit-azerbaijan.png` | Azerbaijan |
| `marina_bay` | `circuit-singapore.png` | Singapore |
| `americas` | `circuit-united_states.png` | USA |
| `rodriguez` | `circuit-mexico.png` | Mexico |
| `interlagos` | `circuit-brazil.png` | Brazil |
| `losail` | `circuit-qatar.png` | Qatar |
| `yas_marina` | `circuit-abu_dhabi.png` | Abu Dhabi |
| `imola` | `circuit-emilia_romagna.png` | Italy |
| `silverstone` | `circuit-great_britain.png` | UK |
| `shanghai` | `circuit-china.png` | China |
| `suzuka` | `circuit-japan.png` | Japan |

### Team ID Variations
Some teams have multiple possible IDs in the database:

| Possible IDs | Mapped To | Image File |
|-------------|-----------|------------|
| `red_bull_racing`, `redbull` | `red_bull` | `team-red_bull.png` |
| `racing_bulls`, `alphatauri`, `alpha_tauri` | `rb` | `team-rb.png` |
| `kick_sauber`, `alfa_romeo`, `alfa` | `sauber` | `team-sauber.png` |
| `haas_f1_team` | `haas` | `team-haas.png` |

## Solution Implemented

### 1. Frontend Fix (`frontend/src/utils/imageUtils.js`)

#### Circuit Mapping
Added circuit ID mapping in `getCircuitImage()`:
```javascript
const circuitMapping = {
  'jeddah': 'saudi_arabia',
  'albert_park': 'australia',
  'villeneuve': 'canada',
  // ... etc
};
```

#### Team/Car Mapping
Added team ID mapping in `getTeamImage()` and `getCarImage()`:
```javascript
const teamIdMapping = {
  'red_bull_racing': 'red_bull',
  'racing_bulls': 'rb',
  'kick_sauber': 'sauber',
  'haas_f1_team': 'haas',
  // ... etc
};
```

### 2. Backend Fix (`backend/server.js`)

Updated `getTeamLogo()` and `getCarImage()` functions with the same team ID mapping to ensure consistency between frontend and backend.

## Files Modified

### Frontend
- ✅ `frontend/src/utils/imageUtils.js` - Added circuit and team ID mappings

### Backend
- ✅ `backend/server.js` - Added team ID mappings to getTeamLogo() and getCarImage()

## Testing

After applying these fixes, test the following pages:

### Constructor/Teams Pages
1. Navigate to **Teams** page
2. Verify all team logos load correctly:
   - ✅ Red Bull Racing logo
   - ✅ RB (Racing Bulls) logo
   - ✅ Kick Sauber logo
   - ✅ Haas logo
3. Verify all team car images load correctly

### Schedule Pages
1. Navigate to **Schedule** page
2. Verify circuit images load for all races
3. Check specific circuits that had issues:
   - ✅ Jeddah (Saudi Arabia)
   - ✅ Albert Park (Australia)
   - ✅ Villeneuve (Canada)
   - ✅ Red Bull Ring (Austria)

### Constructor Standings
1. Navigate to **Constructor Standings**
2. Verify team logos display correctly in the table

## Image Files Location

All image files are correctly placed in:
```
frontend/public/images/
├── teams/
│   ├── team-red_bull.png ✅
│   ├── team-rb.png ✅
│   ├── team-sauber.png ✅
│   ├── team-haas.png ✅
│   └── [other teams...]
├── cars/
│   ├── car-red_bull-2025.png ✅
│   ├── car-rb-2025.png ✅
│   ├── car-sauber-2025.png ✅
│   ├── car-haas-2025.png ✅
│   └── [other cars...]
└── circuits/
    ├── circuit-saudi_arabia.png ✅
    ├── circuit-australia.png ✅
    ├── circuit-canada.png ✅
    ├── circuit-austria.png ✅
    └── [other circuits...]
```

## Benefits

1. **Consistent Mapping**: Both frontend and backend now use the same ID mappings
2. **Flexible IDs**: Handles multiple variations of team names (e.g., "Racing Bulls", "AlphaTauri", "RB")
3. **Future-Proof**: Easy to add new mappings if database IDs change
4. **Fallback Support**: ImageWithFallback component still provides placeholder images if mapping fails

## Next Steps

If images still don't load:

1. **Check Browser Console**: Look for 404 errors with specific image paths
2. **Verify File Names**: Ensure image files match the exact names in the mappings
3. **Clear Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Case Sensitivity**: File names should be lowercase with underscores

## Additional Notes

- The ImageWithFallback component will automatically show placeholders if any images fail to load
- Console warnings will appear for failed image loads to help with debugging
- All mappings are centralized in one place for easy maintenance
