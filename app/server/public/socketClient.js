// Create WebSocket connection.
const ws = new WebSocket("wss://time-share.herokuapp.com:7071");

// Connection opened
ws.addEventListener("open", function (event) {
  console.log("Connected to WS Server");
});

// Listen for messages
ws.addEventListener("message", function (event) {
  console.log("Message from server ", event.data);
});
const user = document.getElementById("user");
const sendMessage = () => {
  ws.send(`Hello From: ${user.value}`);
};
