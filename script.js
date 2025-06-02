const speedDisplay    = document.getElementById("speedDisplay");
const positionDisplay = document.getElementById("positionDisplay");
const viewport        = document.getElementById("viewport");
const radiusOfEarth   = 6371000; // metres
const degToRad        = Math.PI / 180;
const sampleSize      = 4;
let speed             = 0; // for testing
let glowHue           = 240;
let unit              = 0; // 0: km/h, 1: mph, 2: m/s
let coords            = [];
let totalDistance     = 0;

/**
 * 
 * @param {PositionCallback} position 
 */
function success(position) {
  if (coords.length < sampleSize) coords.push([position.coords.latitude, position.coords.longitude]);
  positionDisplay.innerHTML = `${position.coords.latitude} ${position.coords.longitude}`;

}

function failure() {
  speedDisplay.innerHTML = "0";
  positionDisplay.innerHTML = "Location unavailable";  
}

if (navigator.geolocation) {
  geolocationId = navigator.geolocation.watchPosition(success, failure, { enableHighAccuracy: true });
  setInterval(() => {
    totalDistance = 0;
    
    for (let i = 0; i < coords.length - 2; i++) {
      let latitude1  = coords[i][0];
      let longitude1 = coords[i][1];
      let latitude2  = coords[i + 1][0];
      let longitude2 = coords[i + 1][1];
      
      totalDistance += radiusOfEarth * degToRad * Math.sqrt(Math.pow(Math.cos(latitude1 * degToRad ) * (longitude1 - longitude2), 2) + Math.pow(latitude1 - latitude2, 2));
    }
    
    console.log(coords);
    console.log(`${totalDistance / sampleSize}`);

    speedDisplay.innerHTML = Math.round(totalDistance / 1000);

    coords = [];
  }, 1000)
}
  