# OriLibre

Orienteering Maps on MapLibre GL JS  

These maps are created using [ISOMizer Studio](https://tjmsy.github.io/maplibre-gl-isomizer-studio/),  
a custom style generation tool for orienteering maps.  

For more information (currently under construction):  
- [ISOMizer's GitHub repo](https://github.com/tjmsy/maplibre-gl-isomizer)  
- [ISOMizer Projectfiles' GitHub repo](https://github.com/tjmsy/isomizer-projectfiles)

## Maps
**⚠️ 注意 / Note**  
初回起動時に地図が表示されないことがあります。その場合は、画面をリロードしてください。  
Sometimes, the map may not load on the first attempt. If this happens, please refresh the page.  


### [Japan](https://tjmsy.github.io/orilibre/japan/index.html)
- **データソース**: [OpenFreeMap](https://openfreemap.org/)、[国土地理院ベクトルタイル](https://maps.gsi.go.jp/development/vt.html)、[標高タイル(国土地理院)](https://maps.gsi.go.jp/development/ichiran.html#dem)、[農林水産省筆ポリゴン(農林水産省)](https://github.com/optgeo/ag?tab=readme-ov-file#%E5%87%BA%E5%85%B8)  
- **特徴**: 国土地理院のデータソースからの建物・等高線、農林水産省のデータソースからの耕作地、OpenStreetMap(OpenFreeMap)のデータソースからの道路・森林等のハイブリッドマップ。  
- **印刷・再配布**: 可能です。その場合は出典表示を含めるようにしてください。

### [Global (with Contour)](https://tjmsy.github.io/orilibre/global/index.html)
- **Data Sources**: [OpenFreeMap](https://openfreemap.org/) and [MapTiler](https://www.maptiler.com/)'s Terrain RGB.  
- **Features**: Includes global contour data.  
- **Printing**: Not printable.  

### [Global (without Contour)](https://tjmsy.github.io/orilibre/global-without-contour/index.html)
- **Data Source**: [OpenFreeMap](https://openfreemap.org/).  
- **Features**: No restrictions on usage for the data source.  
- **Printing**: Printable.  

## Usage
1. Visit the links above to explore the maps.  
2. For the Japan map, feel free to print or redistribute with proper attribution.  
3. The global map without contours is also printable; other maps are not.

## License
Please refer to the individual data sources for licensing details:  
- [OpenFreeMap](https://openfreemap.org/)
- [国土地理院ベクトルタイル](https://maps.gsi.go.jp/development/vt.html)
- [標高タイル(国土地理院)](https://maps.gsi.go.jp/development/ichiran.html#dem)
- [農林水産省筆ポリゴン(農林水産省)](https://github.com/optgeo/ag?tab=readme-ov-file#%E5%87%BA%E5%85%B8)
- [MapTiler](https://www.maptiler.com/)

Make sure to include proper attribution for all data sources when redistributing maps.
