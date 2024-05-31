const { Reolink } = require('../index.js')
let cam = new Reolink("192.168.8.133", 80, "admin", "Controls")


async function init(){

    await cam.login()
    cam.config.enableLogging()

    await cam.getEncoding().then(() => {
        cam.setEncoding("mainStream","size", "3840*2160")
    })


    // let oldOptions = aletwait cam.config.getImageSettings().then((res) => {;
    //     // console.log(res)
    //     res["mirroring"] = 1;
    //     // console.log(res)
    //     cam.config.setImageSettings("Isp", res)
    // });

    // await cam.config.setImageSettings("rotation", 0)
    // await cam.config.toggleMirror()
    // await cam.config.toggleRotation();

    // console.log(await cam.config.getImageSettings());
    

    // await cam.getDevInfo()
    // await cam.recording.init(cam)

    // await cam.recording.status()
    // await cam.recording.start()

    // await cam.recording.takePicture("/home/jackson/Desktop/"+Date.now()+".jpg")


    // await cam.ptz.init(cam)
    // await cam.lights.init(cam)
    // console.log("35: ",await cam.ptz.getPresets())
    // await cam.ptz.move("RightDown", 60)

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