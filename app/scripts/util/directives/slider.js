'use strict';
/**
 * Directive for a slider ##
 * Slider emits 'sliderChanged' Event when the slider value change
 *
 * @name Directive:slider
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
  .directive('slider', [function () {
    return {
      template: '',
      restrict: 'E',
        scope:{
            /**
             * name, is used in the id as 'slider-'+name
             * and is used in the change event
             * @nameDirective:slider#name
             * @type {string}
             */
            name:'@name',
            /**
             * Minimum value
             * @nameDirective:slider#min
             * @type {integer}
             */
            min:'@min',
            /**
             * Maximum value
             * @nameDirective:slider#max
             * @type {integer}
             */
            max:'@max',
            /**
             * Value of the slider
             * @nameDirective:slider#value
             * @type {integer}
             */
            value:'@value',
            /**
             * Steps of the scale
             * @nameDirective:slider#step
             * @type {integer}
             */
            step:'@step'
        },
      link: function postLink(scope, element, attrs) {

          /**
           * Is ture if a slider widget was created
           * @name Directive:slider#sliderCreated
           * @type {boolean}
           */
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

          /**
           * called when the parameter for the directive change
           * @name Directive:slider#processChange
           * @function
           *
           */
          function processChange(){
              if( scope.name &&  scope.min &&  scope.max &&  scope.value &&  scope.step){
                  if(sliderCreated) updateSlider();
                  else createSlider()
              }
          }

          /**
           * create the slider widget
           * @name Directive:slider#createSlider
           * @function
           *
           */
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

          /**
           * update the slider widget
           * @name Directive:slider#updateSlider
           * @function
           *
           */
          function updateSlider(){

              var name = scope.name;

              $( "#slider-"+name ).slider('option',{
                  min: +scope.min,
                  max: +scope.max,
                  step: +scope.step,
                  value: +scope.value,
                  slide: function( event, ui ) {
                      /**
                       * event is fired when the slider change
                       * @name Directive:slider#sliderChanged
                       * @event
                       * @returns {object} {value:sliderValue,name:name}
                       */
                      scope.$emit('sliderChanged',{value:ui.value,name:name});
                  }
              });
          }

      }
    };
  }]);
