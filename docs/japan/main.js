import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer@0.1.0/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";

async function main() {
  try {
    const demSource = await new mlcontour.DemSource({
      url: "https://gsj-seamless.jp/seamless/elev/php/terrainRGB.php?url=https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png",
      encoding: "mapbox",
      maxzoom: 14,
      worker: true,
      cacheSize: 100,
      timeoutMs: 20000,
    });
    demSource.setupMaplibre(maplibregl);

    const mapConfig = {
      container: "map",
      center: [139.3127, 35.8855],
      zoom: 15,
    };

    const map = await isomizer(
      mapConfig,
      "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles/projects/isomized-japan/project-config.yml"
    );

    map.addSource("terrain-source", {
      type: "raster-dem",
      tiles: [demSource.sharedDemProtocolUrl],
      tileSize: 256,
    });
    return map;
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

const map = await main();

map.addControl(new ScaleRatioControl(), "top-left");
map.addControl(new maplibregl.FullscreenControl(), "top-right");
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
map.addControl(new GPSTrackControl(), "top-right");
map.addControl(
  new maplibregl.TerrainControl({
    source: "terrain-source",
    exaggeration: 1.2,
  })
);
map.addControl(new maplibregl.NavigationControl(), "bottom-right");
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
