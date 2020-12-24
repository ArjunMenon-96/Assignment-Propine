var HCL = require("js-hcl-parser")

const fs = require('fs');

function processFile(content) {
    let output = HCL.parse(content);
    // console.log("output", output)
    return JSON.parse(output);
}

var i, j, x = "";

var passLimit = 3;
var currPass = [];
var liftDir = "UP"; //or "DOWN"
var liftAt = 0;

var futureStops = [];

var instructions = [];



var myObj = {};
passGo = [];
passAt = [];

async function f() {
    // console.log("test9");
    return fs.promises.readFile('./states/state_3.hcl').catch((err) => console.error('Failed to read file', err));
}

// console.log("test0");

f()
    .then(function(content) {
        // console.log("reached");
        return processFile(content.toString())
    })
    .then(function(myObj) { // data organisation

        // console.log("test1");
        // console.log("myObj2345", myObj);

        for (var i = 0; i < myObj.passenger.length; i++) { // loop to get passGo
            var q = {
                    goto_level: myObj.passenger[i].goto_level,
                    id: myObj.passenger[i].id
                }
                // console.log(x);
            passGo.push(q);
        }
        console.log("passGo", passGo);

        for (var i = 0; i < myObj.passenger.length; i++) { // loop to get passAt
            var q = {
                    goto_level: myObj.passenger[i].goto_level,
                    at_level: myObj.passenger[i].at_level,
                    id: myObj.passenger[i].id
                }
                // console.log(x);
            passAt.push(q);
        }
        console.log("passAt", passAt);


        for (var j = 0; j < myObj.lift.length; j++) {
            liftAt = myObj.lift[j].at_level;
        }
        console.log("liftAt", liftAt);

        // console.log("test2");

    }).then(function() { // algo

        // console.log("test3");

        // find nearest passenger
        passAt.sort(function(a, b) {
            return Math.abs((a.at_level - liftAt)) - Math.abs((b.at_level - liftAt));
        })
        console.log("sorted passAt", passAt);

        // futureStops = passAt.map(function (x) {return x.at_level});
        // futureStops.sort(function(a, b){return a-b});
        // console.log("futureStops", futureStops);

        // find initial direction
        if (passAt[0].at_level > liftAt) liftDir = "UP";
        else liftDir = "DOWN";
        // include exception of passenger at lift level

        instructions.push("GO " + liftDir);
        console.log("INSTRUCTIONS", instructions);

        //fake data
        //liftDir = "DOWN";
        while (true) {

            // find next stop
            console.log("new loop, lift At: " + liftAt);
            var nextStop = -1;
            var nextAction = ""; // pick, drop, both

            if ((passAt.length == 0) && (currPass.length == 0)) { // endLift;
                // endLift();
                console.log("endlift");
                nextStop = 0;
                nextAction = "end";
                break;
            } else if (currPass.length == passLimit) { // full Lift
                // check closest drop off in same direction, else change direction
                console.log("full lift");
                nextAction = "drop";
                if (liftDir == "DOWN") {
                    for (var x = currPass.length - 1; x >= 0; x--) {
                        if (currPass[x].goto_level < liftAt) {
                            nextStop = currPass[x].goto_level;
                            instructions.push("GO DOWN");
                            console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "UP";
                        instructions.push("GO UP");
                        console.log(instructions);
                        for (var x = 0; x < currPass.length; x++) {
                            if (currPass[x].goto_level > liftAt) {
                                nextStop = currPass[x].goto_level;
                                break;
                            }
                        }

                    };
                } else if (liftDir == "UP") {
                    for (var x = 0; x < currPass.length; x++) {
                        if (currPass[x].goto_level > liftAt) {
                            nextStop = currPass[x].goto_level;
                            instructions.push("GO UP");
                            console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "DOWN";
                        instructions.push("GO DOWN");
                        console.log(instructions);
                        for (var x = currPass.length - 1; x >= 0; x--) {
                            if (currPass[x].goto_level < liftAt) {
                                nextStop = currPass[x].goto_level;
                                break;
                            }
                        }
                    };
                }
            } else if (currPass.length == 0) { // empty Lift
                // go to closest passenger in same direction and pick
                console.log("empty lift");
                nextAction = "pick";
                if (liftDir == "UP") {
                    for (var x = 0; x < passAt.length; x++) {
                        if (passAt[x].at_level > liftAt) {
                            nextStop = passAt[x].at_level;
                            instructions.push("GO UP");
                            console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "DOWN";
                        instructions.push("GO DOWN");
                        console.log(instructions);
                        for (var x = passAt.length - 1; x >= 0; x--) {
                            if (passAt[x].at_level < liftAt) {
                                nextStop = passAt[x].at_level;
                                break;
                            }
                        }
                    }
                } else if (liftDir == "DOWN") {
                    for (var x = passAt.length - 1; x >= 0; x--) {
                        if (passAt[x].at_level < liftAt) {
                            nextStop = passAt[x].at_level;
                            instructions.push("GO DOWN");
                            console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir == "UP";
                        instructions.push("GO UP");
                        console.log(instructions);
                        for (var x = 0; x < passAt.length; x++) {
                            if (passAt[x].at_level > liftAt) {
                                nextStop = passAt[x].at_level;
                                break;
                            }
                        }
                    }
                }
            } else { // normal condition, keep going in the same direction until nothing left
                // curr Pass dropoff + pass to be picked, closest in the same direction
                console.log("norm lift");
                var newArr = [];
                for (var i = 0; i < currPass.length; i++)
                    newArr.push({
                        id: currPass[i].id,
                        level: currPass[i].goto_level,
                        type: "drop"
                    })
                for (var i = 0; i < passAt.length; i++)
                    newArr.push({
                        id: passAt[i].id,
                        level: passAt[i].at_level,
                        type: "pick"
                    })

                newArr.sort(function(a, b) { return a.level - b.level });
                console.log("newArr", newArr)

                if (liftDir == "UP") {
                    for (var x = 0; x < newArr.length; x++) {
                        if (newArr[x].level > liftAt) {
                            nextStop = newArr[x].level;
                            instructions.push("GO UP");
                            console.log(instructions);
                            nextAction = newArr[x].type;
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "DOWN";
                        instructions.push("GO DOWN");
                        console.log(instructions);
                        for (var x = newArr.length - 1; x >= 0; x--) {
                            if (newArr[x].level < liftAt) {
                                nextStop = newArr[x].level;
                                nextAction = newArr[x].type;
                                break;
                            }
                        }
                    }
                } else if (liftDir == "DOWN") {
                    for (var x = newArr.length - 1; x >= 0; x--) {
                        if (newArr[x].level < liftAt) {
                            nextStop = newArr[x].level;
                            instructions.push("GO DOWN");
                            console.log(instructions);
                            nextAction = newArr[x].type;
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir == "UP";
                        instructions.push("GO UP");
                        console.log(instructions);
                        for (var x = 0; x < newArr.length; x++) {
                            if (newArr[x].level > liftAt) {
                                nextStop = newArr[x].level;
                                nextAction = newArr[x].type;
                                break;
                            }
                        }
                    }
                }

            }

            console.log("next stop: ", nextStop)
            instructions.push("STOP " + nextStop);
            console.log("INSTRUCTIONS", instructions);
            liftAt = nextStop;

            console.log("lift at " + liftAt + "   nextAction " + nextAction);

            // if (nextAction == "drop") {
            //     var x = 0;
            //     while (x < currPass.length) {
            //         if (currPass[x].goto_level == liftAt) {
            //             instructions.push("PASSENGER "+currPass[x].id+ " LEAVE");
            //             currPass.splice(x, 1);
            //             console.log("INSTRUCTIONS", instructions);
            //             continue;
            //         }
            //         x++;
            //     }
            //     // check if pickup also needed on same floor

            // } else if (nextAction == "pick") {
            //     var x = 0;
            //     while (x < passAt.length) {
            //         if (passAt[x].at_level == liftAt) {
            //             currPass.push(passAt[x]);
            //             currPass.sort(function(a, b){return a.goto_level-b.goto_level});
            //             instructions.push("PASSENGER "+passAt[x].id+ " ENTER");
            //             passAt.splice(x, 1);
            //             console.log("INSTRUCTIONS", instructions);

            //             continue;
            //         }
            //         x++;
            //     }

            //     console.log("new currPass: ", currPass);

            // }

            var xx = 0;
            while (xx < currPass.length) {
                if (currPass[xx].goto_level == liftAt) {
                    instructions.push("PASSENGER " + currPass[xx].id + " LEAVE");
                    currPass.splice(xx, 1);
                    console.log("INSTRUCTIONS", instructions);
                    continue;
                }
                xx++;
            }

            var xy = 0;
            while (xy < passAt.length) {
                if (passAt[xy].at_level == liftAt) {
                    currPass.push(passAt[xy]);
                    currPass.sort(function(a, b) { return a.goto_level - b.goto_level });
                    instructions.push("PASSENGER " + passAt[xy].id + " ENTER");
                    passAt.splice(xy, 1);
                    console.log("INSTRUCTIONS", instructions);

                    continue;
                }
                xy++;
            }

            console.log("new currPass: ", currPass);



            // drop passengers
            // if (currPass.length != 0) {

            //     passGo.find(element => element > 10);

            // }
        }

        console.log("INSTRUCTIONS", instructions);


    })
    .catch((err) => console.error('f() failed', err));