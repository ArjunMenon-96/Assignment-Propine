var myObj, i, j, x = "",
    y = [];
myObj = {
    "lift": [{
        "at_level": 4,
        "id": 1
    }],
    "passenger": [{
            "at_level": 1,
            "goto_level": 10,
            "id": 1
        },
        {
            "at_level": 1,
            "goto_level": 24,
            "id": 13
        },
        {
            "at_level": 1,
            "goto_level": 8,
            "id": 18
        }
    ]
}
for (i in myObj.passenger) {
    x = myObj.passenger[i].goto_level;
    // console.log(x);
    y.push(x);
}
y.sort(function(a, b) {
    return a - b;
});
console.log(y);

for (j in myObj.lift) {
    x = myObj.lift[j].at_level;

    if (x != 1) {
        console.log("GO DOWN");
    } else {
        console.log(`lift at ${x}`);
    }
}