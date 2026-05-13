import { isomizer } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-isomizer@0.5/src/isomizer.js";
import { ScaleRatioControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-scale-ratio@latest/src/maplibre-gl-scale-ratio.js";
import { MagneticNorthControl } from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-magnetic-north/src/maplibre-gl-magnetic-north.js";
import GPSTrackControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-gps-track/src/maplibre-gl-gps-track.js";
import GeoJsonExportControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-geojson-export@0.1/src/maplibre-gl-geojson-export.js";
import Terrain3dToggle from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-terrain-3d-toggle@0.1/src/maplibre-gl-terrain-3d-toggle.js";
import ContourIntervalControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-contour-interval@0.1/src/maplibre-gl-contour-interval.js";
import StyleScratchpadControl from "https://cdn.jsdelivr.net/gh/tjmsy/maplibre-gl-style-scratchpad@0.1/src/StyleScratchpadControl.js";
import DesignSetSwitcherControl from "https://cdn.jsdelivr.net/gh/tjmsy/orilibre-utils@0.3/src/orilibre-design-set-switcher/DesignSetSwitcherControl.js";
import FeatureInspectorControl from "https://cdn.jsdelivr.net/gh/tjmsy/orilibre-utils@0.3/src/feature-inspector/FeatureInspectorControl.js";

const query = new URLSearchParams(window.location.search);

const projectConfigUrl =
  query.get("project") ??
  "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles@0.5/projects/isomized-japan/project-config.yml";

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [],
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  },
  center: [139.3127, 35.8855],
  zoom: 15,
  maxPitch: 90,
  hash: true,
  localIdeographFontFamily: "sans-serif",
});

map.on("load", async () => {
  const demSource = new mlcontour.DemSource({
    url: "https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png",
    encoding: "numpng",
    minzoom: 0,
    maxzoom: 15,
    worker: true,
    cacheSize: 100,
    timeoutMs: 30_000,
  });
  demSource.setupMaplibre(maplibregl);

  map.addSource("contour-source", {
    type: "vector",
    tiles: [
      demSource.contourProtocolUrl({
        thresholds: {},
        contourLayer: "contours",
        elevationKey: "ele",
        levelKey: "level",
        extent: 4096,
        buffer: 1,
      }),
    ],
    maxzoom: 15,
    attribution:
      "<a href='https://tiles.gsj.jp/tiles/elev/tiles.html#land' target='_blank'>産総研 シームレス標高タイル(陸域統合DEM)</a>",
  });

  map.addSource("terrain", {
    type: "raster-dem",
    tiles: [
      "https://gbank.gsj.jp/seamless/elev/terrainRGB/land/{z}/{y}/{x}.png",
    ],
    tileSize: 256,
    maxzoom: 15,
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

  map.once("idle", async () => {
    const handle = await isomizer(map, projectConfigUrl);
    switcher.setInitialHandle(handle);
  });

  // -------------------------
  // Controls: top-left
  // -------------------------

  map.addControl(new ScaleRatioControl(), "top-left");

  const switcher = new DesignSetSwitcherControl({
    defaultDesignSet: "ofm",
  });

  map.addControl(switcher, "top-left");

  map.addControl(new GeoJsonExportControl(), "top-left");

  map.addControl(new StyleScratchpadControl(), "top-left");

  map.addControl(new FeatureInspectorControl(), "top-left");

  const defaultContourInterval = 5;
  const baseZoom = 13;
  map.addControl(
    new ContourIntervalControl(demSource, defaultContourInterval, baseZoom),
    "top-left",
  );

  const initialTerrain = query.get("terrain") === "1";
  map.addControl(
    new Terrain3dToggle({ sourceName: "terrain", initialTerrain }),
    "top-left",
  );

  // -------------------------
  // Controls: top-right
  // -------------------------

  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "top-right",
  );

  map.addControl(
    new MaplibreExportControl.MaplibreExportControl({
      PrintableArea: true,
      Crosshair: true,
      northIconOptions: { visibility: "none" },
    }),
    "top-right",
  );

  map.addControl(
    new GPSTrackControl({ isHeartRateWidthEnabled: true }),
    "top-right",
  );

  // -------------------------
  // Controls: bottom-left
  // -------------------------

  // -------------------------
  // Controls: bottom-right
  // -------------------------
  map.addControl(
    new maplibregl.ScaleControl({ unit: "metric" }),
    "bottom-right",
  );

  map.addControl(new maplibregl.NavigationControl(), "bottom-right");

  map.addControl(
    new MagneticNorthControl({
      apiProxyUrl:
        "https://apiproxymagneticnorth.azurewebsites.net/api/getMagneticHeading",
    }),
    "bottom-right",
  );
});
