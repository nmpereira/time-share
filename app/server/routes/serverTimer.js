// const getTime = () => {
//   //   const end_time_db = await fetch("/api/times");
//   end_time_db = 123;
//   //   console.log(end_time_db);
//   return end_time_db;
// };

let end_time_db;
const getTime = () => {
  //   const end_time_db = await fetch("/api/times");
  end_time_db = 123;
  console.log("end_time_db_1: ", end_time_db);
  // return end_time_db;
};
// console.log(getTime.end_time_db);
module.exports = getTime;
