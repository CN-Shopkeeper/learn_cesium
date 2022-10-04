import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import flightData from "./flightData.json";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Y2E1MWNmNi1lN2E3LTQ1MGUtOWMxNS0xNzU4MDI4MmI0NDEiLCJpZCI6MTA5OTY0LCJpYXQiOjE2NjQ4MDY3MTB9.RieuCoh4i5KBJg9VMcdQOgzQIZtBkTV09DDJ1738K2U";

// STEP 4 CODE (replaces steps 2 and 3)
// Keep your `Cesium.Ion.defaultAccessToken = 'your_token_here'` line from before here.
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
});
const osmBuildings = viewer.scene.primitives.add(Cesium.createOsmBuildings());

/* Initialize the viewer clock:
  Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
  Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST 
    to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See 
    https://simple.wikipedia.org/wiki/Julian_day.)
  Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated. 
  Also, set the viewer's current time to the start time and take the user to that time. 
*/
const timeStepInSeconds = 30;
const totalSeconds = timeStepInSeconds * (flightData.length - 1);
const start = Cesium.JulianDate.fromIso8601("2020-03-09T23:10:00Z");
const stop = Cesium.JulianDate.addSeconds(
  start,
  totalSeconds,
  new Cesium.JulianDate()
);
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
// Speed up the playback speed 50x.
viewer.clock.multiplier = 50;
// Start playing the scene.
viewer.clock.shouldAnimate = true;

// The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
const positionProperty = new Cesium.SampledPositionProperty();

for (let i = 0; i < flightData.length; i++) {
  const dataPoint = flightData[i];

  // Declare the time for this individual sample and store it in a new JulianDate instance.
  const time = Cesium.JulianDate.addSeconds(
    start,
    i * timeStepInSeconds,
    new Cesium.JulianDate()
  );
  const position = Cesium.Cartesian3.fromDegrees(
    dataPoint.longitude,
    dataPoint.latitude,
    dataPoint.height
  );
  // Store the position along with its timestamp.
  // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
  positionProperty.addSample(time, position);

  viewer.entities.add({
    description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
    position: position,
    point: { pixelSize: 10, color: Cesium.Color.RED },
  });
}

// STEP 6 CODE (airplane entity)
async function loadModel() {
  // Load the glTF model from Cesium ion.
  // const airplaneUri = await Cesium.IonResource.fromAssetId(your_asset_id);
  const airplaneEntity = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({ start: start, stop: stop }),
    ]),
    position: positionProperty,
    // Attach the 3D model instead of the green point.
    // model: {
    //   uri: "https://cdn.glitch.global/37f8035a-d50e-499c-b550-0f36f629ef38/Cesium_Air.glb?v=1664849835876",
    // },
    model: {
      uri: "Cesium_Air.glb",
    },
    // Automatically compute the orientation from the position.
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    path: new Cesium.PathGraphics({ width: 3 }),
  });

  viewer.trackedEntity = airplaneEntity;
}

loadModel();
