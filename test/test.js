const { Reolink } = require('../index.js')
let cam = new Reolink("192.168.8.133", 80, "admin", "Controls")


async function init(){

    await cam.login()
    cam.enableLogging()

    // await cam.getDevInfo()
    // await cam.recording.init(cam)

    // await cam.recording.status()
    // await cam.recording.start()

    // await cam.recording.takePicture("/home/jackson/Desktop/"+Date.now()+".jpg")


    // await cam.ptz.init(cam)
    // await cam.lights.init(cam)
    // await cam.ptz.getPresets()
    await cam.ptz.move("RightDown", 60)

    // await cam.ptz.savePreset("noods2", 2)
    // await cam.ptz.getPresets()
    // await cam.ptz.toPreset("noods2")

    setTimeout(async function(){
        await cam.ptz.stop()
    }, 3000);


    setTimeout(async function(){
        cam.logout()

    }, 5000);

}

init()