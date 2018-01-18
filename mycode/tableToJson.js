/*
@language: javascript native;
@start: open the test2.html in the browser, he will automent load this file and show the json result in a new browser tag.
@test2.html: just add a link of text/javascript for reading js file. 
@idea: Recursive the DOM tree, and get all the TextNode who has the NodeValue. Finally, I got the result by analysing the TextNode.parentElemen.className
*/


//init global json result 
var json = { "status": "ok", "result": { "trips": [{ "name": "", "details": { "roundTrips": [] } }], "custom": { "prices": [] } } };
window.onload = function () {
    //get rootElement
    var root = document.documentElement;
    //rescure all node
    traverseNodes(root);
}

function traverseNodes(node) {
    if (node.nodeType == 1) {
        getNode(node);
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes.item(i);
            if (attr.specified) {
                getNode(attr);
            }
        }
        if (node.hasChildNodes) {
            var sonnodes = node.childNodes;
            for (var i = 0; i < sonnodes.length; i++) {
                var sonnode = sonnodes.item(i);
                traverseNodes(sonnode);
            }
        }
    } else {
        getNode(node);
    }
}

function getNode(node) {
    var blankNode = /^[\s\\r\\n]+$/gi.test(node.nodeValue);
    if (node.nodeType == 3 && !blankNode) {
        if (node.parentElement.className) {
            var msg = [node.parentElement.className, node.nodeValue.replace(/^\s+|\s+$/g, "")];
            //add the information to json object
            JsonFormat(msg)
            console.log(node.parentElement.className)
        }
    }
}

function JsonFormat(msg) {
    var JsonNode1 = json["result"];
    var JsonNodeDetail = json["result"]["trips"][0]["details"];
    var JsonNodeRoundTrips = json["result"]["trips"][0]["details"]["roundTrips"];
    let len = JsonNodeRoundTrips.length;
    if (msg[0] == `\\"pnr-info\\"`) {
        JsonNode1["trips"][0]["name"] = msg[1]; //add name
    }
    else if (msg[0] == `\\"cell\\"`) {
        JsonNode1["custom"]["prices"].push({ "value": msg[1] }); //add custom
    }
    else if (msg[0] == `\\"very-important\\"`) {
        JsonNodeDetail = { "price": msg[1] }; // add price total
    }
    else if (msg[0] == `\\"product-travel-date\\"`) {
        showJsonResult(json);
        JsonNodeRoundTrips.push({ "date": msg[1] }); //add a new trips
    }
    else if (msg[0] == `\\"travel-way\\"`) {
        JsonNodeRoundTrips[len - 1]["type"] = msg[1]; //update the last trip
    }
    else if (msg[0] == `\\"origin-destination-hour`) {
        JsonNodeRoundTrips[len - 1]["trains"] = [{ "departureTime": msg[1] }];//update the last trip
    }
    else if (msg[0] == `\\"origin-destination-station`) {
        JsonNodeRoundTrips[len - 1]["trains"][0]["departureStation"] = msg[1];//update the last trip
    }
    else if (msg[0] == `\\"origin-destination-border`) { //update the last trip
        var bollls = /^[0-9]/.test(msg[1]);
        let len = JsonNodeRoundTrips.length;
        if (bollls)
            JsonNodeRoundTrips[len - 1]["trains"][0]["arrivalTime"] = msg[1];
        else {
            JsonNodeRoundTrips[len - 1]["trains"][0]["arrivalStation"] = msg[1];
        }
    }
    else if (msg[0] == `\\"segment\\"`) {//update the last trip
        var bollls = /^[0-9]+$/gi.test(msg[1]);
        if (bollls)
            JsonNodeRoundTrips[len - 1]["trains"][0]["number"] = msg[1];
        else {
            JsonNodeRoundTrips[len - 1]["trains"][0]["type"] = msg[1];
        }
    } else if (msg[0] == `\\"legal-info\\"`) {//update the last trip

    }
}

var myWindow = window.open("", "");
//write the json result in another windows
function showJsonResult(jsonResult) {
    var str = JSON.stringify(jsonResult, null, '\t');
    myWindow.document.write(`<title>test-result</title>`);
    myWindow.document.write(`<pre id="json"></pre>`);
    myWindow.document.getElementById("json").innerHTML = JSON.stringify(jsonResult, undefined, 2);
}
