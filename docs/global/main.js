import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";
import terrainParameterControl from "https://cdn.jsdelivr.net/gh/tjmsy/orilibre-utils/src/controls/terrainParameterControl.js";

async function main() {
  try {
    const mapConfig = {
      container: "map",
      center: [0, 0],
      zoom: 1,
      maxPitch: 80,
      hash: true,
    };

    const map = await isomizer(
      mapConfig,
      "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles/projects/global/project-config.yml"
    );
    return map;
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

const map = await main();

map.addControl(new ScaleRatioControl(), "top-left");
map.addControl(new maplibregl.FullscreenControl(), "top-right");
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
}), 'top-right');
map.addControl(
  new MaplibreExportControl.MaplibreExportControl({
    PrintableArea: true,
  }),
  "top-right"
);
map.addControl(
  new MagneticNorthControl({
    apiProxyUrl:
      "https://apiproxymagneticnorth.azurewebsites.net/api/getMagneticHeading",
  }),
  "top-right"
);
map.addControl(new GPSTrackControl({isHeartRateWidthEnabled: true}), "top-right");
map.addControl(new terrainParameterControl(), "top-right");
map.addControl(new maplibregl.NavigationControl(), "bottom-right");
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");