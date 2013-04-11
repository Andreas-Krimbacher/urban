'use strict';

angular.module('swaApp')
    .directive('timeline', function () {
        return {
            templateUrl: '../views/timeline.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                var eventSource = new Timeline.DefaultEventSource();
                var bandInfos = [
                    Timeline.createBandInfo({
                        width:          "70%",
                        intervalUnit:   SimileAjax.DateTime.YEAR,
                        intervalPixels: 50,
                        eventSource : eventSource
                    }),
                    Timeline.createBandInfo({
                        width:          "30%",
                        intervalUnit:   SimileAjax.DateTime.CENTURY,
                        intervalPixels: 300,
                        eventSource : eventSource,
                        overview:	true
                    })
                ];

                bandInfos[1].syncWith = 0;
                bandInfos[1].highlight = true;

                var tl = Timeline.create(document.getElementById("timeline"), bandInfos);
                tl.getBand(0).scrollToCenter(SimileAjax.DateTime.parseGregorianDateTime(1800));


                var infoElement = {name: 'Plan des Artistes',
                                    info: 'Im Gegensatz zu den Vereinigten Staaten standen der neu geformten bürgerlichen Gesellschaft in Frankreich aber keine Landreserven zur Verfügung. Um einen klaren Bruch mit dem mittelalterlichen Erscheinungsbild Paris’ zu signalisieren und um die katastrophale verkehrstechnische und hygienische Situation der gotischen Stadt zu verbessern, wurde mit dem “Plan des Artistes” erstmals der Vorschlag gemacht, breite Schneisen durch den alten Stadtkörper zu schlagen. Möglich war diese massive Umstrukturierung der Stadt aufgrund der Enteignung der Kirchen und Klöster im Laufe der Revolution.',
                                    start : '1793',
                                    end : '1800'
                }


                eventSource.loadJSON({events:[{start:infoElement.start,
                    end:infoElement.end,
                    isDuration:false,
                    title:infoElement.name,
                    caption:infoElement.name,
                    textColor:'white',
                    rank: 1,
                    onClick:function(){

                        scope.$apply(scope.$emit('showInfoElement',infoElement));

                    }}
//                    {start:"2008",
//                        end:"2020",
//                        isDuration:false,
//                        title:"Plan des Artistes",
//                        caption:"Plan des Artistes",
//                        textColor:'white',
//                        color: 'green',
//                        rank: 3},
//                    {start:"2004",
//                        end:"2011",
//                        isDuration:false,
//                        title:"Plan des Artistes",
//                        caption:"Plan des Artistes",
//                        textColor:'white',
//                        color: 'green',
//                        rank: 3},
//                    {start:"2007",
//                        end:"2008",
//                        isDuration:false,
//                        title:"Plan des Artistes",
//                        caption:"Plan des Artistes",
//                        textColor:'white',
//                        rank: 1},
//                    {start:"2015",
//                        end:"2016",
//                        isDuration:false,
//                        title:"Plan des Artistes",
//                        caption:"Plan des Artistes",
//                        textColor:'white',
//                        rank: 1},
//                    {start:"2021",
//                        end:"2022",
//                        isDuration:false,
//                        title:"Plan des Artistes",
//                        caption:"Plan des Artistes",
//                        textColor:'white',
//                        rank: 1}
                ]},'');
            }
        };
    });
