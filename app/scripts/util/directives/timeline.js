'use strict';

angular.module('udm.util')
    .directive('timeline', function () {
        return {
            template: '<div id="timeline"></div>',
            restrict: 'E',
            link: function postLink(scope) {

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


                scope.$on('addInfoElements', function(e,infoElements) {

                    var x;
                    for(x = 0; x < infoElements; x++){
                        infoElements[x].isDuration = false;
                        infoElements[x].caption = infoElements[x].title;
                        infoElements[x].textColor = 'black';
                    }

                    eventSource.loadJSON({events:infoElements},'');
                });
            }
        };
    });
