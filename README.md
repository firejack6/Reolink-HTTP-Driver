# Reolink HTTP Driver

A simple library for controlling Reolink IP cameras.

The library is designed to meet the needs of the Akronauts Rocket Design Team, and may be missing some commands.

# Github
https://github.com/firejack6/Reolink-HTTP-Driver

# Based on Reolink's Offical API
https://drive.google.com/drive/folders/1qvKcKswNJP_-G0tTbs_JQOuO67QqujfB


# Supported Functions

Login   
Logout  
GetEnc  
SetEnc
Reboot*  
GetDevInfo  
GetRecV20  
Snap  
GetPtzPreset  
SetPtzPreset  
PtzCtrl  
SetIrLights  
GetIsp  
SetIsp

\* admin required

# How to use
For each camera:
> let cam = new Reolink(ipadr, port, username, password)  
  
    
**NOTE: all functions are asynchronous**

## Basics

Login:  
> await cam.login();  

Logout:   
> await cam.logout();

Get Encoding: 
> await cam.getEncoding(); - returns Dict from camera

Set Encoding: **Requires restart**
> await cam.setEncoding(SETTING, VALUE);

Reboot:
> await cam.reboot(); ***must use admin account**

Get Device Info:
> await cam.getDevInfo

## Recording

Get recording status:
> await cam.recording.status(); - returns Dict from camera

Take a picture:
> await cam.recording.takePicture(FILE_SAVE_PATH.jpg (opt)); - returns buffer of image in .jpg

## Pan, tilt, zoom control

Get saved presets:  
> await cam.ptz.getPresets(); - returns Dict of presets

Save a preset position:
> await cam.ptz.savePreset(PRESET_NAME, PRESET_ID_NUMBER);

Go to preset:  
> await cam.ptz.toPreset(PRESET_NAME_OR_ID, SPEED (0-60, default 32))

Move:  
> await cam.ptz.move(DIRECTION, SPEED (0-60, default 32));
>> Available directions:  
>> - Left  
>> - Right  
>> - Up  
>> - Down
>> - LeftUp  
>> - LeftDown  
>> - RightUp  
>> - RightDown  
>> - IrisDec  (not sure what this does)  
>> - IrisInc (not sure what this does)  
>> - FocusDec  
>> - FocusInc  
>> - Auto  
>> - StartPatrol  
>> - StopPatrol  
>> - Stop*  
>> - ZoomInc*  
>> - ZoomDec*
>>> \* have their own functions too

Zoom:  
> await cam.ptz.zoom("In"/"Out", SPEED (0-60, default 32));

Stop moving:
> await cam.ptz.stop();

## Lights
IR lights:  
> await cam.lights.setIR(STATE);

## Config

Enable log messages:
> cam.config.enableLogging();

Get image settings:
> cam.config.getImageSettings(); - returns Dict from camera

Set image setting:
> cam.config.setImageSetting(SETTING, VALUE);

Toggle image mirroring:
> cam.config.toggleMirroring(); - returns mirroring value

Toggle image rotation (90 deg):
> cam.config.toggleRotation(); - returns rotation value