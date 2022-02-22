// Create WebSocket connection.

var loc = window.location,
  new_uri;
if (loc.protocol === "https:") {
  new_uri = "wss:";
} else {
  new_uri = "ws:";
}

new_uri += "//" + loc.host;

var HOST = new_uri;

var ws = new WebSocket(HOST);

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
