# Ghost Presentation Macro
This Webex Device macro will monitor the presence of people in a meeting room and stop any ongoing presentations if no one is present.

## Overview

The Macro listens for Presentation Start events from the devices and periodically checks if there has been a series of time without any presence detection.
Using the Ultrasound Presence, People Count and Ambient Noise events. Anytime one of these are triggered while the Macro is monitoring the room presence, it will reset the counter. Once all presentations have ended, the Macro will stop monitoring the rooms presence.

![Ghost Presentation - Ghost Presentation](https://user-images.githubusercontent.com/21026209/164302067-d414011f-4c09-4166-b51d-be1e0d7c12d2.jpg)


## Requirements

1. A CE9.X or RoomOS Webex Device.
2. Web admin access to the device to uplaod the macro.

## Setup

1. Download the ``ghost-presentation.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro on the editor.



## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).



## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=ghost-presentation-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
