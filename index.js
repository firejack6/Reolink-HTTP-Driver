const fs=require("fs");
const logging = true;

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
        console.log("84: ",this.ip)
        var jsonmsg = {
            "cmd": "GetRecV20",
            "action": 1,
            "param": {
                "channel": 0
            }
        }
        let resp = await sendReq(this.ip, this.port, "GetRecV20", jsonmsg, this.token);
        console.log("90: ",resp)
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
            console.log("DATA: ",data)
            var convBuff = Buffer.from(data);
            fs.writeFile(fileLoc, convBuff, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
        })
        return
    }
}

var ptz = {
    init: function(par){
        this.ip = par.ip;
        this.port = par.port;
        this.token = par.token;
    },

    getPresets: async function(){
        var jsonmsg = {
            "cmd": "GetPtzPreset",
            "action": 1,
            "param": {
                "channel": 0
            }
        }
        let resp = await sendReq(this.ip, this.port, "GetPtzPreset", jsonmsg, this.token);
        // console.log("141: ",resp)
        return
    },

    savePreset: async function(preset, id){
        //untested
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
        sendReq(this.ip, this.port, "SetPtzPreset", jsonmsg, this.token);
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

Object.assign(Reolink.prototype, {recording});
Object.assign(Reolink.prototype, {ptz});
Object.assign(Reolink.prototype, {lights});

module.exports = { Reolink };