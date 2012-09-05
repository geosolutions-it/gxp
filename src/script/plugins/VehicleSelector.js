/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Vehicle
 */

/** api: (extends)
 *  plugins/VehicleSelector.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: VehicleSelector(config)
 *
 *    update the content of layers and the status of the time slider dynamically.
 */
gxp.plugins.VehicleSelector = Ext.extend(gxp.plugins.Tool, {
    
	/** api: ptype = gxp_synchronizer */
    ptype: "gxp_vehicle_selector",

    oldState: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.VehicleSelector.superclass.constructor.apply(this, arguments);
		this.vehicles = config.vehicles;
		this.cruiseName = config.cruiseName;
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.VehicleSelector.superclass.init.apply(this, arguments);
		this.layers = target.mapPanel.layers.data.items;
		
	},
	
    addOutput: function() {

		this.checkbox =  new Ext.form.CheckboxGroup({
			style: 'margin-left: 30px',
		    id:'vehicle-group',
		    xtype: 'checkboxgroup',
		    itemCls: 'x-check-group-alt',
		    columns: 1,
		    items: this.createCheckboxes(),
			listeners:{
				change : {
			    fn : function(checkbox, checked){
				
				  if ( checked.length > 0 ){
					  var clause = '(';
				      for (var i=0; i<checked.length; i++){
						clause += " glider_name = '" + checked[i].name +"'";
						if ( i+1 < checked.length ){
							clause += ' OR ';
						}
					  }
					  clause += ')';

					  for (var l=0; l<this.layers.length; l++){
							if ( this.layers[l].data ){
								var layer = this.layers[l].data.layer;
								if ( layer instanceof OpenLayers.Layer.WMS && layer.name !== "Nurc Background" ){
									if (layer.params.CQL_FILTER){
										var filter = "cruise_name = '"+ this.cruiseName + "' AND " + clause;
										var type = this.getType(layer.params.CQL_FILTER);
										if ( type ){
											filter += " AND type=" + type;
										}
										layer.mergeNewParams({
											"cql_filter": filter
										});	
									}
									
								}									
							}
					  }		
					this.saveState( checked );					
				  } else {
					// at least one box should be selected
					Ext.Msg.show({
			                   title: 'Cannot unselect this vehicle',
			                   msg: 'At least one vehicle must be selected',
			                   buttons: Ext.Msg.OK,
			                   icon: Ext.MessageBox.WARNING
			                });
					// reset the old state
					this.restoreState( );
				  }

				  
			    },
			    scope : this
			  }
			}
		});

 		var panel = gxp.plugins.VehicleSelector.superclass.addOutput.call(this, 
			this.checkbox
			/*new Ext.Panel({
					margins: {
						left:10
					},
				items:[
				 this.checkbox
				],
				scope:this
			})*/
		);
		panel.setPagePosition(10, 0);
       return panel;
    },

   getType: function( filter ){
	  var match = filter.match(/.*type *= *([a-zA-Z0-9']*)/);
	  if ( match && match.length >= 2 ){
		return match[1];
	  } 
	  return null;
   },

   saveState: function(state){
	this.oldState = state;
   },

   restoreState: function(  ){
	 var boxes = this.checkbox.items.items;
	 for (var i=0; i<this.oldState.length; i++){
		var el = this.oldState[i];
		for (var j=0; j<boxes.length; j++){
			var box = boxes[j];
			if ( el.name === box.name ){
				this.checkbox.setValue(box.id, true);
			}
		}
	 }
   },

   createCheckboxes: function(){
	    var checkboxes = new Array();
	    for ( var i=0; i<this.vehicles.length; i++ ){
			checkboxes[i] = {boxLabel: this.vehicles[i], name: this.vehicles[i], checked:true}
		}
		return checkboxes;
    }


});

Ext.preg(gxp.plugins.VehicleSelector.prototype.ptype, gxp.plugins.VehicleSelector);