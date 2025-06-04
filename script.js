const speedDisplay    = document.getElementById("speedDisplay");
const alert           = document.getElementById("alert");
const viewport        = document.getElementById("viewport");
const unitSelector    = document.getElementById("unitSelect");
const radiusOfEarth   = 6371000; // metres
const degToRad        = Math.PI / 180;
const sampleSize      = 4;
const sampleTime      = 1000;
let speed             = 0; // for testing
let glowHue           = 240;
let glowIntensity     = 2;
let glowEffect        = `0 0 calc(${glowIntensity} *  0.3rem) #fff,
                         0 0 calc(${glowIntensity} *  0.6rem) #fff,
                         0 0 calc(${glowIntensity} *    1rem) #fff,
                         0 0 calc(${glowIntensity} * 1.25rem)  hsl(${glowHue}, 100%, 50%),
                         0 0 calc(${glowIntensity} *  1.8rem)  hsl(${glowHue}, 100%, 50%),
                         0 0 calc(${glowIntensity} *  2.5rem)  hsl(${glowHue}, 100%, 50%),
                         0 0 calc(${glowIntensity} *  3.5rem)  hsl(${glowHue}, 100%, 50%),
                         0 0 calc(${glowIntensity} *  4.6rem)  hsl(${glowHue}, 100%, 50%);`
let Units              = Object.freeze({
                                        KMPH: Symbol(0),
                                        MPH:  Symbol(1),
                                        MPS:  Symbol(2)
                                      });
let unit              = 1;
let coords            = [];
let totalDistance     = 0;

function setAtmosphereColour(hue) {
  if (hue < 0) hue = 0;
  if (hue > 359) hue = 359;
  speedDisplay.style.textShadow    = `0 0 calc(${glowIntensity} *  0.3rem) #fff,
                                      0 0 calc(${glowIntensity} *  0.6rem) #fff,
                                      0 0 calc(${glowIntensity} *    1rem) #fff,
                                      0 0 calc(${glowIntensity} * 1.25rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  1.8rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  2.5rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  3.5rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  4.6rem)  hsl(${hue}, 100%, 50%);`;
  alert.style.textShadow           = `0 0 calc(${glowIntensity} *  0.3rem) #fff,
                                      0 0 calc(${glowIntensity} *  0.6rem) #fff,
                                      0 0 calc(${glowIntensity} *    1rem) #fff,
                                      0 0 calc(${glowIntensity} * 1.25rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  1.8rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  2.5rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  3.5rem)  hsl(${hue}, 100%, 50%),
                                      0 0 calc(${glowIntensity} *  4.6rem)  hsl(${hue}, 100%, 50%);`;
  viewport.style.background        = `radial-gradient(at top,
                                      hsl(${hue}, 100.00%, 50.00%) 0%,
                                    hsl(0, 0.00%, 0.00%)  80%);`
}

/**
 * 
 * @param {GeolocationPosition} position 
 */
function success(position) {
  if (coords.length < sampleSize) coords.push([position.coords.latitude, position.coords.longitude]);
  alert.innerHTML = "Live";
}

/**
 * 
 * @param {GeolocationPositionError} err Docs - https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
 */
function failure(err) {
  speedDisplay.innerHTML = "---";
  alert.innerHTML = "Location unavailable";
  console.error(`ERROR(${err.code}): ${err.message}`);
  setAtmosphereColour(0);
}

if (navigator.geolocation) {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(success, failure, { enableHighAccuracy: true });
  }, sampleTime / sampleSize);

  setInterval(() => {
    totalDistance = 0;
    
    for (let i = 0; i < coords.length - 2; i++) {
      // coords[lat, long]
      let latitude1  = coords[i][0] * degToRad;
      let longitude1 = coords[i][1] * degToRad;
      let latitude2  = coords[i + 1][0] * degToRad;
      let longitude2 = coords[i + 1][1] * degToRad;

      // p
      let rho1 = radiusOfEarth * Math.cos(latitude1);
      let z1 = radiusOfEarth * Math.sin(latitude1);
      let x1 = rho1 * Math.cos(longitude1);
      let y1 = rho1 * Math.sin(longitude1);

      // q
      let rho2 = radiusOfEarth * Math.cos(latitude2);
      let z2 = radiusOfEarth * Math.sin(latitude2);
      let x2 = rho2 * Math.cos(longitude2);
      let y2 = rho2 * Math.sin(longitude2);

      // dot product
      let dot = x1 * x2 + y1 * y2 + z1 * z2;
      let cosTheta = dot / (radiusOfEarth ** 2);
      let theta = Math.acos(cosTheta);

      // distance in metres
      totalDistance += radiusOfEarth * theta;
    }
    
    console.log(`${totalDistance} / ${sampleSize} = ${totalDistance / sampleSize}`);

    switch (unit) {
      case Units.KMPH:
        speedDisplay.innerHTML = Math.round((totalDistance / sampleSize) / 1000);
        break;
    
      case Units.MPH:
        // update formula from mps to mph
        speedDisplay.innerHTML = Math.round((totalDistance / sampleSize) * 2.237);
        break;

      case Units.MPS:
        speedDisplay.innerHTML = Math.round(totalDistance / sampleSize);
        break;

      default:
        speedDisplay.innerHTML = Math.round((totalDistance / sampleSize) * 2.237);
        unitSelector.value = "1";
        break;

    }
    
    setAtmosphereColour(240);
    coords = [];
  }, sampleTime)
}
