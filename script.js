const viewport        = document.getElementById("viewport");
const speedDisplay    = document.getElementById("speedDisplay");
const alertDisplay    = document.getElementById("alertDisplay");
const unitSelector    = document.getElementById("unitSelect");
const radiusOfEarth   = 6371000; // metres
const degToRad        = Math.PI / 180; // pre-calculate
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
                                        KMPH: Number(0),
                                        MPH:  Number(1),
                                        MPS:  Number(2)
                                      });
let unit              = 1;
/** @type {GeolocationCoordinates} */
let coords1           = null;
/** @type {GeolocationCoordinates} */
let coords2           = null;
let distance     = 0;

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
  alertDisplay.style.textShadow           = `0 0 calc(${glowIntensity} *  0.3rem) #fff,
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
  coords1 = coords2 || position.coords;
  coords2 = position.coords;
  calculateSpeed();
  alertDisplay.innerHTML = "Live";
}

/**
 * 
 * @param {GeolocationPositionError} err Docs - https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
 */
function failure(err) {
  speedDisplay.innerHTML = "---";
  alertDisplay.innerHTML = err.message;
  setAtmosphereColour(0);
}

function calculateSpeed() {    
  // coords[lat, long, timestamp]
  let latitude1  = coords1.latitude * degToRad;
  let longitude1 = coords1.longitude * degToRad;
  let latitude2  = coords2.latitude * degToRad;
  let longitude2 = coords2.longitude * degToRad;

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

  // clamp to prevent floating point errors
  if (cosTheta > 1) cosTheta = 1;
  if (cosTheta < 0) cosTheta = 0;

  // complete dot product
  let theta = Math.acos(cosTheta);
  
  // distance in metres
  distance = radiusOfEarth * theta;

  console.log(`${distance}`);
  switch (unit) {
    case Units.KMPH:
      speedDisplay.innerHTML = Math.round(distance * 3.6);
      break;
  
    case Units.MPH:
      // update formula from mps to mph
      speedDisplay.innerHTML = Math.round(distance * 2.237);
      break;
      
    case Units.MPS:
      speedDisplay.innerHTML = Math.round(distance);
      break;

    default:
      speedDisplay.innerHTML = Math.round(distance * 2.237);
      unitSelector.value = "1";
      break;
  }
  
  setAtmosphereColour(240);
}

/**
 * 
 * @param {Event} e 
 */
function handleUnitChange(e) {
  unit = Number(e.target.value);
  console.log(unit);
}

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(success, failure, { enableHighAccuracy: true });
}

unitSelector.addEventListener("change", handleUnitChange);