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


                eventSource.loadJSON({events:[{start:"2006",
                    end:"2010",
                    isDuration:false,
                    title:"Plan des Artistes",
                    caption:"Plan des Artistes",
                    textColor:'white',
                    rank: 1,
                    onClick:function(){alert('yes')}},
                    {start:"2008",
                        end:"2020",
                        isDuration:false,
                        title:"Plan des Artistes",
                        caption:"Plan des Artistes",
                        textColor:'white',
                        color: 'green',
                        rank: 3},
                    {start:"2004",
                        end:"2011",
                        isDuration:false,
                        title:"Plan des Artistes",
                        caption:"Plan des Artistes",
                        textColor:'white',
                        color: 'green',
                        rank: 3},
                    {start:"2007",
                        end:"2008",
                        isDuration:false,
                        title:"Plan des Artistes",
                        caption:"Plan des Artistes",
                        textColor:'white',
                        rank: 1},
                    {start:"2015",
                        end:"2016",
                        isDuration:false,
                        title:"Plan des Artistes",
                        caption:"Plan des Artistes",
                        textColor:'white',
                        rank: 1},
                    {start:"2021",
                        end:"2022",
                        isDuration:false,
                        title:"Plan des Artistes",
                        caption:"Plan des Artistes",
                        textColor:'white',
                        rank: 1}
                ]},'');
            }
        };
    });
