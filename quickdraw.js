const quickDraw = require('quickdraw.js');
const fs = require('fs');

const count = 400;
const classNames = ['square', 'star', 'cat', 'circle', 't-shirt'];
const train_data = {
    xs: [],
    labels: [],
    train_data_size: 0,
    classNames,
};

let catData = [];
getData(count);
saveData(train_data);

function getData(count) {
    const set = quickDraw.set(count, classNames);

    catData = set.set;
    console.log('catData',catData)    

    catData.forEach(value => {
        const outputIndex = value.output.findIndex(outputIndex => outputIndex === 1);
        train_data.xs = train_data.xs.concat(value.input);
        train_data.labels = train_data.labels.concat(value.output);
        train_data.train_data_size = train_data.train_data_size + 1;
    })
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
