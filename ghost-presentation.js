import xapi from 'xapi';

// Set the frequency in second in which to check for presence
const CHECK_FREQUENCY = 60;

// Set the number of check to perform before ending shares
const NUM_OF_CHECKS = 3;

// Configure the minimum ablient noise level
const AMBIENT_NOISE_LEVEL = 30;

// Specify if you want a warning message show, this provides
// the user the opertunity to chance the presentation ending
const NOTIFICATIONS = true;

/////////////////////////////////////////////////////////////////
///////////////////////// Do not touch //////////////////////////
/////////////////////////////////////////////////////////////////

// These are varibles for tracking the monitoring state
let MONITORING = false;
let EVENT_COUNTS = 0;
let POLLING;


// This will create a warning that the presentation will soon
// end due to no person detection
function warning() {

  if (!NOTIFICATIONS) {
    return;
  }

  xapi.Command.UserInterface.Message.Alert.Display(
    {
      Duration: 10,
      Title: 'Empty Room Detected',
      Text: 'The current presentations will end due to an empty room'
    });

}

function reset() {


  if (EVENT_COUNTS + 1 == NUM_OF_CHECKS && NOTIFICATIONS) {
    xapi.Command.UserInterface.Message.Alert.Display(
      {
        Duration: 10,
        Title: 'Presence Detected',
        Text: 'Presentation will remain'
      });
  }

  EVENT_COUNTS = 0;
  clearInterval(POLLING);

}

function checkPresence() {

  console.log(`Checking status: Counts: ${EVENT_COUNTS} | Max: ${NUM_OF_CHECKS}`)

  if (EVENT_COUNTS == NUM_OF_CHECKS) {
    stopPresentations();
    return;
  }

  EVENT_COUNTS = EVENT_COUNTS + 1;


  if (EVENT_COUNTS + 1 == NUM_OF_CHECKS) {
    warning();
  }

  return;
}



function startMonitoring() {

  if (MONITORING) {
    console.log('Already monitoring');
    return;
  }

  console.log('Presence Monitoring Started');
  MONITORING = true;
  POLLING = setInterval(checkPresence, CHECK_FREQUENCY * 1000);

}

function stopMonitoring() {

  console.log('Presence Monitoring Stopped');
  MONITORING = false;
  EVENT_COUNTS = 0;
  clearInterval(POLLING);

}

function previewStarted(event) {
  console.log('Preview started');
  startMonitoring();
}

async function previewStopped(event) {
  console.log('Preview stopped');

  const presentationState = await xapi.Status.Conference.Presentation.Mode.get();
  console.log('Conference Presentation State: ' + presentationState);

  if (presentationState == 'Off') {
    console.log('No remaining presentations');
    stopMonitoring();
  } else {
    // If we are recevining a remote presentation, disconnect
    console.log('Presentations present, continute monitoring');
  }

}

function presentationStarted(event) {
  console.log('Presentation started');
  startMonitoring();
}

async function presentationStopped(event) {
  console.log('Presentation stopped');

  const presentationState = await xapi.Status.Conference.Presentation.LocalInstance.get();

  if (presentationState.length == 0) {
    console.log('No remaining presentations');
    stopMonitoring();
  } else {
    console.log('Presentations present, continute monitoring');
  }

}


async function stopPresentations() {

  console.log('Stopping all presentations')

  // Check if we are receiving the presentation remotely or locally
  const presentationState = await xapi.Status.Conference.Presentation.Mode.get();
  console.log('Conference Presentation State: ' + presentationState);

  if (presentationState == 'Off') {
    // If we are not in a call, stop the local presentation
    console.log('Stopping Local Presentation');
    xapi.Command.Presentation.Stop();
  } else {
    // If we are recevining a remote presentation, disconnect
    console.log('Disconnecting from call');
    xapi.Command.Call.Disconnect();
  }

  // Presentations stopped, so stop monitoring
  stopMonitoring()

}

function presenceDetector(event) {

  if (MONITORING && event == 'Yes') {
    console.log('Presence Detector Event, resetting count');
    console.log(event);
    reset();
  }

}

function peopleCount(event) {

  if (MONITORING && event > 0) {
    console.log('People Count Event, resetting count');
    reset();
  }

}

function ambientNoiseDectector(event) {

  if (MONITORING) {
    console.log('Ambient Noise Event while monitoring: ' + event)
  }

  if (MONITORING && event > AMBIENT_NOISE_LEVEL) {
    console.log('Ambient Noise triggered, resetting count');
    console.log(event);
    reset();
  }

}


async function main() {

  // Check if there is a Quad or Integrated Camera
  const cameras = await xapi.Status.Cameras.Camera.get();
  const validCameras = cameras.filter(camera => camera.Model.startsWith('Quad') || camera.Model.startsWith('Integrated'))

  // Display warning if no valid cameras were found
  if (!validCameras) {
    console.warn('No Quad or Integrated Cameras Found - People Count Out Of Call May Not Work As Expected');
  }

  // Enable People Count Out Of Call
  xapi.Config.RoomAnalytics.PeopleCountOutOfCall.set('On');

  // Monitor people count, this may only be available when in a call
  // if there is no Quad Camera attached
  xapi.Status.RoomAnalytics.PeopleCount.Current.on(peopleCount);

  // Enable ultrasound presence detection
  xapi.Config.RoomAnalytics.PeoplePresenceDetector.set('On');
  // Monitor ultrasound presence detection
  xapi.Status.RoomAnalytics.PeoplePresence.on(presenceDetector);

  // Monitor Presentation Preview events
  xapi.Event.PresentationPreviewStarted.on(previewStarted);
  xapi.Event.PresentationPreviewStopped.on(previewStopped);

  // Monitor Presentation events
  xapi.Event.PresentationStarted.on(presentationStarted);
  xapi.Event.PresentationStopped.on(presentationStopped);

  // Enable Ambient Noise detection
  xapi.Config.RoomAnalytics.AmbientNoiseEstimation.Mode.set('On');

  // Monitor Ambient Noise
  xapi.Status.RoomAnalytics.AmbientNoise.Level.A.on(ambientNoiseDectector);

}

main();
