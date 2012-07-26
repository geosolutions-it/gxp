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
 *  class = AddGeometry
 */

/** api: (extends)
 *  plugins/AddGeometry.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: AddGeometry(config)
 *
 *    tools to create points, polygons and other geometries.
 */
gxp.plugins.AddGeometry = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_pilot_notes */
    ptype: "gxp_add_geometry",
    
    /** api: config[addPointMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addPointMenuText: "Add Point",


    /** api: config[ addPointTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addPointTooltip: "Add Point",

    layerDefaultName: "Unknown",

    /** api: config[addLinesMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addLinesMenuText: "Add Lines",


    /** api: config[ addLinesTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addLinesTooltip: "Add Lines",

    /** api: config[addPolygonMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addPolygonMenuText: "Add Polygon",


    /** api: config[ addPolygonTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addPolygonTooltip: "Add Polygon",

	customLayerDefaultName: "Custom layer",
  
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.AddGeometry.superclass.constructor.apply(this, arguments);
        this.addEvents( 
            "addgeometry"
        );
    },



    /** api: method[addActions]
     */
    addActions: function() {
	
		var self = this;
		var customLayer = this.customLayer;
		this.addPointBtn = new Ext.Button({
			    menuText: this.addPointMenuText,
	            iconCls: "gxp-icon-add-point",
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: false,
	            tooltip: this.addPointTooltip,
	            handler: function(button, event) {
					if(button.pressed) {
						
					   	self.activateDrawing('point');

						this.target.fireEvent("addgeometry", this, 
						   {  onSave: function(name, description){ // handler
								self.drawControls['point'].deactivate();
								self.addPointBtn.toggle(false);
							  },
							  onCancel: function(){
								self.drawControls['point'].deactivate();
								self.addPointBtn.toggle(false);
							 }
						   });
				    }

	            },
	            scope: this
		});
		
		
		this.addLinesBtn = new Ext.Button({
			    menuText: this.addLinesMenuText,
	            iconCls: "gxp-icon-add-lines",
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: false,
	            tooltip: this.addLinesTooltip,
	            handler: function(button, event) {
					if(button.pressed) {
						
						self.activateDrawing('line');

						this.target.fireEvent("addgeometry", this, 
						   {  onSave: function(name, description){ // handler
								self.drawControls['line'].deactivate();
								self.addLinesBtn.toggle(false);
							  },
							  onCancel: function(){
								self.drawControls['line'].deactivate();
								self.addLinesBtn.toggle(false);
							 }
						   });
				    }

	            },
	            scope: this
		});
		

		this.addPolygonBtn = new Ext.Button({
			    menuText: this.addPolygonMenuText,
	            iconCls: "gxp-icon-add-polygon",
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: false,
	            tooltip: this.addPolygonTooltip,
	            handler: function(button, event) {
					if(button.pressed) {		
						// activate polygon drawing feature
						self.activateDrawing('polygon');
						
						// notify event
						this.target.fireEvent("addgeometry", this, 
						   {  onSave: function(name, description){ // handler
							    self.drawControls['polygon'].deactivate();
								self.addPolygonBtn.toggle(false);
								self.drawControls['select'].activate();
							  },
							  onCancel: function(){
								self.drawControls['polygon'].deactivate();
								self.addPolygonBtn.toggle(false);
							 }
						   });
				    }

	            },
	            scope: this
		});
		
        var actions = [
			this.addPointBtn,
			this.addLinesBtn,
			this.addPolygonBtn
		];
        return gxp.plugins.AddGeometry.superclass.addActions.apply(this, [actions]);
    },

	activateDrawing: function( controlName ){

		if ( ! this.drawControls ){
			var map = this.target.mapPanel.map;
			// create a custom layer
			var customLayer = new OpenLayers.Layer.Vector(this.customLayerDefaultName);
			customLayer.events.on({
			                'featureselected': function(feature) {
			                    console.log('selected');
			                },
			                'featureunselected': function(feature) {
			                    console.log('unselected');
			                },
							'featureadded': function(feature){
								console.log('added');
							}
			            });
			map.addLayer(customLayer);
			map.addControl(new OpenLayers.Control.LayerSwitcher());
			// prepare controls for the custom layers
			this.drawControls = {
			                point: new OpenLayers.Control.DrawFeature(
										customLayer, OpenLayers.Handler.Point
			                ),
			                line: new OpenLayers.Control.DrawFeature(
			                    customLayer, OpenLayers.Handler.Path
			                ),
			                polygon: new OpenLayers.Control.DrawFeature(
			                    customLayer, OpenLayers.Handler.Polygon
			                ),
			                select: new OpenLayers.Control.SelectFeature(
			                    customLayer,
			                    {
			                        clickout: false, toggle: false,
			                        multiple: false, hover: false,
			                        toggleKey: "ctrlKey", // ctrl key removes from selection
			                        multipleKey: "shiftKey", // shift key adds to selection
			                        box: true
			                    }
			                ),
			                selecthover: new OpenLayers.Control.SelectFeature(
			                    customLayer,
			                    {
			                        multiple: false, hover: true,
			                        toggleKey: "ctrlKey", // ctrl key removes from selection
			                        multipleKey: "shiftKey" // shift key adds to selection
			                    }
			                )
			            };


				for(var key in this.drawControls) {
			       map.addControl(this.drawControls[key]);
			    }			
		}

		this.drawControls[ controlName ].activate();	
	}


});

Ext.preg(gxp.plugins.AddGeometry.prototype.ptype, gxp.plugins.AddGeometry);
