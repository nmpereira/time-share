# time-share

# Time-Share

A shared timer for working together remotely!
Create a timer, share it with friends or colleagues.
You both see the same synced time!

## Screenshots

![App Screenshot]()


## Demo

Insert gif or link to demo


## Tech Stack

**Client:** EJS

**Server:** Node, Express, MongoDB


## Installation
```bash
    1. clone `https://github.com/nmpereira/time-share`
    2. install `node` and run `npm install`
    3. Create an account in https://www.mongodb.com/ and create a collection, ensure network access from `0.0.0.0/0`
    4. Copy the connection url from MongoDB to your local directory in a `.env` file. Name the variable `dbURI_time=<mongodb+srv://connection url>`
```
 
## Deployment

To deploy this project run

```bash
For Development, run npm run devstart in the root directory. (the express app will serve the .ejs frontend)
For Production, run npm start in the root directory. (the express app will serve the .ejs frontend)
```


## Features

- 🍅 emoji represents number of Group Pomos
- 🍪 emoji represents number of Group Breaks
- 🍎 emoji represents number of Individual Pomos
- 🍩 emoji represents number of Individual Breaks
