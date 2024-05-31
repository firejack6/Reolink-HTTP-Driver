const fs=require("fs");
var logging = false;

async function sendReq(ip, port, path,jsonmsg, token){
    
    var url = "http://"+ip+":"+port+"/api.cgi?cmd="+path;
    if(token){
        url+="&token="+token;
    }

    if(logging){
        console.log("SENDREQ: ",jsonmsg)
        console.log(url)
    }

    let sendBack = await fetch(url, {
        method: 'POST',
        body: JSON.stringify([jsonmsg])
    }).then(response => response.json()).then(data => {
        if(logging){
            console.log("RESPONSE: ", JSON.stringify(data[0].value));
        }
        return data[0].value;
    })
    return sendBack;
}

class Reolink {
    constructor(ip, port, user, pass){
        this.ip = ip;
        this.port = port;
        this.user = user;
        this.pass = pass;
        this.token = null;
    };

    async login(){
        var jsonmsg = {
            "cmd": "Login",
            "action": 0,
            "param": {
                "User": {
                    "userName": this.user,
                    "password": this.pass
                }
            }
        }
        let resp = await sendReq(this.ip, this.port, "Login&token=null", jsonmsg)    
        this.token = resp["Token"]["name"];
        await this.getEncoding();
        await this.recording.init(this);
        await this.ptz.init(this);
        await this.lights.init(this);
        await this.config.configInit(this);
        return
    }

    async logout(){
        var jsonmsg = {
            "cmd": "Logout",
            "param": {}
        }
        sendReq(this.ip, this.port, "Logout", jsonmsg, this.token);
        return
    }

    async getEncoding(){
        var jsonmsg = {
            "cmd": "GetEnc",
            "action": 1,
            "param": {
                "Channel": 0
            }
        }
        let resp = await sendReq(this.ip, this.port, "GetEnc", jsonmsg, this.token);
        this.encoding = resp["Enc"];
        return this.encoding
    }

    async setEncoding(settingA, settingB, value){
        var oldvals = this.encoding;
        if(!settingB){
            oldvals[settingA] = value;
        }
        else {
            oldvals[settingA][settingB] = value;
        }
        this.encoding = oldvals;
        var jsonmsg = {
            "cmd": "SetEnc",
            "action": 0,
            "param": {
                "Enc": oldvals
            }
        }
        sendReq(this.ip, this.port, "SetEnc", jsonmsg, this.token);
        return
    }

    reboot(){
        var jsonmsg = {
            "cmd": "Reboot",
            "action": 0,
            "param": {}
        }
        sendReq(this.ip, this.port, "Reboot", jsonmsg, this.token);
        return
    }

    getDevInfo(){
        var jsonmsg = {
            "cmd": "GetDevInfo",
            "action": 0,
            "param": {}
        }
        sendReq(this.ip, this.port, "GetDevInfo", jsonmsg, this.token);
        return
    
    }
}

    
var recording = {
    init: function(par){
        this.ip = par.ip;
        this.port = par.port;
        this.token = par.token;
    },

    status: async function() {
        var jsonmsg = {
            "cmd": "GetRecV20",
            "action": 1,
            "param": {
                "channel": 0
            }
        }
        let resp = await sendReq(this.ip, this.port, "GetRecV20", jsonmsg, this.token);
        return resp
        // console.log("90: ",resp)
    },

    // start: async function(){ // untested
    //     var jsonmsg = {
    //         "cmd": "SetRec",
    //         "action": 0,
    //         "param": {
    //             "channel": 0,
    //             "mode": 1
    //         }
    //     }
    //     sendReq(this.ip, this.port, "SetRec", jsonmsg, this.token);
    //     return
    // },

    takePicture: async function(fileLoc){    
    /** @type {String} File location and file name (jpg)*/

        var url = "http://"+this.ip+":"+this.port+"/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=flsYJfZgM4RTB_os&token="+this.token;

        await fetch(url, {
            method: 'POST',
        }).then(response => response.arrayBuffer()).then(data => {
            // console.log("DATA: ",data)
            var convBuff = Buffer.from(data);
            if(fileLoc){
                fs.writeFile(fileLoc, convBuff, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    if(logging){
                        console.log("The file was saved!");
                    }
                });
            }
        })
        return convBuff
    }
}

var ptz = {
    init: async function(par){
        this.ip = par.ip;
        this.port = par.port;
        this.token = par.token;
        this.nameToId = {};
        this.idToName = {};
        await this.getPresets();
        return;
    },

    getPresets: async function(){
        var jsonmsg = {
            "cmd": "GetPtzPreset",
            "action": 1,
            "param": {
                "channel": 0
            }
        }
        var resp = await sendReq(this.ip, this.port, "GetPtzPreset", jsonmsg, this.token).then((resp) => {
            let presetsRaw = JSON.parse(JSON.stringify(resp))["PtzPreset"];
            for (var i = 0; i < presetsRaw.length; i++){
                var preset = presetsRaw[i];
                this.idToName[preset["id"]] = preset["name"];
                this.nameToId[preset["name"]] = preset["id"];
            }
            return resp
        });
        return JSON.parse(JSON.stringify(resp))["PtzPreset"];
    },

    savePreset: async function(preset, id){
        var jsonmsg = {
            "cmd": "SetPtzPreset",
            "action": 0,
            "param": {
                "PtzPreset": {
                    "channel": 0,
                    "name": preset,
                    "enable": 1,
                    "id": id
                }
            }
        }
        await sendReq(this.ip, this.port, "SetPtzPreset", jsonmsg, this.token);
        await this.getPresets();
        return
    },

    move: async function(dir, speed){
        if(!speed){
            speed = 32;
        }
        var jsonmsg = {
            "cmd": "PtzCtrl",
            "action": 0,
            "param": {
                "channel": 0,
                "op": dir,
                "speed": speed
            }
        }
        sendReq(this.ip, this.port, "PtzCtrl", jsonmsg, this.token);
        return
    },

    stop: async function(){
        var jsonmsg = {
            "cmd": "PtzCtrl",
            "action": 0,
            "param": {
                "channel": 0,
                "op": "Stop",
                "speed": 32
            }
        }
        sendReq(this.ip, this.port, "PtzCtrl", jsonmsg, this.token);
    },

    zoom: async function(dir, speed){
        if(!speed){
            speed = 32;
        }

        if (dir == "In"){
            dir = "ZoomInc";
        }
        else if (dir == "Out"){
            dir = "ZoomDec";
        }
        else{
            console.log("Invalid direction")
            return
        }

        var jsonmsg = {
            "cmd": "PtzCtrl",
            "action": 0,
            "param": {
                "channel": 0,
                "op": dir,
                "speed": speed
            }
        }
        sendReq(this.ip, this.port, "PtzCtrl", jsonmsg, this.token);
        return
    },

    toPreset: async function(preset, speed){
        if (typeof preset == "string"){
            preset = this.nameToId[preset]
        }

        if(!speed){
            speed = 32;
        }

        var jsonmsg = {
            "cmd": "PtzCtrl",
            "action": 0,
            "param": {
                "channel": 0,
                "op": "ToPos",
                "id": preset
            }
        }
        sendReq(this.ip, this.port, "PtzCtrl", jsonmsg, this.token);
        return
    }
}

var lights = {
    init: function(par){
        this.ip = par.ip;
        this.port = par.port;
        this.token = par.token;
    },

    setIR: async function(state){
        var jsonmsg = {
            "cmd": "SetIrLights",
            "action": 0,
            "param": {
                "IrLights": {
                    "channel": 0,
                    "state": state
                }
            }
        }
        sendReq(this.ip, this.port, "SetIrLights", jsonmsg, this.token);
        return
    },
}

var config = {
    configInit: async function(par){
        this.ip = par.ip;
        this.port = par.port;
        this.token = par.token;
        this.imageSettings = {};
        await this.getImageSettings();
        return
    },

    enableLogging(){
        logging = true;
    },

    getImageSettings: async function(){
        var jsonmsg = {
            "cmd": "GetIsp",
            "action": 1,
            "param": {
                "channel": 0
            }
        }
        let resp = await sendReq(this.ip, this.port, "GetIsp", jsonmsg, this.token);
        this.imageSettings = JSON.parse(JSON.stringify(resp))["Isp"];
        return JSON.parse(JSON.stringify(resp))["Isp"];
    },

    setImageSetting: async function(setting, value){
        var oldvals = this.imageSettings;
        oldvals[setting] = value;
        this.imageSettings = oldvals;
        var jsonmsg = {
            "cmd": "SetIsp",
            "action": 0,
            "param": {
                "Isp": oldvals
            }
        }
        sendReq(this.ip, this.port, "SetIsp", jsonmsg, this.token)
        return
    },

    toggleMirror: async function(){
        var oldvals = this.imageSettings;
        if (oldvals["mirroring"] == 0){
            oldvals["mirroring"] = 1;
        }
        else{
            oldvals["mirroring"] = 0;
        }
        this.imageSettings = oldvals;
        var jsonmsg = {
            "cmd": "SetIsp",
            "action": 0,
            "param": {
                "Isp": oldvals
            }
        }
        sendReq(this.ip, this.port, "SetIsp", jsonmsg, this.token);
        return oldvals["mirroring"]
    },

    toggleRotation: async function(){
        var oldvals = this.imageSettings;
        if (oldvals["rotation"] == 0){
            oldvals["rotation"] = 1;
        }
        else{
            oldvals["rotation"] = 0;
        }
        this.imageSettings = oldvals;
        var jsonmsg = {
            "cmd": "SetIsp",
            "action": 0,
            "param": {
                "Isp": oldvals
            }
        }
        sendReq(this.ip, this.port, "SetIsp", jsonmsg, this.token);
        return oldvals["rotation"]
    },


}

Object.assign(Reolink.prototype, {recording});
Object.assign(Reolink.prototype, {ptz});
Object.assign(Reolink.prototype, {lights});
Object.assign(Reolink.prototype, {config});

module.exports = { Reolink };