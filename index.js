const HCL = require("js-hcl-parser")
const fs = require('fs');
const pathModule = require('path');



var passLimit = 3; // maximum lift capacity
var totalMax, totalMin, maxAt, minAt, maxGo, minGo; //min-max variables

var liftID = -1; // store lift ID
var liftDir = "UP"; //or "DOWN" // current lift travel direction
var liftAt = 0; // default lift starting position

var instructions = []; // final output instruction array
var currPass = []; // list of current passengers inside the lift
var passAt = []; // list of Waiting Passengers on the floors

var problemName = "";



async function f() { // function to async read given file

    if (process.argv.length != 3) { // check number of command line arguments
        console.log("Incorrect number of arguments!");
        process.exit();
    } else {
        try {
            if (fs.existsSync(process.argv[2])) { // check if given file path is valid
                //file exists
                // console.log("File path validated.");
                problemName = pathModule.parse(process.argv[2]).name;
                return fs.promises.readFile(process.argv[2]).catch((err) => console.error('Failed to read file', err));
            } else {
                console.log("Invalid file path.");
                process.exit();
            }
        } catch (err) {
            console.error(err);
        }
    }


}

function processFile(content) { // function to parse file data to JSON
    let output = HCL.parse(content);
    // console.log("output", output)
    return JSON.parse(output);
}





f()
    .then(function(content) { // function to thenify call processFile()
        return processFile(content.toString())
    })
    .then(function(myObj) { // function to organise data into required object arrays

        passAt = myObj.passenger; // store initial Waiting Passenger list
        // console.log("passAt", passAt);

        liftID = myObj.lift[myObj.lift.length - 1].id; // get current level of lift
        liftAt = myObj.lift[myObj.lift.length - 1].at_level; // get current level of lift

        // console.log("liftAt", liftAt);

        // declaring min-max variables to find level limits
        minAt = passAt[0].at_level;
        maxAt = passAt[0].at_level;
        minGo = passAt[0].goto_level;
        maxGo = passAt[0].goto_level;

        // loop to find min-max level limits (from both source and destination levels)
        for (var k = 1; k < passAt.length; k++) {
            if (passAt[k].at_level > maxAt) maxAt = passAt[k].at_level;
            else if (passAt[k].at_level < minAt) minAt = passAt[k].at_level;
            if (passAt[k].goto_level > maxGo) maxGo = passAt[k].goto_level;
            else if (passAt[k].goto_level < minGo) minGo = passAt[k].goto_level;
        }

        totalMax = (maxAt > maxGo) ? maxAt : maxGo; // overall highest level to be accessed by passengers
        totalMin = (minAt < minGo) ? minAt : minGo; // overall lowest level to be accessed by passengers

        // console.log("totalMax " + totalMax + " totalMin " + totalMin);

    })
    .then(function() { // main algorithm function

        // sort Waiting Passenger list by distance from current lift position
        passAt.sort(function(a, b) {
                return Math.abs((a.at_level - liftAt)) - Math.abs((b.at_level - liftAt));
            })
            // console.log("sorted passAt", passAt);

        // find initial lift direction based off of nearest passenger
        if (passAt[0].at_level > liftAt) liftDir = "UP";
        else liftDir = "DOWN";

        // main algorithm loop
        while (true) {

            // console.log("new loop iteration, lift At: " + liftAt);

            // Offload passengers at current level
            var xx = 0;
            while (xx < currPass.length) {
                if (currPass[xx].goto_level == liftAt) {
                    instructions.push("LIFT " + liftID + ": " + "PASSENGER " + currPass[xx].id + " LEAVE");
                    currPass.splice(xx, 1);
                    // console.log("INSTRUCTIONS", instructions);

                    continue;
                }
                xx++;
            }

            // Load passengers at current level
            var xy = 0;
            while (xy < passAt.length) {
                if ((passAt[xy].at_level == liftAt) && (currPass.length < passLimit)) {
                    // if ( (passAt[xy].at_level == liftAt) ) {
                    currPass.push(passAt[xy]);
                    currPass.sort(function(a, b) { return a.goto_level - b.goto_level });
                    instructions.push("LIFT " + liftID + ": " + "PASSENGER " + passAt[xy].id + " ENTER");
                    passAt.splice(xy, 1);
                    // console.log("INSTRUCTIONS", instructions);

                    continue;
                }
                xy++;
            }

            // console.log("new currPass: ", currPass); // new current passenger list

            var nextStop = -1; // store next stop for the lift
            var nextAction = ""; // pick, drop, both // store next action to undertake


            if ((passAt.length == 0) && (currPass.length == 0)) { // end condition for lift // no remaining passengers

                // AIM: Take lift back to Floor 1

                // console.log("endlift");
                nextStop = 0;
                nextAction = "end";
                if (liftAt != 1) {
                    instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                    instructions.push("LIFT " + liftID + ": " + "STOP 1");
                }

                break; // exit while loop

            } else if (currPass.length == passLimit) { // Condition where Lift is at max capacity i.e. 3

                // AIM: Find nearest drop location in current direction, else change direction

                // console.log("full lift");

                nextAction = "drop";

                if (liftDir == "DOWN") {
                    for (var x = currPass.length - 1; x >= 0; x--) {
                        if (currPass[x].goto_level < liftAt) {
                            nextStop = currPass[x].goto_level;
                            instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                            // console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "UP";
                        instructions.push("LIFT " + liftID + ": " + "GO UP");
                        // console.log(instructions);
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
                            instructions.push("LIFT " + liftID + ": " + "GO UP");
                            // console.log(instructions);
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "DOWN";
                        instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                        // console.log(instructions);
                        for (var x = currPass.length - 1; x >= 0; x--) {
                            if (currPass[x].goto_level < liftAt) {
                                nextStop = currPass[x].goto_level;
                                break;
                            }
                        }
                    };
                }
            } else if (currPass.length == 0) { // Condition where Lift is empty

                // AIM: Find nearest pick location in current direction, else change direction

                // console.log("empty lift");

                nextAction = "pick";
                if (liftDir == "UP") {

                    var closest1 = totalMax;
                    var flag1 = 0;

                    for (var x = 0; x < passAt.length; x++) { // loop to find closest upper level
                        if ((passAt[x].at_level > liftAt) && (passAt[x].at_level < closest1)) {
                            closest1 = passAt[x].at_level;
                            flag1 = 1;
                        }
                    }

                    if (flag1 != 0) { // if an upper floor is found, add to instructions
                        nextStop = closest1;
                        instructions.push("LIFT " + liftID + ": " + "GO UP");
                        // console.log(instructions);
                    }

                    if (nextStop == -1) { // if no upper floor found

                        liftDir = "DOWN";
                        instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                        // console.log(instructions);

                        var closest2 = -1;

                        for (var x = passAt.length - 1; x >= 0; x--) { // loop to find closest lower level
                            if ((passAt[x].at_level < liftAt) && (passAt[x].at_level > closest2)) {

                                closest2 = passAt[x].at_level;

                            }
                        }
                        nextStop = closest2;
                    }

                } else if (liftDir == "DOWN") {

                    var closest3 = -1;
                    var flag3 = 0;

                    for (var x = passAt.length - 1; x >= 0; x--) { // loop to find closest lower level
                        if ((passAt[x].at_level < liftAt) && (passAt[x].at_level > closest3)) {
                            closest3 = passAt[x].at_level;
                            flag3 = 1;
                        }
                    }

                    if (flag3 != 0) { // if a lower floor is found, add to instructions
                        nextStop = closest3;
                        instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                        // console.log(instructions);
                    }
                    if (nextStop == -1) { // if no lower level found

                        liftDir == "UP";
                        instructions.push("LIFT " + liftID + ": " + "GO UP");
                        // console.log(instructions);

                        var closest4 = totalMax;

                        for (var x = 0; x < passAt.length; x++) {
                            if ((passAt[x].at_level > liftAt) && (passAt[x].at_level < closest4)) {
                                closest4 = passAt[x].at_length;
                            }
                        }

                        nextStop = closest4;
                    }
                }
            } else { // Normal Lift condition, keep going in the same direction until no stops left

                // AIM: Find closest pick/drop location in the same direction, else change direction

                // console.log("norm lift");

                var newArr = []; // stores status of all passengers, waiting and loaded

                for (var i = 0; i < currPass.length; i++) // get loaded passenger status'
                {
                    newArr.push({
                        id: currPass[i].id,
                        level: currPass[i].goto_level,
                        type: "drop"
                    })
                }

                for (var i = 0; i < passAt.length; i++) // get waiting passenger status'
                {
                    newArr.push({
                        id: passAt[i].id,
                        level: passAt[i].at_level,
                        type: "pick"
                    })
                }

                newArr.sort(function(a, b) { return a.level - b.level }); // sort newArr by level
                // console.log("newArr", newArr)

                if (liftDir == "UP") {
                    for (var x = 0; x < newArr.length; x++) {
                        if (newArr[x].level > liftAt) {
                            nextStop = newArr[x].level;
                            instructions.push("LIFT " + liftID + ": " + "GO UP");
                            // console.log(instructions);
                            nextAction = newArr[x].type;
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir = "DOWN";
                        instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                        // console.log(instructions);
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
                            instructions.push("LIFT " + liftID + ": " + "GO DOWN");
                            // console.log(instructions);
                            nextAction = newArr[x].type;
                            break;
                        }
                    }
                    if (nextStop == -1) {
                        liftDir == "UP";
                        instructions.push("LIFT " + liftID + ": " + "GO UP");
                        // console.log(instructions);
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

            // console.log("next stop: ", nextStop)
            instructions.push("LIFT " + liftID + ": " + "STOP " + nextStop);
            // console.log("INSTRUCTIONS", instructions);
            liftAt = nextStop;

            // continue while loop

        }

    })
    .then(function() { // Print Final Instruction List

        // console.log("INSTRUCTIONS", instructions);
        // for (var xyz = 0; xyz < instructions.length; xyz++) {
        //     console.log(instructions[xyz]);
        // }
        var solFileName = problemName + "_solution.txt";
        var writeData = instructions.join("\n");

        fs.writeFile(solFileName, writeData, (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File written successfully\n");
                console.log("The file has the following contents:");
                console.log(fs.readFileSync(solFileName, "utf8"));
            }
        });

    })
    .catch((err) => console.error('f() failed', err));