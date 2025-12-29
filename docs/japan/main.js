import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer@0.3.0/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";
import GeoJsonExportControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-geojson-export/src/maplibre-gl-geojson-export.js";
import Terrain3dToggle from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-terrain-3d-toggle/src/maplibre-gl-terrain-3d-toggle.js";
import ContourIntervalControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-contour-interval/src/maplibre-gl-contour-interval.js";

async function main() {
  try {
    const mapConfig = {
      container: "map",
      center: [139.3127, 35.8855],
      zoom: 15,
      maxPitch: 80,
      hash: true,
    };

    const map = await isomizer(
      mapConfig,
      "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles/projects/isomized-japan/project-config.yml"
    );
    return map;
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

const map = await main();

const demSource = new mlcontour.DemSource({
  url: "https://gbank.gsj.jp/seamless/elev/terrainRGB/land/{z}/{y}/{x}.png",
  encoding: "mapbox",
  minzoom: 0,
  maxzoom: 19,
  worker: true,
  cacheSize: 100,
  timeoutMs: 30_000,
});
demSource.setupMaplibre(maplibregl);

map.addControl(new ScaleRatioControl(), "top-left");
map.addControl(new maplibregl.FullscreenControl(), "top-right");
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: true,
  }),
  "top-right"
);
map.addControl(
  new MaplibreExportControl.MaplibreExportControl({
    PrintableArea: true,
  }),
  "top-right"
);
map.addControl(new GeoJsonExportControl());
map.addControl(
  new MagneticNorthControl({
    apiProxyUrl:
      "https://apiproxymagneticnorth.azurewebsites.net/api/getMagneticHeading",
  }),
  "top-right"
);
map.addControl(
  new GPSTrackControl({ isHeartRateWidthEnabled: true }),
  "top-right"
);
map.addControl(new Terrain3dToggle(demSource), "top-right");
const defaultContourInterval = 5;
map.addControl(
  new ContourIntervalControl(demSource, defaultContourInterval),
  "top-right"
);
map.addControl(new maplibregl.NavigationControl(), "bottom-right");
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
