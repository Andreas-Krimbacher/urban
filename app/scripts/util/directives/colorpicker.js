'use strict';
/**
 * A directive to create a colorpicker ##
 * colorpicker emits 'colorpickerChanged' event when the color picker value change
 *
 * @name Directive:colorpicker
 * @namespace
 * @author Andreas Krimbacher
 * @returns {object} colorpicker emits 'colorpickerChanged' Event when the color picker value change
 */
angular.module('udm.util')
  .directive('colorpicker', [function () {
    return {
      template: '',
      restrict: 'E',
        scope:{
            /**
             * Hex-code
             * @name Directive:colorpicker#color
             * @type {string}
             */
            color:'@color',
            /**
             * name, is used in the id as 'colorpicker-'+name
             * @name Directive:colorpicker#name
             * @type {string}
             */
            name:'@name'
        },
      link: function postLink(scope, element, attrs) {

          /**
           * Is ture if a colorpicker widget was created
           * @name Directive:colorpicker#colorpickerCreated
           * @type {boolean}
           */
          var colorpickerCreated = false;

          attrs.$observe('color', function(){
              processChange()
          });
          attrs.$observe('name', function(){
              processChange()
          });

          /**
           * called when the parameter for the directive change
           * @name Directive:colorpicker#processChange
           * @function
           *
           */
          function processChange(){
              if( scope.name && scope.color){
                  if(colorpickerCreated) updateColorPicker();
                  else createColorPicker()
              }
          }

          /**
           * create the color picker widget
           * @name Directive:colorpicker#createColorPicker
           * @function
           *
           */
          function createColorPicker(){

              var name = scope.name;
              var color = scope.color;

              element.html('<input id="colorpicker-'+name+'" class="colorpickerInput" type="text" value="'+color+'">');

              $( "#colorpicker-"+name ).minicolors({
                  theme: 'bootstrap',
                  swatchPosition: 'right',
                  position : 'left',
                  change: function(hex) {
                      /**
                       * event is fired when the color picker change
                       * @name Directive:colorpicker#colorpickerChanged
                       * @event
                       * @returns {object} {value:hex,name:name}
                       */
                      scope.$emit('colorpickerChanged',{value:hex,name:name});
                  }
              });

              colorpickerCreated = true;
          }

          /**
           * update the color picker widget
           * @name Directive:colorpicker#updateColorPicker
           * @function
           *
           */
          function updateColorPicker(){

              var name = scope.name;
              var color = scope.color;

              $( "#colorpicker-"+name ).minicolors('value',color);
          }


      }
    };
  }]);
