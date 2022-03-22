# time-share

Instuctions:
1. clone `https://github.com/nmpereira/time-share`
2. install `node` and run `npm install`
3. Create an account in https://www.mongodb.com/ and create a collection, ensure network access from `0.0.0.0/0`
4. Copy the connection url from MongoDB to your local directory in a `.env` file. Name the variable `dbURI_time=<mongodb+srv://connection url>`
5. For Developement, run `npm run devstart` in the root directory. (the express app will serve the .ejs frontend)
6. For Production, run `npm start` in the root directory. (the express app will serve the .ejs frontend)
