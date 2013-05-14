var pg = require('pg');
var filePaths = require('./filePaths');
var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');

var conString = "postgres://urban:urban@localhost:5432/urban";
var client = new pg.Client(conString);
client.connect();


// Edit Info Einheit

module.exports.deleteFeature =  function(req, res) {
    client.query('DELETE FROM "Feature" WHERE "Id"='+req.params.feature+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        //delete img
        rimraf(filePaths.image.uploadDir + '/' + req.params.infoEinheit + '/' + req.params.feature,function(){});

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify('success'));
    });
};

module.exports.deleteInfoEinheit =  function(req, res) {
    client.query('DELETE FROM "InfoEinheiten" WHERE "Id"='+req.params.infoEinheit+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('DELETE FROM "Feature" WHERE "InfoEinheit"='+req.params.infoEinheit+';', function(err, result) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            //delete img
            rimraf(filePaths.image.uploadDir + '/' + req.params.infoEinheit ,function(){});

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
    client.query('SELECT * FROM "InfoEinheiten" WHERE "Id" = '+req.params.infoEinheit+';', function(err, result) {
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

        counter++;
        getImgFileList('/' + req.params.infoEinheit,infoEinheit);

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

    client.query('SELECT * FROM "Feature" WHERE "InfoEinheit" = '+req.params.infoEinheit+';', function(err, result) {
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

            counter++;
            getImgFileList('/' + req.params.infoEinheit + '/' + result.rows[x].Id,respondFeatures[respondFeatures.length-1]);

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

    var getImgFileList = function(src,object){
        fs.exists(filePaths.image.uploadDir + src, function (exists) {
            if(exists){
                fs.readdir(filePaths.image.uploadDir + src,function(err,files){
                    if(err){
                        res.end(err);
                        return
                    }

                    object.img = [];

                    for(var x in files){
                        if(path.extname(files[x]) != '') object.img.push(filePaths.image.serverUrl + src + '/' + files[x]);
                    }

                    finish();
                });
            }
            else{
                object.img = [];
                finish();
            }
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
    upsert(values,'InfoEinheiten',res,finish);

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
        upsert(values,'Feature',res,finish);

    }

    finish();


};

// Edit Lern Einheit

module.exports.LernEinheitList =  function(req, res) {
    client.query('SELECT * FROM "LernEinheit";', function(err, resultList) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('SELECT "Id" FROM "LernEinheit" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernEinheitId) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            if(nextLernEinheitId.rows[0]) nextLernEinheitId = nextLernEinheitId.rows[0].Id + 1;
            else nextLernEinheitId = 1;

            client.query('SELECT "Id" FROM "LernLektion" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernLektionId) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                if(nextLernLektionId.rows[0]) nextLernLektionId = nextLernLektionId.rows[0].Id + 1;
                else nextLernLektionId = 1;

                client.query('SELECT "Id" FROM "LernFeature" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernFeatureId) {

                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }

                    if(nextLernFeatureId.rows[0]) nextLernFeatureId = nextLernFeatureId.rows[0].Id + 1;
                    else nextLernFeatureId = 1;

                    respondList = [];
                    for(var x in resultList.rows){
                        respondList.push({
                            title:resultList.rows[x].Title,
                            start:resultList.rows[x].StartYear,
                            end:resultList.rows[x].EndYear,
                            info:resultList.rows[x].Desc,
                            id:resultList.rows[x].Id
                        });
                    }

                    result = {nextLernEinheitId : nextLernEinheitId,
                        nextLernLektionId : nextLernLektionId,
                        nextLernFeatureId : nextLernFeatureId,
                        list : respondList};

                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(JSON.stringify(result));

                 });
            });
        });
    });
};

module.exports.saveLernEinheit =  function(req, res) {
    var counter = 1;

    var lernEinheit = req.body;

    var finish = function(){
        if (!--counter) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        }
    };

    var values = {};

    values['Id'] = {value: lernEinheit.id, type : 'integer'};
    values['Title'] = {value: lernEinheit.title, type : 'string'};
    values['Desc'] = {value: lernEinheit.info, type : 'string'};
    values['StartYear'] = {value: lernEinheit.start, type : 'integer'};
    values['EndYear'] = {value: lernEinheit.end, type : 'integer'}

    counter++;
    upsert(values,'LernEinheit',res,finish);

    for(var x in lernEinheit.lernLektionen){

        values = {};

        values['Id'] = {value: lernEinheit.lernLektionen[x].id, type : 'integer'};
        values['LernEinheit'] = {value: lernEinheit.id, type : 'integer'};
        values['Title'] = {value: lernEinheit.lernLektionen[x].title, type : 'string'};
        values['StartYear'] = {value: lernEinheit.lernLektionen[x].start, type : 'integer'};
        values['EndYear'] = {value: lernEinheit.lernLektionen[x].end, type : 'integer'};


        counter++;
        upsert(values,'LernLektion',res,finish);


        for(var y in lernEinheit.lernLektionen[x].lernFeature){

            values = {};

            values['Id'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].id, type : 'integer'};
            values['LernLektion'] = {value: lernEinheit.lernLektionen[y].id, type : 'integer'};
            values['Desc'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].info || null, type : 'string'};
            values['Typ'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].typ, type : 'string'};
            values['StartYear'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].start, type : 'integer'};
            values['EndYear'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].end, type : 'integer'};

            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'planVgl'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan1 || null, type : 'integer'};
                values['InfoEinheit2'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan2 || null, type : 'integer'};
                values['InfoEinheit3'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan3 || null, type : 'integer'};
            }
            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'feature'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].infoEinheit, type : 'integer'};
                values['Feature'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].feature, type : 'integer'};
            }
            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'infoEinheit'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].infoEinheit, type : 'integer'};
            }

            counter++;
            upsert(values,'LernFeature',res,finish);

        }

    }

    finish();


};

module.exports.getLernEinheit =  function(req, res) {
    var counter = 1;

    var lernLektionen = [];
    var lernEinheit = null;

    var nextLernLektionId = null;
    var nextLernFeatureId = null;

    counter++;
    client.query('SELECT * FROM "LernEinheit" WHERE "Id" = '+req.params.lernEinheit+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        lernEinheit = {
            title:result.rows[0].Title,
            start:result.rows[0].StartYear,
            end:result.rows[0].EndYear,
            info:result.rows[0].Desc,
            id:result.rows[0].Id
        };

        finish();
    });

    counter++;
    client.query('SELECT "Id" FROM "LernFeature" ORDER BY "Id" DESC LIMIT 1;', function(err, resultId) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        if(resultId.rows[0]) nextLernFeatureId = resultId.rows[0].Id + 1;
        else nextLernFeatureId = 1;

        finish();
    });

    counter++;
    client.query('SELECT "Id" FROM "LernLektion" ORDER BY "Id" DESC LIMIT 1;', function(err, resultId) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        if(resultId.rows[0]) nextLernLektionId = resultId.rows[0].Id + 1;
        else nextLernLektionId = 1;

        finish();
    });



    counter++;

    client.query('SELECT * FROM "LernLektion" WHERE "LernEinheit" = '+req.params.lernEinheit+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }


        for(var x in result.rows){
            lernLektionen.push({
                title:result.rows[x].Title,
                start:result.rows[x].StartYear,
                end:result.rows[x].EndYear,
                id:result.rows[x].Id
            });

            lernLektionen[lernLektionen.length -1].lernFeature = [];

            counter++;
            getLernFeature(result.rows[x].Id,lernLektionen[lernLektionen.length -1])
        }

        finish();
    });

    var getLernFeature = function(id,lektion){

        client.query('SELECT * FROM "LernFeature" WHERE "LernLektion" = '+ id +';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            var feature;

            for(var x in result.rows){
                feature = {
                    info:result.rows[x].Desc,
                    typ:result.rows[x].Typ,
                    id:result.rows[x].Id,
                    start:result.rows[x].StartYear,
                    end:result.rows[x].EndYear
                };

                if(result.rows[x].Typ == 'infoEinheit'){
                    feature.infoEinheit = result.rows[x].InfoEinheit1;
                }
                if(result.rows[x].Typ == 'feature'){
                    feature.infoEinheit = result.rows[x].InfoEinheit1;
                    feature.feature = result.rows[x].Feature;
                }
                if(result.rows[x].Typ == 'planVgl'){
                    feature.plan1 = result.rows[x].InfoEinheit1;
                    feature.plan2 = result.rows[x].InfoEinheit2;
                    feature.plan3 = result.rows[x].InfoEinheit3 || null;
                }

                lektion.lernFeature.push(feature);

                counter++;
                getFeatureTitle(lektion.lernFeature[lektion.lernFeature.length-1]);

            }

            finish();
        });
    };

    var getFeatureTitle = function(feature){

        if(feature.typ == 'infoEinheit'){
            client.query('SELECT "Title" FROM "InfoEinheiten" WHERE "Id" = '+ feature.infoEinheit +';', function(err, result) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }
                feature.title = [result.rows[0].Title];
                finish();
            });
        }

        if(feature.typ == 'feature'){
            client.query('SELECT "Title" FROM "Feature" WHERE "Id" = '+ feature.feature +';', function(err, result) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }
                feature.title = [result.rows[0].Title];
                finish();
            });
        }

        if(feature.typ == 'planVgl'){
            client.query('SELECT "Title" FROM "InfoEinheiten" WHERE "Id" = '+ feature.plan1 +';', function(err, result) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }
                feature.title = [result.rows[0].Title];
                client.query('SELECT "Title" FROM "InfoEinheiten" WHERE "Id" = '+ feature.plan2 +';', function(err, result) {
                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }
                    feature.title.push(result.rows[0].Title);

                    if(feature.plan3){
                        client.query('SELECT "Title" FROM "InfoEinheiten" WHERE "Id" = '+ feature.plan3 +';', function(err, result) {
                            if(err) {
                                console.log(err);
                                res.end(err);
                                return
                            }
                            feature.title.push(result.rows[0].Title);
                            finish();
                        });
                    }
                    else{
                        finish();
                    }
                });
            });
        }
    };

    var finish = function(){

        if (!--counter) {

            lernEinheit.lernLektionen = lernLektionen;

            result = {nextLernLektionId : nextLernLektionId,
                nextLernFeatureId:nextLernFeatureId,
                lernEinheit : lernEinheit};

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(result));
        }
    };

    finish();

};

module.exports.deleteLernFeature =  function(req, res) {
    client.query('DELETE FROM "LernFeature" WHERE "Id"='+req.params.feature+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify('success'));
    });
};

module.exports.deleteLernLektion =  function(req, res) {
    client.query('DELETE FROM "LernLektion" WHERE "Id"='+req.params.lektion+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('DELETE FROM "LernFeature" WHERE "LernLektion"='+req.params.lektion+';', function(err, result) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

        });

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify('success'));
    });
};

module.exports.deleteLernEinheit =  function(req, res) {

    var counter = 1;

    var finish = function(){
        if (!--counter) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        }
    };

    var deleteLektion = function(id){
        client.query('DELETE FROM "LernLektion" WHERE "Id"='+ id + ';', function(err, result) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            client.query('DELETE FROM "LernFeature" WHERE "LernLektion"='+ id + ';', function(err, result) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                finish();
            });
        });
    };

    client.query('DELETE FROM "LernEinheit" WHERE "Id"='+req.params.einheit+';', function(err, result) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('SELECT "Id" FROM "LernLektion" WHERE "LernEinheit" ='+req.params.einheit+';', function(err, lektionen) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            for(var x in lektionen.rows){
                counter++;
                deleteLektion(lektionen.rows[x].Id)
            }

            finish();
        });
    });
};



// Utils

var upsert = function(values,tableName,res,finish){

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
