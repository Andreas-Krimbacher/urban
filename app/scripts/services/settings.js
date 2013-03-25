'use strict';

angular.module('swaApp')
  .factory('settings', function () {
    // Service logic


    var attributes = {
        id : {
          type : 'int',
          editable : false,
           display : false
        },
        class :  {
            type : 'select',
            values : [{name : 'Class1',value : 'Class1'},{name : 'Class2',value : 'Class2'},{name : 'Class3',value : 'Class3'}],
            default : 'Class1',
            displayName : 'Klasse',
            editable : true,
            display : true
        },
        desc : {
            type : 'text',
            default : 'Test',
            editable : true,
            displayName : 'Beschreibung',
            display : true
        },
        created : {
            type : 'date',
            editable : false,
            displayName : 'Erstellt am',
            display : false
        }
    };

    // Public API here
    return {
      getAttributes: function () {
        return attributes;
      },
        getDefaultValues: function() {
            return {class:attributes.class.default,desc : attributes.desc.default};
        }
    };
  });
