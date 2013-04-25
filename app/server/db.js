var pg = require('pg');
var filePaths = require('./filePaths');
var fs = require('fs');

var conString = "postgres://urban:urban@localhost:5432/urban";
var client = new pg.Client(conString);
client.connect();


module.exports.deleteFeature =  function(req, res) {
    client.query('DELETE FROM "Feature" WHERE "Id"='+req.params.id+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify('success'));
    });
};

module.exports.deleteInfoEinheit =  function(req, res) {
    client.query('DELETE FROM "InfoEinheiten" WHERE "Id"='+req.params.id+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('DELETE FROM "Feature" WHERE "InfoEinheit"='+req.params.id+';', function(err, result) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        });
    });
};

module.exports.InfoEinheitenList =  function(req, res) {
    client.query('SELECT * FROM "InfoEinheiten";', function(err, resultList) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('SELECT "Id" FROM "InfoEinheiten" ORDER BY "Id" DESC LIMIT 1;', function(err, nextInfoEinheitId) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            if(nextInfoEinheitId.rows[0]) var nextInfoEinheitId = nextInfoEinheitId.rows[0].Id + 1;
            else nextInfoEinheitId = 1;

            client.query('SELECT "Id" FROM "Feature" ORDER BY "Id" DESC LIMIT 1;', function(err, nextFeatureId) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                respondList = [];
                for(var x in resultList.rows){
                    respondList.push({
                        title:resultList.rows[x].Title,
                        start:resultList.rows[x].StartYear,
                        end:resultList.rows[x].EndYear,
                        info:resultList.rows[x].Desc,
                        rank:resultList.rows[x].TimeLineOrder,
                        id:resultList.rows[x].Id
                    });
                }

                if(nextFeatureId.rows[0]) var nextFeatureId = nextFeatureId.rows[0].Id + 1;
                else nextFeatureId = 1;
                result = {nextInfoEinheitId : nextInfoEinheitId,
                    nextFeatureId : nextFeatureId,
                    list : respondList};

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(result));
            });
        });
    });
};

module.exports.getInfoEinheit =  function(req, res) {
    var counter = 1;

    var respondFeatures = [];
    var infoEinheit = null;
    var nextFeatureId = null;

    counter++;
    client.query('SELECT * FROM "InfoEinheiten" WHERE "Id" = '+req.params.id+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        infoEinheit = {
            title:result.rows[0].Title,
            start:result.rows[0].StartYear,
            end:result.rows[0].EndYear,
            info:result.rows[0].Desc,
            rank:result.rows[0].TimeLineOrder,
            id:result.rows[0].Id
        };

        finish();
    });

    counter++;
    client.query('SELECT "Id" FROM "Feature" ORDER BY "Id" DESC LIMIT 1;', function(err, resultId) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        if(resultId.rows[0]) nextFeatureId = resultId.rows[0].Id + 1;
        else nextFeatureId = 1;

        finish();
    });

    counter++;

    client.query('SELECT * FROM "Feature" WHERE "InfoEinheit" = '+req.params.id+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }


        for(var x in result.rows){
            respondFeatures.push({
                title:result.rows[x].Title,
                start:result.rows[x].StartYear,
                end:result.rows[x].EndYear,
                info:result.rows[x].Desc,
                id:result.rows[x].Id,
                link:result.rows[x].Link_InfoElement,
                typ:result.rows[x].Typ,
                color:result.rows[x].Color
            });

            if(result.rows[x].Typ == 'plan' || result.rows[x].Typ == 'planOverlay'){
                counter++;
                getMetaData(result.rows[x].TileDB,respondFeatures[respondFeatures.length-1]);
            }
            else{
                counter++;
                respondFeatures[respondFeatures.length-1].feature = {typ:result.rows[x].Typ, attr : { color : result.rows[x].Color}};
                getGeom(result.rows[x].Id,result.rows[x].Typ,respondFeatures[respondFeatures.length-1].feature)
            }
        }

        finish();
    });

    var getGeom = function(id,typ,feature){

        client.query('SELECT ST_AsText("geom_'+typ+'") FROM "Feature" WHERE "Id"='+id+';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            feature.geom = result.rows[0].st_astext;

            finish();
        });
    };


    var getMetaData = function(name,feature){

        var file = filePaths.tiles.baseDir + '/' + name + '.json';
        fs.readFile(file,{encoding : 'utf8'},function (err, data) {
            if(err){
                res.end(err);
                return
            }

            feature.feature = JSON.parse(data);
            finish();
        });
    };

    var finish = function(){

        if (!--counter) {

            infoEinheit.features = respondFeatures;

            result = {nextId : nextFeatureId,
                infoEinheit : infoEinheit};

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(result));
        }
    };

    finish();

};

module.exports.saveInfoEinheit =  function(req, res) {
    var counter = 1;

    var infoEinheit = req.body;

    var finish = function(){
        if (!--counter) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        }
    };

    var values = {};

    values['Id'] = {value: infoEinheit.id, type : 'integer'};
    values['Title'] = {value: infoEinheit.title, type : 'string'};
    values['Desc'] = {value: infoEinheit.info || null, type : 'string'};
    values['StartYear'] = {value: infoEinheit.start, type : 'integer'};
    values['EndYear'] = {value: infoEinheit.end || null, type : 'integer'};
    values['TimeLineOrder'] = {value: infoEinheit.rank, type : 'integer'};

    counter++;
    upsert(values,'InfoEinheiten',finish);

    for(var x in infoEinheit.features){

        values = {};

        values['Id'] = {value: infoEinheit.features[x].id, type : 'integer'};
        values['InfoEinheit'] = {value: infoEinheit.id, type : 'integer'};
        values['Title'] = {value: infoEinheit.features[x].title, type : 'string'};
        values['Desc'] = {value: infoEinheit.features[x].info || null, type : 'string'};
        values['Link_InfoElement'] = {value: infoEinheit.features[x].link || null, type : 'integer'};
        values['StartYear'] = {value: infoEinheit.features[x].start || null, type : 'integer'};
        values['EndYear'] = {value: infoEinheit.features[x].end || null, type : 'integer'};
        values['Typ'] = {value: infoEinheit.features[x].typ, type : 'string'};


        values['TileDB'] = {value: null, type : 'string'};
        values['Color'] = {value: null, type : 'string'};

        if(infoEinheit.features[x].typ == 'plan' || infoEinheit.features[x].typ == 'planOverlay'){
            values['TileDB'] = {value: infoEinheit.features[x].feature.tileDB, type : 'string'};
        }
        else{
            values['Color'] = {value: infoEinheit.features[x].color, type : 'string'};
            values['geom_'+infoEinheit.features[x].typ] = {value : infoEinheit.features[x].feature.geom, type : 'geom'};
        }

        counter++;
        upsert(values,'Feature',finish);

    }

    finish();


};

var upsert = function(values,tableName,finish){

    var sqlUpdate = 'UPDATE "'+tableName+'" SET ';
    for(var x in values){
        sqlUpdate += '"' + x + '"' + '=';
        if(values[x].type == 'geom') sqlUpdate += 'ST_GeomFromText(\''+values[x].value+'\',\'4326\') ,';
        if(values[x].type == 'string') sqlUpdate += '\'' + values[x].value + '\' ,';
        if(values[x].type == 'integer') sqlUpdate += values[x].value + ' ,';
    }
    sqlUpdate = sqlUpdate.substring(0,sqlUpdate.length-1);
    sqlUpdate += 'WHERE "Id"=' + values['Id'].value +';';


    var sqlInsert = 'INSERT INTO "'+tableName+'" (';
    for(var x in values){
        sqlInsert += '"' + x + '"' + ',';
    }
    sqlInsert = sqlInsert.substring(0,sqlInsert.length-1);
    sqlInsert += ') SELECT ';
    for(var x in values){
        if(values[x].type == 'geom') sqlInsert += 'ST_GeomFromText(\''+values[x].value+'\',\'4326\') ,';
        if(values[x].type == 'string') sqlInsert += '\'' + values[x].value + '\' ,';
        if(values[x].type == 'integer') sqlInsert += values[x].value + ' ,';
    }
    sqlInsert = sqlInsert.substring(0,sqlInsert.length-1);
    sqlInsert += ' WHERE NOT EXISTS (SELECT 1 FROM "'+tableName+'" WHERE "Id"=' + values['Id'].value +');';

    console.log(sqlUpdate);
    client.query(sqlUpdate, function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        console.log(sqlInsert);
        client.query(sqlInsert, function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }
            finish();
        });
    });

};
