const basePath = process.cwd();
const fs = require("fs");
const util = require('util');

const layersDir = `${basePath}/layers`;

const { layerConfigurations } = require(`${basePath}/src/config.js`);
const { getElements } = require("../src/main.js");



// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];
let artworkScores = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
    let layers = config.layersOrder;
  
    layers.forEach((layer) => {
        // get elements for each layer
        let elementsForLayer = [];
        let elements = getElements(`${layersDir}/${layer.name}/`);
        elements.forEach((element) => {
            // just get name and weight for each element
            let rarityDataElement = {
                trait: element.name,
                weight: element.weight.toFixed(0),
            };
            elementsForLayer.push(rarityDataElement);
        });
        let layerName =
            layer.options?.["displayName"] != undefined
            ? layer.options?.["displayName"]
            : layer.name;
        // don't include duplicate layers
        if (!rarityData.includes(layer.name)) {
            // add elements for each layer to chart
            rarityData[layerName] = elementsForLayer;
        }
    });
});

// check for metadata scores of each artwork (starting from 209-2088)
data = data.filter((x, i) => x.edition > 208);
data.forEach((element) => {
    let attributes = element.attributes;
    let elementScoreData = {
        id: element.edition,
        score: 0,
    };

    attributes.forEach((attribute) => {
        let traitType = attribute.trait_type;
        let value = attribute.value;
        
        let rarityDataTraits = rarityData[traitType];
        rarityDataTraits.forEach((rarityDataTrait) => {
            if (rarityDataTrait.trait == value) {
                elementScoreData.score += parseInt(rarityDataTrait.weight);
            }
        });
    });

    artworkScores.push(elementScoreData);
});

// sort the artwork scores (lowest = rarest)
artworkScores.sort((a,b) => a.score - b.score);

console.log(JSON.stringify(artworkScores));