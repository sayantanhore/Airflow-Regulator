// Constants
var LISTENING = 1;
var TEMPERATURE_RECEIVED = 2;

var https = require("https");
var fs = require("fs");
var SerialPort = require("serialport").SerialPort;
var url = "https://greenhouse.firebaseio.com/channels/-JPnv3s_R0BjJ6_Lxkd7/data/0/data.json";
var file = "data.json";
var jsontxt = "";
var temperature = 0;
var responseEnded = true;
var transferCompleted = true;

//Ports
// For Mac OS X "/dev/tty.usbmodem1411" or other usb or bluetooth ports
// For Windows "COM6" or any available COM port

var serialPort = new SerialPort("/dev/tty.usbmodem1411", {
        baudrate: 9600,
        // defaults for Arduino serial communication
        dataBits: 8, 
        parity: 'none', 
        stopBits: 1, 
        flowControl: false 
    });

serialPort.on("data", function(data){
    console.log("Incoming data type check");
    //console.log(data.toString());
    console.log(parseInt(data).toString() + "\n");
    if(data.toString() === LISTENING.toString()){
        console.log("Message from Arduino :: " + "Listening");

        //sendTemperatureToArduino();

    }
    else if(data.toString() === TEMPERATURE_RECEIVED.toString()){
        console.log("Message from Arduino :: " + "Temperature received");
        transferCompleted = true;
        //sendTemperatureToArduino();
    }
});

serialPort.on("open", function(){
    console.log("Port opened");
    console.log("Current temperature is " + temperature); 
});

function sendTemperatureToArduino(){
    console.log("Before sending");
    console.log(temperature.toString());
    serialPort.write(temperature.toString() + "p", function(err, results){
        console.log("Temperature data sent");
        
    });
    
    
}

function fetchJson(){
	console.log("Starting");
    
    // Resetting jsontxt
    
    jsontxt = "";
    
    // Fetch json data
    
	https.get(url, function(res){
		
		res.on("data", function(data){
            responseEnded = false;
            if(typeof data != "undefined"){
                jsontxt += data;
                //console.log(jsontxt);
            }
            else{
                //console.log(jsontxt);
                console.log("Undefined");
            }
		});
        res.on("end", function(){
            var findTxt = 'undefined';
            var re = new RegExp(findTxt, 'g');
            jsontxt = jsontxt.replace(re, '');
            jsonData = JSON.parse(jsontxt);
            console.log(typeof jsonData);
            console.log("Length :: ");
            var noOfEntries = Object.keys(jsonData).length;
            for (key in jsonData){
                temperature = parseInt(jsonData[key][1]);
            }
            console.log("Temperature :: " + temperature);
            
            //sendTemperatureToArduino();
            responseEnded = true;/*
            if (transferCompleted === true){
                transferCompleted = false;
                sendTemperatureToArduino();

            }*/
            sendTemperatureToArduino();
        });

	}).end();
    
    
}

// Call fetchJson every 5 seconds
setInterval(function(){
    if (responseEnded === true){
        fetchJson();
    }
}, 10000);
