const speedDisplay    = document.getElementById("speedDisplay");
const positionDisplay = document.getElementById("positionDisplay");
const viewport        = document.getElementById("viewport");
const unitSelector    = document.getElementById("unitSelect");
const radiusOfEarth   = 6371000; // metres
const degToRad        = Math.PI / 180;
const sampleSize      = 4;
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
  positionDisplay.style.textShadow = `0 0 calc(${glowIntensity} *  0.3rem) #fff,
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
 * @param {PositionCallback} position 
 */
function success(position) {
  if (coords.length < sampleSize) coords.push([position.coords.latitude, position.coords.longitude]);
  positionDisplay.innerHTML = `${position.coords.latitude} ${position.coords.longitude}`;

}

function failure() {
  speedDisplay.innerHTML = "---";
  positionDisplay.innerHTML = "Location unavailable";
  setAtmosphereColour(0);
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
    
    // console.log(coords);
    // console.log(`${totalDistance / sampleSize}`);

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
  }, 1000)
}
  