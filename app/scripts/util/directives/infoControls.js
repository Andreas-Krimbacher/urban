'use strict';

angular.module('udm.util')
  .directive('infocontrols', function (mapInfoEinheit) {
    return {
      templateUrl: '../views/util/infoControls.html',
      restrict: 'E',
      link: function postLink(scope) {

          scope.panelVisibility = {info : false,
              layerlist : false,
              imgslider : false};

          scope.$on('toogleInfoControlVisibility', function(e,data) {
              scope.panelVisibility[data.type] = data.state;
          });

          scope.$on('featureSelected', function(e,feature) {
              if(!feature){
                  if(!scope.$$phase){
                     scope.$apply(scope.panelVisibility.info = false,scope.panelVisibility.imgslider = false);
                  }
                  else{
                     scope.panelVisibility.info = false;
                     scope.panelVisibility.imgslider = false
                  }
                  return;
              }
             scope.panelVisibility.info = true;
             scope.$broadcast('selectItem',{type:'feature', id: feature.attributes.element.id});
             scope.$broadcast('showInfo', {data:feature.attributes.element,mode: 'openWorld'});
          });

         scope.reorderLayers = function(e, ui){
              if(ui.item.sortable.resort){
                  var infoEinheiten = ui.item.sortable.resort.$modelValue;
                    var x;
                  for(x = 0; x < infoEinheiten.length; x++){
                      if(ui.item.sortable.index == infoEinheiten[x].layerStackPosition){
                          mapInfoEinheit.changeOrder(infoEinheiten[x].id,x);
                      }
                  }
              }

          };

         scope.$on('sliderChanged', function(e,value) {
              var ids = value.name.split('_');
              mapInfoEinheit.setOpacity(ids[0],ids[1],ids[2],value.value/100);
          });

         scope.$on('removeInfoEinheit', function(e,infoEinheit) {
              mapInfoEinheit.removeInfoEinheit(infoEinheit.id);
              scope.$emit('infoEinheitRemoved',infoEinheit.id);
          });

         scope.$on('toogleFeatureLayer', function(e,infoEinheit) {
              mapInfoEinheit.toggleVisibility('featureLayer',infoEinheit.id);
          });

         scope.$on('showInfoPlan', function(e,feature) {
             scope.panelVisibility.info = true;
             scope.$broadcast('showInfo',{data:feature});
          });

         scope.$on('hideInfoBox', function() {
             scope.panelVisibility.info = false;
          });

         scope.showImageSlider = function(img){
             scope.panelVisibility.imgslider = true;
             scope.$broadcast('setImg',img);

          };
         scope.hideImageSlider = function(){
             scope.panelVisibility.imgslider = false;
          };
      }
    };
  });
