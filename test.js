const { Reolink } = require('./index.js')
let cam = new Reolink("192.168.1.197", 80, "admin", "Controls")


async function init(){

    await cam.login()

    // await cam.getDevInfo()
    // await cam.recording.init(cam)

    // await cam.recording.status()
    // await cam.recording.start()

    // await cam.recording.takePicture("/home/jackson/Desktop/"+Date.now()+".jpg")


    await cam.ptz.init(cam)
    await cam.lights.init(cam)
    // await cam.ptz.getPresets()
    // await cam.ptz.move("RightDown", 30)

    // await cam.ptz.savePreset("noods", 1)

    // setTimeout(async function(){
    //     await cam.ptz.stop()
    // }, 3000);


    setTimeout(async function(){
        cam.logout()

    }, 5000);

}

init()