/**
 * Server module to perform database tasks, the methods are directly used as middleware for specific routes
 * @name Server:db
 * @namespace
 * @author Andreas Krimbacher
 */
var pg = require('pg');
var filePaths = require('./filePaths');
var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');

var conString = "postgres://urban:urban@localhost:5432/urban";
var client = new pg.Client(conString);
client.connect();


/**
 * delete an Info-Feature in the DB
 * @name Server:db#deleteFeature
 * @function
 * @param req {object} server request object
 * @param req.params.feature {integer} Id Info-Feature
 * @param req.params.einheit {integer} Id Info-Einheit
 * @param res {object} server respond object
 */
module.exports.deleteFeature =  function(req, res) {
    client.query('DELETE FROM "InfoFeature" WHERE "Id"='+req.params.feature+';', function(err) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        //delete img
        rimraf(filePaths.image.uploadDir + '/' + req.params.einheit + '/' + req.params.feature,function(){});

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify('success'));
    });
};
/**
 * delete an Info-Einheit in the DB
 * @name Server:db#deleteInfoEinheit
 * @function
 * @param req {object} server request object
 * @param req.params.einheit {integer} Id Info-Einheit
 * @param res {object} server respond object
 */
module.exports.deleteInfoEinheit =  function(req, res) {
    client.query('DELETE FROM "InfoEinheit" WHERE "Id"='+req.params.einheit+';', function(err) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('DELETE FROM "InfoFeature" WHERE "InfoEinheit"='+req.params.einheit+';', function(err) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            //delete img
            rimraf(filePaths.image.uploadDir + '/' + req.params.einheit ,function(){});

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        });
    });
};
/**
 * get a list of all Info-Einheiten
 * @name Server:db#InfoEinheitenList
 * @function
 * @param req {object} server request object
 * @param res {object} server respond object
 */
module.exports.InfoEinheitenList =  function(req, res) {
    //get Info-Einheiten
    client.query('SELECT * FROM "InfoEinheit";', function(err, resultList) {

        var x;

        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        //get next Info-Einheiten Id
        client.query('SELECT "Id" FROM "InfoEinheit" ORDER BY "Id" DESC LIMIT 1;', function(err, nextInfoEinheitId) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            if(nextInfoEinheitId.rows[0]) nextInfoEinheitId = nextInfoEinheitId.rows[0].Id + 1;
            else nextInfoEinheitId = 1;

            //get next Info-Feature Id
            client.query('SELECT "Id" FROM "InfoFeature" ORDER BY "Id" DESC LIMIT 1;', function(err, nextFeatureId) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                var respondList = [];
                for(x=0; x < resultList.rows.length; x++){
                    respondList.push({
                        title:resultList.rows[x].Title,
                        start:resultList.rows[x].StartYear,
                        end:resultList.rows[x].EndYear,
                        info:resultList.rows[x].Desc,
                        rank:resultList.rows[x].TimeLineOrder,
                        id:resultList.rows[x].Id
                    });
                }

                if(nextFeatureId.rows[0]) nextFeatureId = nextFeatureId.rows[0].Id + 1;
                else nextFeatureId = 1;
                var result = {nextInfoEinheitId : nextInfoEinheitId,
                    nextFeatureId : nextFeatureId,
                    list : respondList};

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(result));
            });
        });
    });
};
/**
 * get an Info-Einheit
 * @name Server:db#getInfoEinheit
 * @function
 * @param req {object} server request object
 * @param req.params.einheit {integer} Id Info-Einheit
 * @param res {object} server respond object
 */
module.exports.getInfoEinheit =  function(req, res) {
    var counter = 1;
    var x;

    var respondFeatures = [];
    var infoEinheit = null;
    var nextFeatureId = null;


    var finish = function(){
        if (!--counter) {
            infoEinheit.features = respondFeatures;

            var result = {nextId : nextFeatureId,
                infoEinheit : infoEinheit};

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(result));
        }
    };

    //get Info-Einheit
    counter++;
    client.query('SELECT * FROM "InfoEinheit" WHERE "Id" = '+req.params.einheit+';', function(err, result) {
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
        getImgFileList('/' + req.params.einheit,infoEinheit);

        finish();
    });

    //get the next Info-Feture Id
    counter++;
    client.query('SELECT "Id" FROM "InfoFeature" ORDER BY "Id" DESC LIMIT 1;', function(err, resultId) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        if(resultId.rows[0]) nextFeatureId = resultId.rows[0].Id + 1;
        else nextFeatureId = 1;

        finish();
    });

    //get the Info-Feture to the Info-Einheit
    counter++;
    client.query('SELECT * FROM "InfoFeature" WHERE "InfoEinheit" = '+req.params.einheit+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }


        for(x=0; x < result.rows.length; x++){
            respondFeatures.push({
                title:result.rows[x].Title,
                start:result.rows[x].StartYear,
                end:result.rows[x].EndYear,
                info:result.rows[x].Desc,
                id:result.rows[x].Id,
                link:result.rows[x].Link_InfoElement,
                typ:result.rows[x].Typ,
                color:result.rows[x].Color,
                rot:result.rows[x].Rot
            });

            if(result.rows[x].Typ == 'plan' || result.rows[x].Typ == 'planOverlay'){
                counter++;
                getMetaData(result.rows[x].TileDB,respondFeatures[respondFeatures.length-1]);
            }
            else{
                counter++;
                getGeom(result.rows[x].Id,result.rows[x].Typ,respondFeatures[respondFeatures.length-1])
            }

            counter++;
            getImgFileList('/' + req.params.einheit + '/' + result.rows[x].Id,respondFeatures[respondFeatures.length-1]);

        }

        finish();
    });

    //get geom for a Info-Feature
    var getGeom = function(id,typ,feature){
        if(typ == 'pointOri') typ = 'point';

        client.query('SELECT ST_AsText("geom_'+typ+'") FROM "InfoFeature" WHERE "Id"='+id+';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }
            feature.feature = {};
            feature.feature.geom = result.rows[0].st_astext;

            finish();
        });
    };

    //get metadata for a Info-Feature
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

    //get images for a Info-Feature
    var getImgFileList = function(src,object){
        fs.exists(filePaths.image.uploadDir + src, function (exists) {
            if(exists){
                fs.readdir(filePaths.image.uploadDir + src,function(err,files){
                    if(err){
                        res.end(err);
                        return
                    }

                    object.img = [];

                    for(x=0; x < files.length; x++){
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

    finish();

};
/**
 * save an Info-Einheit or update if it alredy exists
 * @name Server:db#saveInfoEinheit
 * @function
 * @param req {object} server request object
 * @param res {object} server respond object
 */
module.exports.saveInfoEinheit =  function(req, res) {
    var counter = 1;
    var x;

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

    //save Info-Einheit
    counter++;
    upsert(values,'InfoEinheit',res,finish);

    for(x = 0; x < infoEinheit.features.length; x++){

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
        else if(infoEinheit.features[x].typ == 'pointOri'){
            values['Rot'] = {value: infoEinheit.features[x].rot || null, type : 'integer'};
            values['geom_point'] = {value : infoEinheit.features[x].feature.geom, type : 'geom'};
        }
        else{
            values['Color'] = {value: infoEinheit.features[x].color, type : 'string'};
            values['geom_'+infoEinheit.features[x].typ] = {value : infoEinheit.features[x].feature.geom, type : 'geom'};
        }

        //save Info-Feature
        counter++;
        upsert(values,'InfoFeature',res,finish);

    }

    finish();
};

/**
 * get a list of all Lern-Einheiten
 * @name Server:db#LernEinheitList
 * @function
 * @param req {object} server request object
 * @param res {object} server respond object
 */
module.exports.LernEinheitList =  function(req, res) {

    //get Lern-Einheiten
    var x;
    client.query('SELECT * FROM "LernEinheit";', function(err, resultList) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        //get next Lern-Einheiten Id
        client.query('SELECT "Id" FROM "LernEinheit" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernEinheitId) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            if(nextLernEinheitId.rows[0]) nextLernEinheitId = nextLernEinheitId.rows[0].Id + 1;
            else nextLernEinheitId = 1;

            //get next Lern-Lektion Id
            client.query('SELECT "Id" FROM "LernLektion" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernLektionId) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                if(nextLernLektionId.rows[0]) nextLernLektionId = nextLernLektionId.rows[0].Id + 1;
                else nextLernLektionId = 1;

                //get next Lern-Feature Id
                client.query('SELECT "Id" FROM "LernFeature" ORDER BY "Id" DESC LIMIT 1;', function(err, nextLernFeatureId) {

                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }

                    if(nextLernFeatureId.rows[0]) nextLernFeatureId = nextLernFeatureId.rows[0].Id + 1;
                    else nextLernFeatureId = 1;

                    var respondList = [];
                    for(x=0; x < resultList.rows.length; x++){
                        respondList.push({
                            title:resultList.rows[x].Title,
                            start:resultList.rows[x].StartYear,
                            end:resultList.rows[x].EndYear,
                            info:resultList.rows[x].Desc,
                            id:resultList.rows[x].Id
                        });
                    }

                    var result = {nextLernEinheitId : nextLernEinheitId,
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
/**
 * save an Lern-Einheit or update if it alredy exists
 * @name Server:db#saveLernEinheit
 * @function
 * @param req {object} server request object
 * @param res {object} server respond object
 */
module.exports.saveLernEinheit =  function(req, res) {
    var counter = 1;
    var x;
    var y;

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
    values['EndYear'] = {value: lernEinheit.end, type : 'integer'};

    //save Lern-Einheit
    counter++;
    upsert(values,'LernEinheit',res,finish);


    //function to save the visibility object
    var saveVisibility = function(lernFeature,visible){
        client.query('DELETE FROM "LernFeatureVisibility" WHERE "LernFeature" = '+lernFeature+';', function(err) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            for(var x in visible){
                counter++;
                addVisibilityRecord(lernFeature,x,visible[x]);
            }

            finish();
        });
    };

    //save one key/value pair of the visibility object
    var addVisibilityRecord = function(lernFeature,infoFeature,visibility){
        client.query('INSERT INTO "LernFeatureVisibility"("LernFeature", "InfoFeature", "Visibility") VALUES ('+lernFeature+','+infoFeature+','+visibility+');', function(err) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            finish();
        });
    };

    for(x = 0; x < lernEinheit.lernLektionen.length; x++){
        values = {};

        values['Id'] = {value: lernEinheit.lernLektionen[x].id, type : 'integer'};
        values['LernEinheit'] = {value: lernEinheit.id, type : 'integer'};
        values['Title'] = {value: lernEinheit.lernLektionen[x].title, type : 'string'};
        values['StartYear'] = {value: lernEinheit.lernLektionen[x].start, type : 'integer'};
        values['EndYear'] = {value: lernEinheit.lernLektionen[x].end, type : 'integer'};
        values['Order'] = {value: lernEinheit.lernLektionen[x].order, type : 'integer'};

        //save Lern-Lektion
        counter++;
        upsert(values,'LernLektion',res,finish);


        for(y = 0; y < lernEinheit.lernLektionen[x].lernFeature.length; y++){

            values = {};

            values['Id'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].id, type : 'integer'};
            values['LernLektion'] = {value: lernEinheit.lernLektionen[x].id, type : 'integer'};
            values['Desc'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].info || null, type : 'string'};
            values['Typ'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].typ, type : 'string'};
            values['StartYear'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].start, type : 'integer'};
            values['EndYear'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].end, type : 'integer'};
            values['Order'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].order, type : 'integer'};
            values['Zoom'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].mapView.zoom, type : 'integer'};
            values['geom_center'] = {value : lernEinheit.lernLektionen[x].lernFeature[y].mapView.wkt.geom, type : 'geom'};

            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'planVgl'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan1 || null, type : 'integer'};
                values['InfoEinheit2'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan2 || null, type : 'integer'};
                values['InfoEinheit3'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].plan3 || null, type : 'integer'};
            }
            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'feature'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].infoEinheit, type : 'integer'};
                values['Feature'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].feature, type : 'integer'};

                counter++;
                saveVisibility(lernEinheit.lernLektionen[x].lernFeature[y].id,lernEinheit.lernLektionen[x].lernFeature[y].visible);
            }
            if(lernEinheit.lernLektionen[x].lernFeature[y].typ == 'infoEinheit'){
                values['InfoEinheit1'] = {value: lernEinheit.lernLektionen[x].lernFeature[y].infoEinheit, type : 'integer'};

                counter++;
                saveVisibility(lernEinheit.lernLektionen[x].lernFeature[y].id,lernEinheit.lernLektionen[x].lernFeature[y].visible);
            }

            //save Lern-Feature
            counter++;
            upsert(values,'LernFeature',res,finish);

        }
    }

    finish();
};
/**
 * get an Lern-Einheit
 * @name Server:db#getLernEinheit
 * @function
 * @param req {object} server request object
 * @param req.params.einheit {integer} Id Lern-Einheit
 * @param res {object} server respond object
 */
module.exports.getLernEinheit =  function(req, res) {
    var counter = 1;
    var x;

    var lernLektionen = [];
    var lernEinheit = null;

    var nextLernLektionId = null;
    var nextLernFeatureId = null;

    var finish = function(){

        if (!--counter) {

            lernEinheit.lernLektionen = lernLektionen;

            lernEinheit.lernLektionen.sort(function(a, b){
                return a.order-b.order;
            });

            for(x=0; x < lernEinheit.lernLektionen.length; x++){
                lernEinheit.lernLektionen[x].lernFeature.sort(function(a, b){
                    return a.order-b.order;
                });
            }

            var result = {nextLernLektionId : nextLernLektionId,
                nextLernFeatureId:nextLernFeatureId,
                lernEinheit : lernEinheit};

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(result));
        }
    };

    //get Lern-Einheit
    counter++;
    client.query('SELECT * FROM "LernEinheit" WHERE "Id" = '+req.params.einheit+';', function(err, result) {
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

    //get next Lern-Feature Id
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

    //get next Lern-Lektion Id
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

    //get Lern-Lektion
    counter++;
    client.query('SELECT * FROM "LernLektion" WHERE "LernEinheit" = '+req.params.einheit+';', function(err, result) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }


        for(x=0; x < result.rows.length; x++){
            lernLektionen.push({
                title:result.rows[x].Title,
                start:result.rows[x].StartYear,
                end:result.rows[x].EndYear,
                id:result.rows[x].Id,
                order:result.rows[x].Order
            });

            lernLektionen[lernLektionen.length -1].lernFeature = [];

            counter++;
            getLernFeature(result.rows[x].Id,lernLektionen[lernLektionen.length -1])
        }

        finish();
    });

    //get Lern-Feature
    var getLernFeature = function(id,lektion){

        client.query('SELECT * FROM "LernFeature" WHERE "LernLektion" = '+ id +';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            var feature;

            for(x=0; x < result.rows.length; x++){
                feature = {
                    info:result.rows[x].Desc,
                    typ:result.rows[x].Typ,
                    id:result.rows[x].Id,
                    start:result.rows[x].StartYear,
                    end:result.rows[x].EndYear,
                    order:result.rows[x].Order,
                    mapView : {zoom:result.rows[x].Zoom}
                };

                counter++;
                getGeom(feature);

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

                counter++;
                getVisible(lektion.lernFeature[lektion.lernFeature.length-1]);
            }

            finish();
        });
    };

    //get geometry forthe Lern-feature mapview
    var getGeom = function(feature){
        client.query('SELECT ST_AsText("geom_center") FROM "LernFeature" WHERE "Id"='+feature.id+';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            feature.mapView.wkt = {geom:result.rows[0].st_astext};

            finish();
        });
    };

    //get titel of the Info-Feature in the Lern-Feature
    var getFeatureTitle = function(feature){

        if(feature.typ == 'infoEinheit'){
            client.query('SELECT "Title" FROM "InfoEinheit" WHERE "Id" = '+ feature.infoEinheit +';', function(err, result) {
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
            client.query('SELECT "Title" FROM "InfoFeature" WHERE "Id" = '+ feature.feature +';', function(err, result) {
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
            client.query('SELECT "Title" FROM "InfoEinheit" WHERE "Id" = '+ feature.plan1 +';', function(err, result) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }
                feature.title = [result.rows[0].Title];
                client.query('SELECT "Title" FROM "InfoEinheit" WHERE "Id" = '+ feature.plan2 +';', function(err, result) {
                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }
                    feature.title.push(result.rows[0].Title);

                    if(feature.plan3){
                        client.query('SELECT "Title" FROM "InfoEinheit" WHERE "Id" = '+ feature.plan3 +';', function(err, result) {
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

    //get visibility object
    var getVisible = function(feature){
        client.query('SELECT * FROM "LernFeatureVisibility" WHERE "LernFeature" = '+ feature.id +';', function(err, result) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            var visible = {};
            for(x=0; x < result.rows.length; x++){
                visible[result.rows[x].InfoFeature] = result.rows[x].Visibility;
            }

            feature.visible = visible;

            finish();
        });
    };

    finish();

};
/**
 * delete a Lern-Feature
 * @name Server:db#deleteLernFeature
 * @function
 * @param req {object} server request object
 * @param req.params.feature {integer} Id Lern-Feature
 * @param res {object} server respond object
 */
module.exports.deleteLernFeature =  function(req, res) {
    client.query('DELETE FROM "LernFeature" WHERE "Id"='+req.params.feature+';', function(err) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        //delete visibility entries
        client.query('DELETE FROM "LernFeatureVisibility" WHERE "LernFeature" = '+req.params.feature+';', function(err) {
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
/**
 * delete Lern-Lektion
 * @name Server:db#deleteLernLektion
 * @function
 * @param req {object} server request object
 * @param req.params.lektion {integer} Id Lern-Lektion
 * @param res {object} server respond object
 */
module.exports.deleteLernLektion =  function(req, res) {
    var counter = 1;
    var x;

    var finish = function(){
        if (!--counter) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        }
    };

    //delete Lern-Feature and visibility entries
    var deleteFeature = function(id){
        client.query('DELETE FROM "LernFeature" WHERE "Id"='+id+';', function(err) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            client.query('DELETE FROM "LernFeatureVisibility" WHERE "LernFeature"='+ id + ';', function(err) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                finish();
            });

        });
    };

    //delete Lern-Lektion
    client.query('DELETE FROM "LernLektion" WHERE "Id"='+req.params.lektion+';', function(err) {

        if(err) {
            console.log(err);
            res.end(err);
            return
        }

        client.query('SELECT "Id" FROM "LernFeature" WHERE "LernLektion" ='+req.params.lektion+';', function(err, feature) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            for(x = 0; x < feature.rows.length; x++){
                counter++;
                deleteFeature(feature.rows[x].Id)
            }

            finish();
        });
    });
};
/**
 * delete Lern-Einheit
 * @name Server:db#deleteLernEinheit
 * @function
 * @param req {object} server request object
 * @param req.params.einheit {integer} Id Lern-Einheit
 * @param res {object} server respond object
 */
module.exports.deleteLernEinheit =  function(req, res) {
    var counter = 1;
    var x;

    var finish = function(){
        if (!--counter) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify('success'));
        }
    };

    //delete Lern-Lektion
    var deleteLektion = function(id){
        client.query('DELETE FROM "LernLektion" WHERE "Id"='+ id + ';', function(err) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            client.query('SELECT "Id" FROM "LernFeature" WHERE "LernLektion" ='+id+';', function(err, feature) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                for(x = 0; x < feature.rows.length; x++){
                    counter++;
                    deleteFeature(feature.rows[x].Id)
                }

                finish();
            });
        });
    };

    //delete Lern-Feature and visibility entries
    var deleteFeature = function(id){
        client.query('DELETE FROM "LernFeature" WHERE "Id"='+id+';', function(err) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            client.query('DELETE FROM "LernFeatureVisibility" WHERE "LernFeature"='+ id + ';', function(err) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                finish();
            });

        });
    };

    //delete Lern-Einheit
    client.query('DELETE FROM "LernEinheit" WHERE "Id"='+req.params.einheit+';', function(err) {

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

            for(x=0; x < lektionen.rows.length; x++){
                counter++;
                deleteLektion(lektionen.rows[x].Id)
            }

            finish();
        });
    });
};



/**
 * Utility function, insert into DB or update if it already exists
 * @name Server:db#upsert
 * @function
 * @param values {object} values to insert, object keys = attribute names
 * @param values.type {string} (geom,string,integer)
 * @param values.value {value} the value depending on the type
 * @param tableName {string} table name
 * @param res {object} server respond object
 * @param finish {function} callback
 */
var upsert = function(values,tableName,res,finish){

    var x;

    var sqlUpdate = 'UPDATE "'+tableName+'" SET ';
    for(x in values){
        sqlUpdate += '"' + x + '"' + '=';
        if(values[x].type == 'geom') sqlUpdate += 'ST_GeomFromText(\''+values[x].value+'\',\'4326\') ,';
        if(values[x].type == 'string') sqlUpdate += '\'' + values[x].value + '\' ,';
        if(values[x].type == 'integer') sqlUpdate += values[x].value + ' ,';
    }
    sqlUpdate = sqlUpdate.substring(0,sqlUpdate.length-1);
    sqlUpdate += 'WHERE "Id"=' + values['Id'].value +';';


    var sqlInsert = 'INSERT INTO "'+tableName+'" (';
    for(x in values){
        sqlInsert += '"' + x + '"' + ',';
    }
    sqlInsert = sqlInsert.substring(0,sqlInsert.length-1);
    sqlInsert += ') SELECT ';
    for(x in values){
        if(values[x].type == 'geom') sqlInsert += 'ST_GeomFromText(\''+values[x].value+'\',\'4326\') ,';
        if(values[x].type == 'string') sqlInsert += '\'' + values[x].value + '\' ,';
        if(values[x].type == 'integer') sqlInsert += values[x].value + ' ,';
    }
    sqlInsert = sqlInsert.substring(0,sqlInsert.length-1);
    sqlInsert += ' WHERE NOT EXISTS (SELECT 1 FROM "'+tableName+'" WHERE "Id"=' + values['Id'].value +');';

    console.log(sqlUpdate);
    client.query(sqlUpdate, function(err) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        console.log(sqlInsert);
        client.query(sqlInsert, function(err) {
            if(err) {
                console.log(err);
                res.end(err);
                return
            }
            finish();
        });
    });

};
