import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer@0.3/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";
import GeoJsonExportControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-geojson-export/src/maplibre-gl-geojson-export.js";
import Terrain3dToggle from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-terrain-3d-toggle@0.1/src/maplibre-gl-terrain-3d-toggle.js";
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

map.on("load", async () => {
  const demSource = new mlcontour.DemSource({
    url: "https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png",
    encoding: "numpng",
    minzoom: 0,
    maxzoom: 9,
    worker: true,
    cacheSize: 100,
    timeoutMs: 30_000,
  });
  demSource.setupMaplibre(maplibregl);

  map.addSource("contour-source", {
    type: "vector",
    tiles: [
      demSource.contourProtocolUrl({
        thresholds: {
          5: [2560, 12800],
          6: [1280, 6400],
          7: [640, 3200],
          8: [320, 1600],
          9: [160, 800],
          10: [80, 400],
          11: [40, 200],
          12: [20, 100],
          13: [10, 50],
          14: [5, 25],
        },
        contourLayer: "contours",
        elevationKey: "ele",
        levelKey: "level",
        extent: 4096,
        buffer: 1,
      }),
    ],
    maxzoom: 14,
    attribution:
      "<a href='https://tiles.gsj.jp/tiles/elev/tiles.html#mixed' target='_blank'>産総研 シームレス標高タイル(統合DEM)</a>",
  });

  map.addSource("terrain", {
    type: "raster-dem",
    tiles: [
      "https://gbank.gsj.jp/seamless/elev/terrainRGB/mixed/{z}/{y}/{x}.png",
    ],
    tileSize: 256,
    maxzoom: 9,
  });

  const sky = {
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.5,
    "horizon-color": "#ffffff",
    "horizon-fog-blend": 0.5,
    "fog-color": "#0000ff",
    "fog-ground-blend": 0.8,
    "atmosphere-blend": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      1,
      10,
      1,
      12,
      0,
    ],
  };
  map.setSky(sky);

  await isomizer(
    map,
    "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles@0.3/projects/global/project-config.yml"
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
  map.addControl(new Terrain3dToggle({ sourceName: "terrain" }), "top-right");
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
