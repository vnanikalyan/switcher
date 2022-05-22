const wifi = require('node-wifi');
const exec = require('child_process').exec;
let wifiArr = [{"name": "NEST",
				"password": "dummypassword"},
			   {"name": "NANI",
				"password": "dummypassword"}
			  ];

wifiArr = JSON.parse(JSON.stringify(wifiArr));
console.log('wifiArr : ', wifiArr);

 
// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});
 
async function getCurrentConnection() {	
	return new Promise((resolve, reject)=>{
		wifi.getCurrentConnections((err, currentConnections) => {
		  if (err) {
		    console.log(err);
		    resolve(err);
		  } else {
		  	//console.log(currentConnections);	
		  	resolve(currentConnections[0]);
		  	}
		  });
	});	
}

function scanWifi() {
	// Scan networks
	wifi.scan(async (err, networks) => {
	  if (err) {
	    console.log(err);
	  } else {
		 
		    //console.log(networks);	    
		    let currentConnection = await getCurrentConnection();
		    console.log('currentConnection : ', currentConnection);
		    
		    console.log(' ');
		    console.log('-----------------------------------------------');
		    for(let i=0; i < networks.length; i++)
		    	console.log(networks[i].ssid, ' -- ', networks[i].quality);		      		    
		    console.log('-----------------------------------------------');
		    console.log(' ');

		     if(currentConnection.quality > 85) {
		    	for(let j=0; j<wifiArr.length; j++) {
		    		if(wifiArr[j].name !== currentConnection.ssid) {
		    			await disconnectFromWifi(currentConnection.ssid);
		    			connectToAWifi(wifiArr[j].name, wifiArr[j].password);
		    			break;    					
		    		}	    				
		    	}	    			
		    }

		}
	});	
}

function connectToAWifi(wifiName, pwd) {
	console.log(' ');
	console.log('************************');
	console.log('Connecting to ...');
	console.log('WIFI NAME - ', wifiName);		
	
	// Connect to a network
	wifi.connect(
	  { ssid: wifiName, password: pwd },
	  function(err) {
	    if (err) {
	      console.log(err);	      
	    }
	    console.log("Connected!");	    
	  }	  
	);
	console.log('************************');
	console.log(' ');
}

async function disconnectFromWifi(wifiName) {	
	return new Promise((resolve)=>{
		console.log(' ');
		console.log('************************');
		console.log('disconnecting from : ', wifiName);
		console.log('************************');
		console.log(' ');
		exec("nmcli con down " + wifiName, (err, stdout, stderr)=>{
			//console.log('err : ', err);
			//console.log('stdout : ', stdout);
			//console.log('stderr : ', stderr);			
			console.log('Wifi Disconnect - Child process executed!');
			resolve();
		})
	})
}


setInterval(()=>{
	scanWifi();
}, 3000)