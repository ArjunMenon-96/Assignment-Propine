var HCL = require("js-hcl-parser")

const fs = require('fs');

async function processFile(content) {
    let output = await HCL.parse(content);
    console.log("output", output)
    return output;
}

var i, j, x = "";

var passLimit = 3;
var currPass = [];
var liftDir = "up"; //or "down"
var liftAt = 0;



var myObj = {};
passGo = [];
passAt = [];

async function f() {

    // const fsPromises = fs.promises;
    await fs.readFile('./states/state_2.hcl', function read(err, data) {
        if (err) {
            throw err;
        }
        const content = data.toString();
        myObj = processFile(content);
        console.log("myObj", myObj);
        return myObj;

    })

    // var content = await fs.readFile('./states/state_2.hcl').catch((err) => console.error('Failed to read file', err));
    // return processFile(content.toString())

}
console.log("test0");

f()
    .then(function(myObj) { // data organisation

        console.log("test1");
        console.log("myObj2345", myObj.lift);

        for (var i = 0; i < myObj.passenger.length; i++) { // loop to get passGo
            var q = {
                    goto_level: myObj.passenger[i].goto_level,
                    id: myObj.passenger[i].id
                }
                // console.log(x);
            passGo.push(q);
            console.log("passGo", passGo);
        }

        for (i in myObj.passenger) { // loop to get passAt
            var q = {
                    at_level: i.at_level,
                    id: i.id
                }
                // console.log(x);
            passAt.push(q);
            console.log("passAt", passAt);
        }


        for (j in myObj.lift) {
            liftAt = j.at_level;
            console.log("liftAt", liftAt);
        }

        console.log("test2");

    }).then(function() { // algo

        console.log("test3");

    })