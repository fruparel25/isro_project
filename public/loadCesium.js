var hei = document.getElementById('height').textContent; //User selected attribute for height

//CesiumION User Token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Zjc4ODlkMC1iNWU3LTQ5ODctOTNmZS1hMmNjZjYzOGM3ZjEiLCJpZCI6Mzk2NjgsImlhdCI6MTYwNzc5MTU3Nn0._B715dCEro-ej4pksYrSsPdkV1zOWWMdKMJ7mMEuRnc';

//Set Home to India
var west = 68.0;
var south = 7.0;
var east = 89.0;
var north = 35.0;
var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.5;
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;

//Set Cesium Viewer
var viewer = new Cesium.Viewer('cesiumContainer', {
    sceneModePicker: false,
    navigationHelpButton : false,
    scene3DOnly : true,
    baseLayerPicker : false,
    shadows: true,
    terrainShadows: Cesium.ShadowMode.ENABLED,
    shouldAnimate: true,
    // terrainProvider: Cesium.createWorldTerrain(),
});

//Add Data Source to viewer
var dataSource = Cesium.GeoJsonDataSource.load('/uploads/BUILDINGFILE.json').then(
    function(dataSource) {
        // dataSource.crsNames = 'EPSG:4326';
        dataSource.clampToGround = true; //Clamp Objects to Ground Level
        
        var entity = dataSource.entities.values;
        for (var i = 0; i < entity.length; i++) {
            entity[i].polygon.outline = false; //building border = none
            entity[i].polygon.material = Cesium.Color.WHITE; //building colour
            entity[i].polygon.fill = true; //Add volume to Buildings
            entity[i].polygon.perPositionHeight = false; //Not added terrain extra height
            
            var heightString = eval("entity[i].properties."+hei);
            entity[i].polygon.extrudedHeight = parseFloat(heightString); //Entity Height from user selcted attribute

            entity[i].polygon.shadows = Cesium.ShadowMode.ENABLED; //Entity Shadow enabled
            
            entity[i].polygon.material = Color(entity[i].polygon.extrudedHeight); //Building Colour by height
        }
        viewer.dataSources.add(dataSource);
        viewer.flyTo(dataSource);
    }
);

viewer.shadowMap.maximumDistance = 3000;
viewer.shadowMap.size = 3000;

//Color Function
function Color(height){
    if(height > 25){
        return Cesium.Color.RED;
    }
    else if(height > 20){
        return Cesium.Color.ORANGE;
    } 
    else if(height > 15){
        return Cesium.Color.GREEN;
    }
    else if(height > 10){
        return Cesium.Color.CYAN;
    }
    else{
        return Cesium.Color.YELLOW;
    }
}