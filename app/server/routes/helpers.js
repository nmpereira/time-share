const fetch = require("node-fetch");

// Handle GET requests to /api route
const endTime = async (reqHost, userID) => {
  // console.log(`Host: ${reqHost}`);
  let query = `http://${reqHost}/api/times/${userID}`;
  const fetchtest = await fetch(query);
  const fetchData = await fetchtest.json();
  let timestamp = fetchData.end_time;
  return timestamp;
};
module.exports = { endTime };
