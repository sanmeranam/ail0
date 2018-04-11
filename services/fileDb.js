var fs = require("fs");


module.exports = {
    getJSON: function () {
        return JSON.parse(fs.readFileSync(__dirname + "/ans.json"));
    },
    setJSON: function (oJSON) {
        fs.writeFile(__dirname + "/ans.json", JSON.stringify(oJSON), 'utf8', function () { });
    }
}