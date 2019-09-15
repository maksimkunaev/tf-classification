const quickDraw = require('quickdraw.js');
const fs = require('fs');

const count = 300;
const names = ['house', 'star', 'circle'];

const output = {
    cat:   [1, 0, 0, 0, 0, 0],
    house: [0, 1, 0, 0, 0, 0],
    star:     [0, 0, 1, 0, 0, 0],
    rake:     [0, 0, 0, 1, 0, 0],
    hourglass:    [0, 0, 0, 0, 1, 0],
    knife:   [0, 0, 0, 0, 0, 1],
};

console.log(quickDraw.checkSet('cat'))
console.log(quickDraw.checkSet('flower'))

let catData = [];

getData(count);
saveData(catData);

function getData(count) {
    const set = quickDraw.set(count, names);

    catData = set.set.map(value => ({
        input: value.input.map(inputValue => Math.round(inputValue * 255)) ,
        output: value.output,
    }));

    // set.set.forEach(data => {
    //     console.log('data.output',data.output )
    // });
}

function saveData(dataArray) {
    const savedFile = `./src/assets/data/data.json`;

    fs.writeFile(savedFile, JSON.stringify(dataArray), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved in", savedFile);
    });
}
