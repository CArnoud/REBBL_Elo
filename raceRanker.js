const records = require('./files/race/records');


let winRateArray = [];
const recordIndices = Object.keys(records);
for (let i in recordIndices) {
    const index = recordIndices[i];
    const total = records[index].wins + records[index].draws + records[index].losses;

    winRateArray.push([index, records[index].wins / total]);
}

winRateArray.sort((a, b) => {
    return b[1] - a[1];
});

console.log(winRateArray);
