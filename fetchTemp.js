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
// Declare Serial Port

var serialPort = new SerialPort("/dev/tty.usbmodem1411", {
        baudrate: 9600,
        // defaults for Arduino serial communication
        dataBits: 8, 
        parity: 'none', 
        stopBits: 1, 
        flowControl: false 
    });

// On Receive Data Serial Port
serialPort.on("data", function(data){
    if(data.toString() === LISTENING.toString()){
        console.log("Message from Arduino :: " + "Listening");
    }
    else if(data.toString() === TEMPERATURE_RECEIVED.toString()){
        console.log("Message from Arduino :: " + "Temperature received");
        transferCompleted = true;
    }
});

// Open Serial Port
serialPort.on("open", function(){
    console.log("Port opened");
    console.log("Current temperature is " + temperature); 
});

// Transfer Temperature to Arduino
function sendTemperatureToArduino(){
    console.log(temperature.toString());
    serialPort.write(temperature.toString() + "p", function(err, results){
        console.log("Temperature data sent");
        
    });
    
    
}

// Fetch Json data from Firebase
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
            }
            else{
                console.log("Undefined");
            }
		});
        res.on("end", function(){
            var findTxt = 'undefined';
            var re = new RegExp(findTxt, 'g');
            jsontxt = jsontxt.replace(re, '');
            jsonData = JSON.parse(jsontxt);
            var noOfEntries = Object.keys(jsonData).length;
            for (key in jsonData){
                temperature = parseInt(jsonData[key][1]);
            }
            console.log("Temperature :: " + temperature);
            responseEnded = true;
            sendTemperatureToArduino();
        });

	}).end();
    
    
}

// Call fetchJson every 10 seconds
setInterval(function(){
    if (responseEnded === true){
        fetchJson();
    }
}, 10000);
