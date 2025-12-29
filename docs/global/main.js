import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer@0.3.1/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";
import GeoJsonExportControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-geojson-export/src/maplibre-gl-geojson-export.js";
import Terrain3dToggle from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-terrain-3d-toggle/src/maplibre-gl-terrain-3d-toggle.js";
import ContourIntervalControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-contour-interval/src/maplibre-gl-contour-interval.js";

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [],
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  },
  center: [0, 0],
  zoom: 1,
  maxPitch: 80,
  hash: true,
  localIdeographFontFamily: ["sans-serif"],
});

const demSource = new mlcontour.DemSource({
  url: "https://gbank.gsj.jp/seamless/elev/terrainRGB/gebco/{z}/{y}/{x}.png",
  encoding: "mapbox",
  minzoom: 0,
  maxzoom: 9,
  worker: true,
  cacheSize: 100,
  timeoutMs: 30_000,
});
demSource.setupMaplibre(maplibregl);

map.on("load", async () => {
  await isomizer(
    map,
    "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles/projects/global/project-config.yml"
  );

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
      Crosshair: true,
      northIconOptions: { visibility: "none" },
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
  map.addControl(
    new maplibregl.ScaleControl({ unit: "metric" }),
    "bottom-left"
  );
});