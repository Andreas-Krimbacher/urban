var pg = require('pg');

var conString = "postgres://urban:urban@localhost:5432/urban";
var client = new pg.Client(conString);
client.connect();

//note: error handling omitted
module.exports.InfoElement =  function(req, res) {
    client.query('SELECT "Id", "ImgPath" FROM "Image";', function(err, result) {


        res.send(result.rows[0].ImgPath.toString() + '__' + req.params.id);
    })
};

module.exports.InfoEinheitenList =  function(req, res) {
    client.query('SELECT * FROM "InfoEinheiten";', function(err, result) {

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(result.rows));
    })
};
