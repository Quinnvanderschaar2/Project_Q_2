const socket = new WebSocket("ws://localhost:3000");
var state =
    socket.addEventListener("open", () => {
        // send a message to the server

    });

// receive a message from the server
socket.addEventListener("message", ({ state, data }) => {
    const packet = JSON.parse(data);
    console.log(data);
    if ('payload' in data) {
        state.angle = data['payload'];
    }
});

function send_led_state(value) {
    socket.send(JSON.stringify({
        type: "Start_Stop_Dodge_Game",
        content: { stand: value }
    }));
}