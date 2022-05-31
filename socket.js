import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("https://192.168.2.172:5001",  { transports : ['websocket'] })
socket.on("connect", () => {
  console.log("socket is connected" +socket.connected); // true
});



socket.on("update_imu_values", (data) => {
  if ('payload' in data){
	x= data['payload']['x'];
	y= data['payload']['y'];
	temp= data['payload']['z'];
	}
	update();
});

 window.buttonpressed=(value)=>{
	x++;
	console.log(x);        
	socket.emit("Start_Stop_Dodge_Game", {stand: value});
    }
