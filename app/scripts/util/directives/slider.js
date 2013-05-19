'use strict';

angular.module('udm.util')
  .directive('slider', [function () {
    return {
      template: '',
      restrict: 'E',
        scope:{
            name:'@name',
            min:'@min',
            max:'@max',
            value:'@value',
            step:'@step'
        },
      link: function postLink(scope, element, attrs) {

          var sliderCreated = false;

          attrs.$observe('value', function(){
              processChange();
          });
          attrs.$observe('name', function(){
              processChange();
          });
          attrs.$observe('max', function(){
              processChange();
          });
          attrs.$observe('step', function(){
              processChange();
          });

          function processChange(){
              if( scope.name &&  scope.min &&  scope.max &&  scope.value &&  scope.step){
                  if(sliderCreated) updateSlider();
                  else createSlider()
              }
          }

          function createSlider(){

              var name = scope.name;

              element.html('<div id="slider-'+name+'" class="slider"></div>');

              $( "#slider-"+name ).slider({
                  min: +scope.min,
                  max: +scope.max,
                  step: +scope.step,
                  value: +scope.value,
                  slide: function( event, ui ) {
                      scope.$emit('sliderChanged',{value:ui.value,name:name});
                  }
              });

              scope.$on('disableSlider-'+name, function(e,value) {
                  $( "#slider-"+name ).slider( "option", "disabled", value );
              });

              sliderCreated = true;
          }

          function updateSlider(){

              var name = scope.name;

              $( "#slider-"+name ).slider('option',{
                  min: +scope.min,
                  max: +scope.max,
                  step: +scope.step,
                  value: +scope.value,
                  slide: function( event, ui ) {
                      scope.$emit('sliderChanged',{value:ui.value,name:name});
                  }
              });
          }





      }
    };
  }]);
