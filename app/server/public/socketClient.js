// // Create WebSocket connection.

// var loc = window.location,
//   new_uri;
// if (loc.protocol === "https:") {
//   new_uri = "wss:";
// } else {
//   new_uri = "ws:";
// }

// new_uri += "//" + loc.host;

// var HOST = new_uri;

// var ws = new WebSocket(HOST);

// // Connection opened
// socket.addEventListener("open", function (event) {
//   console.log("Connected to WS Server");
// });

// Listen for messages
socket.addEventListener("message", function (event) {
  console.log("Message from server ", event.data);
});
socket.addEventListener("timestamp", function (event) {
  console.log(event);
  console.log("123");
});
socket.on("message", (msg) => {
  console.log(msg);
  console.log(456);
}); // From server
socket.on("timestamp", (msg) => {
  console.log(msg);
  console.log(123);
}); // From server
const user = document.getElementById("user");
const sendMessage = () => {
  socket.emit("message", `Hello From: ${user.value}`);
  console.log(`Hello From: ${user.value}`);
};
