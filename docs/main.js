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
import ExtendedGeocoderControl from "https://cdn.jsdelivr.net/gh/tjmsy/orilibre-utils@0.3/src/extended-geocoder/ExtendedGeocoderControl.js";

const query = new URLSearchParams(window.location.search);

const projectConfigUrl =
  query.get("project") ??
  "https://cdn.jsdelivr.net/gh/tjmsy/isomizer-projectfiles@0.5/projects/global/project-config.yml";

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
  maxPitch: 90,
  hash: true,
  localIdeographFontFamily: "sans-serif",
});

map.on("load", async () => {
  const demSource = new mlcontour.DemSource({
    url: "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp",
    encoding: "terrarium",
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
      "<a href='https://mapterhorn.com/attribution' target='_blank'>© Mapterhorn</a>",
  });

  map.addSource("terrain", {
    type: "raster-dem",
    encoding: "terrarium",
    tiles: [demSource.sharedDemProtocolUrl],
    tileSize: 512,
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

  const geocoderApi = {
    forwardGeocode: async (config) => {
      const features = [];

      try {
        const bounds = map.getBounds();

        const west = bounds.getWest();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const north = bounds.getNorth();

        let request =
          `https://nominatim.openstreetmap.org/search?` +
          `q=${config.query}` +
          `&format=geojson` +
          `&polygon_geojson=1` +
          `&addressdetails=1`;

        if (searchMode === "local") {
          request += `&viewbox=${west},${north},${east},${south}&bounded=1`;
        } else {
        }

        const response = await fetch(request);
        const geojson = await response.json();

        for (const feature of geojson.features) {
          const center = feature.bbox
            ? [
                (feature.bbox[0] + feature.bbox[2]) / 2,
                (feature.bbox[1] + feature.bbox[3]) / 2,
              ]
            : feature.geometry.coordinates;
          const point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: center,
            },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ["place"],
            center,
          };
          features.push(point);
        }
      } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
      }

      return {
        features,
      };
    },
  };

  let searchMode = "global";

  const geocoder = new MaplibreGeocoder(geocoderApi, {
    maplibregl,
    limit: 10,
    zoom: 15,
  });

  const control = new ExtendedGeocoderControl({
    geocoder,
    getSearchMode: () => searchMode,
    setSearchMode: (mode) => {
      searchMode = mode;
    },
  });

  map.addControl(control, "top-right");

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
