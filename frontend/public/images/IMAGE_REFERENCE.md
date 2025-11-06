# F1 Image Reference Guide

This document lists all images used in TheGridLive application and their expected locations.

## Image Directory Structure

```
public/images/
├── drivers/           # Individual driver portraits
├── teams/            # Team logos
├── cars/             # Team car images by season
├── circuits/         # Circuit/track images
├── driver-*.png      # Driver portraits (root level, legacy)
├── team-*.png        # Team logos (root level, legacy)
└── placeholders/     # Fallback placeholder images
```

## Naming Conventions

### Driver Images
Format: `driver-{driver_id}.png`
- driver_id: lowercase surname with underscores (e.g., `max_verstappen`, `lewis_hamilton`)
- Size: 400x400px recommended
- Location: `/images/driver-{driver_id}.png`

### Team Logos
Format: `team-{team_id}.png`
- team_id: lowercase team name with underscores (e.g., `red_bull`, `ferrari`)
- Size: 200x200px recommended (square)
- Location: `/images/team-{team_id}.png`

### Car Images
Format: `car-{team_id}-{year}.png`
- team_id: lowercase team name with underscores
- year: 4-digit year (e.g., 2025)
- Size: 800x400px recommended (2:1 aspect ratio)
- Location: `/images/cars/car-{team_id}-{year}.png`

### Circuit Images
Format: `circuit-{circuit_id}.png`
- circuit_id: lowercase circuit name with underscores (e.g., `monza`, `spa`)
- Size: 1200x600px recommended
- Location: `/images/circuits/circuit-{circuit_id}.png`

## 2025 Season - Required Driver Images

Replace these .txt placeholders with actual .png images:

### Red Bull Racing
- driver-max_verstappen.png ✓ (EXISTS)
- driver-lawson.png ✓ (EXISTS)

### Ferrari
- driver-leclerc.png ✓ (EXISTS)
- driver-hamilton.png ✓ (EXISTS)

### Mercedes
- driver-russell.png ✓ (EXISTS)
- driver-antonelli.png ✓ (EXISTS)

### McLaren
- driver-norris.png ✓ (EXISTS)
- driver-piastri.png ✓ (EXISTS)

### Aston Martin
- driver-alonso.png ✓ (EXISTS)
- driver-stroll.png ✓ (EXISTS)

### Alpine
- driver-gasly.png ✓ (EXISTS)
- driver-doohan.png ✓ (EXISTS)

### Williams
- driver-sainz.png ✓ (EXISTS)
- driver-albon.png ✓ (EXISTS)

### RB (AlphaTauri/Racing Bulls)
- driver-tsunoda.png ✓ (EXISTS)
- driver-hadjar.png ✓ (EXISTS)

### Haas
- driver-ocon.png ✓ (EXISTS)
- driver-bearman.png ✓ (EXISTS)

### Sauber/Kick Sauber
- driver-hulkenberg.png ✓ (EXISTS)
- driver-bortoleto.png ✓ (EXISTS)

## Team Logos (2025)

Replace these with actual .png images:

- team-red_bull.png ✓ (EXISTS)
- team-ferrari.png ✓ (EXISTS)
- team-mercedes.png ✓ (EXISTS)
- team-mclaren.png ✓ (EXISTS)
- team-aston_martin.png ✓ (EXISTS)
- team-alpine.png ✓ (EXISTS)
- team-williams.png ✓ (EXISTS)
- team-rb.png ✓ (EXISTS)
- team-haas.png ✓ (EXISTS)
- team-sauber.png ✓ (EXISTS)

## Car Images (2025)

Create these in `/images/cars/` directory:

- car-red_bull-2025.png (NEEDED)
- car-ferrari-2025.png (NEEDED)
- car-mercedes-2025.png (NEEDED)
- car-mclaren-2025.png (NEEDED)
- car-aston_martin-2025.png (NEEDED)
- car-alpine-2025.png (NEEDED)
- car-williams-2025.png (NEEDED)
- car-rb-2025.png (NEEDED)
- car-haas-2025.png (NEEDED)
- car-sauber-2025.png (NEEDED)

## Circuit Images

Create these in `/images/circuits/` directory:

- circuit-bahrain.png
- circuit-saudi_arabia.png (jeddah)
- circuit-australia.png (melbourne)
- circuit-japan.png (suzuka)
- circuit-china.png (shanghai)
- circuit-miami.png
- circuit-emilia_romagna.png (imola)
- circuit-monaco.png
- circuit-spain.png (barcelona)
- circuit-canada.png (montreal)
- circuit-austria.png (spielberg)
- circuit-great_britain.png (silverstone)
- circuit-belgium.png (spa)
- circuit-netherlands.png (zandvoort)
- circuit-italy.png (monza)
- circuit-azerbaijan.png (baku)
- circuit-singapore.png
- circuit-united_states.png (austin)
- circuit-mexico.png
- circuit-brazil.png (interlagos)
- circuit-las_vegas.png
- circuit-qatar.png (losail)
- circuit-abu_dhabi.png (yas_marina)

## Placeholder Images

These are fallback images when specific images are not found:

- driver-placeholder.png ✓ (EXISTS)
- team-logo-placeholder.png ✓ (EXISTS)
- car-placeholder.png ✓ (EXISTS)
- circuit-placeholder.png ✓ (EXISTS)
- news-placeholder.png ✓ (EXISTS)

## Image Sources & Licensing

When replacing placeholder .txt files with actual images:

1. **Official F1 Media**: Use official F1 press/media images (check licensing)
2. **Team Websites**: High-quality images from team official websites
3. **Wikimedia Commons**: Many F1 images available under Creative Commons
4. **Create Your Own**: Design graphics using tools like Figma/Photoshop
5. **Stock Images**: Use royalty-free stock photos (Unsplash, Pexels)

⚠️ **Copyright Notice**: Ensure all images used have proper licensing for your project.

## Backend Image Path Configuration

The backend server automatically maps image paths:

```javascript
getDriverImage(driverCode, driverSurname) → /images/driver-{surname}.png
getTeamLogo(constructorId) → /images/team-{team_id}.png
getCarImage(constructorId, year) → /images/cars/car-{team_id}-{year}.png
```

## ImageWithFallback Component

The frontend uses `ImageWithFallback` component that:
1. Tries to load the specified image
2. Falls back to placeholder if image fails to load
3. Handles loading states gracefully

## Notes for Developers

- All driver IDs use lowercase with underscores (e.g., `max_verstappen`)
- Team IDs use lowercase with underscores (e.g., `red_bull`, `aston_martin`)
- Image paths are relative to `/public` directory
- The backend serves images via Express static middleware
- PNG format is preferred for transparency support
- Keep file sizes reasonable (< 500KB per image recommended)
