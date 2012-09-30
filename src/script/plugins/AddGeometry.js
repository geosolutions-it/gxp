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

    addPointFromCoordsMenuText: "Add Point from coordinates",
    addPointFromCoordsTooltip: "Add Point from coordinates",


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

    clearAllMenuText: "Delete all",

	customLayerDefaultName: "Custom layer",
  
	alternativeStyle: false,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.AddGeometry.superclass.constructor.apply(this, arguments);
		// this.layer = config.layer;
		this.alternativeStyle = config.alternativeStyle || false;
		this.srs = config.srs || "EPSG:4326";
    },

   /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config){
		  this.activeIndex = 0;
	       this.button = new Ext.SplitButton({
	            iconCls: "gxp-icon-add-point",
	            tooltip: this.addPointTooltip,
	            enableToggle: true,
	            toggleGroup: this.toggleGroup,
	            allowDepress: true,
	            handler: function(button, event) {
	                if(button.pressed) {
	                    button.menu.items.itemAt(this.activeIndex).setChecked(true);
	                }
	            },
	            scope: this,
	            listeners: {
	                toggle: function(button, pressed) {
	                    // toggleGroup should handle this
	                    if(!pressed) {
	                        button.menu.items.each(function(i) {
								if (i.setChecked){
									i.setChecked(false);
								}

	                        });
	                    }
	                },
	                render: function(button) {
	                    // toggleGroup should handle this
	                    Ext.ButtonToggleMgr.register(button);
	                }
	            },
	            menu: new Ext.menu.Menu({
	                items: [
	                    new Ext.menu.CheckItem(
	                        new GeoExt.Action({
	                            text: this.addPointMenuText,
	                            iconCls: "gxp-icon-add-point",
	                            toggleGroup: this.toggleGroup,
	                            group: this.toggleGroup,
	                            listeners: {
	                                checkchange: function(item, checked) {
									//	map.addLayer( layer );
	                                    this.activeIndex = 0;
	                                    this.button.toggle(checked);
	                                    if (checked) {
	                                        this.button.setIconClass(item.iconCls);
	                                    }
	                                },
	                                scope: this
	                            },
	                            map: this.target.mapPanel.map,
	                            control: this.createDrawControl(
	                                OpenLayers.Handler.Point, this.addPointMenuTooltip
	                            )
	                        })
	                    ),
	                    new Ext.menu.CheckItem(
	                        new GeoExt.Action({
	                            text: this.addLinesMenuText,
	                            iconCls: "gxp-icon-add-lines",
	                            toggleGroup: this.toggleGroup,
	                            group: this.toggleGroup,
	                            listeners: {
	                                checkchange: function(item, checked) {
	                                    this.activeIndex = 1;
	                                    this.button.toggle(checked);
	                                    if (checked) {
	                                        this.button.setIconClass(item.iconCls);

	                                    }
	                                },
	                                scope: this
	                            },
	                            map: this.target.mapPanel.map,
	                            control: this.createDrawControl(
	                                OpenLayers.Handler.Path, this.addLinesMenuTooltip
	                            )
	                        })
	                    ),
						new Ext.menu.CheckItem(
	                        new GeoExt.Action({
	                            text: this.addPolygonMenuText,
	                            iconCls: "gxp-icon-add-polygon",
	                            toggleGroup: this.toggleGroup,
	                            group: this.toggleGroup,
	                            listeners: {
	                                checkchange: function(item, checked) {
	                                    this.activeIndex = 2;
	                                    this.button.toggle(checked);
	                                    if (checked) {
	                                        this.button.setIconClass(item.iconCls);
	                                    }
	                                },
	                                scope: this
	                            },
	                            map: this.target.mapPanel.map,
	                            control: this.createDrawControl(
	                                OpenLayers.Handler.Polygon, this.addPolygonMenuTooltip
	                            )
	                        })
	                    ),{
							text: this.addPointFromCoordsMenuText,
	                        iconCls: "gxp-icon-add-point-from-coords",
	                        toggleGroup: this.toggleGroup,
	                        group: this.toggleGroup,
	                        handler:this.handleAddPointFromCoords,
							scope:this	
						}
	                ]
	            })
	        });

			 this.deleteButton = new Ext.SplitButton({
		            iconCls: "gxp-icon-removeall",
		            tooltip: this.addPointTooltip,
		            enableToggle: true,
		            toggleGroup: this.toggleGroup,
		            allowDepress: true,
		            handler: function(button, event) {
		                if(button.pressed) {
		                    button.menu.items.itemAt(this.activeIndex).setChecked(true);
		                }
		            },
		            scope: this,
		            listeners: {
		                toggle: function(button, pressed) {
		                    // toggleGroup should handle this
		                    if(!pressed) {
		                        button.menu.items.each(function(i) {
									if (i.setChecked){
										i.setChecked(false);
									}

		                        });
		                    }
		                },
		                render: function(button) {
		                    // toggleGroup should handle this
		                    Ext.ButtonToggleMgr.register(button);
		                }
		            },
		            menu: new Ext.menu.Menu({
		                items: [
		                  {
		                            text: this.clearAllMenuText,
		                            iconCls: "gxp-icon-removeall",
		                            toggleGroup: this.toggleGroup,
		                            group: this.toggleGroup,
									handler:this.handleRemoveFeatures,
									scope:this
		                  },
		                  {
		                            text: 'Delete all selected',
		                            iconCls: "gxp-icon-delete-feature",
		                            toggleGroup: this.toggleGroup,
		                            group: this.toggleGroup,
									handler:this.handleRemoveSelectedFeatures,
									scope:this
		                   }      
		                ]
		            })
		        });

			var actions = [
				this.button,
				this.deleteButton
			];


	        return gxp.plugins.AddGeometry.superclass.addActions.apply(this, [actions]);	
	
	},


    /** api: method[addActions]
     */
    addActions: function() {
	
		this.target.on('ready', function(){
				this.layer = this.createLayer( this.target.mapPanel.map );
				this.addOutput();
		}, this);	   
	
     
    },

    /**
     *  create a custom layer or it returns an existing one
     */
    createLayer: function( map ){
		var layers = map.getLayersByName( this.layerName );
		if ( layers.length > 0 ){
			return layers[0]; // return the first layer with the given name
		} else {
			var layer;
			if ( this.alternativeStyle ){
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs), 
					styleMap: new OpenLayers.StyleMap({
						"default": new OpenLayers.Style({
							strokeColor: "red",
							strokeOpacity: .7,
							strokeWidth: 2,
							fillColor: "red",
							fillOpacity: 0,
							cursor: "pointer"
						}),
						"temporary": new OpenLayers.Style({
							strokeColor: "#ffff33",
							strokeOpacity: .9,
							strokeWidth: 2,
							fillColor: "#ffff33",
							fillOpacity: .3,
							cursor: "pointer"
						}),
						"select": new OpenLayers.Style({
							strokeColor: "#0033ff",
							strokeOpacity: .7,
							strokeWidth: 3,
							fillColor: "#0033ff",
							fillOpacity: 0,
							graphicZIndex: 2,
							cursor: "pointer"
						})
					})
				});				
			} else {
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs)
				});	
			}

			map.addLayer( layer );
			return layer;
		}
	},

    handleRemoveSelectedFeatures: function(){
	
		if ( !this.layer.selectedFeatures || this.layer.selectedFeatures.length == 0){
				Ext.Msg.show({
		               title: 'Clear all',
		               msg: 'No selected feature.',
		               buttons: Ext.Msg.OK,
		               icon: Ext.MessageBox.WARNING
		        });
		} else {
			var self = this;
			Ext.MessageBox.show({
			           title:'Clear all selected',
			           msg: 'You are removing all your changes and this operation cannot be undone. <br />Would you like to remove your changes?',
			           buttons: Ext.MessageBox.YESNO,
			           fn: function(btn){
							if ( btn === 'yes' ){
								self.layer.removeFeatures( self.layer.selectedFeatures );
							}
							
					   },
			           icon: Ext.MessageBox.QUESTION
			       });
		}
		
		
	},

    handleRemoveFeatures: function(){
		if ( !this.layer.features || this.layer.features.length == 0){
				Ext.Msg.show({
		               title: 'Clear all',
		               msg: 'No feature to be removed.',
		               buttons: Ext.Msg.OK,
		               icon: Ext.MessageBox.WARNING
		        });
		} else {
			var self = this;
			Ext.MessageBox.show({
			           title:'Clear all',
			           msg: 'You are removing all your changes and this operation cannot be undone. <br />Would you like to remove your changes?',
			           buttons: Ext.MessageBox.YESNO,
			           fn: function(btn){
							if ( btn === 'yes' ){
								self.layer.removeAllFeatures();
							}
							
					   },
			           icon: Ext.MessageBox.QUESTION
			       });
		}
		
		
	},
	
	handleAddPointFromCoords: function(){
		var map = this.target.mapPanel.map;
		var layer = this.layer;
		var form = new Ext.FormPanel({
			width: 500,
			frame: true,
		    autoHeight: true,
			bodyStyle: 'padding: 10px 10px 0 10px;',
			labelWidth: 50,
			defaults: {
			     anchor: '95%',
			     allowBlank: false,
			     msgTarget: 'side'
			},
			items:[{
	            xtype: "textfield",
	            fieldLabel: 'Latitude',
				decimalPrecision: 15,
				width:200,
				maxValue:90,
				minValue:-90,
				allowBlank:false,
				id:"lat-input-field"
	        },{  
				xtype:'textfield',
				fieldLabel: 'Longitude',
				decimalPrecision: 15,
				width:200,
				maxValue:180,
				minValue:-180,
				allowBlank:false,
				id:"lng-input-field"
			 }
	        ],
			buttons: [{
	            text: 'Add point',
	            handler: function(){
					var latField = Ext.getCmp("lat-input-field");
					var lngField = Ext.getCmp("lng-input-field"); 
					if (latField.isValid(false) && lngField.isValid(true)){
						var point = new OpenLayers.Geometry.Point(latField.getValue(), lngField.getValue());
						// point = point.transform( new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
						var feature = new OpenLayers.Feature.Vector( point );
						layer.addFeatures(feature);
					} else {
						Ext.Msg.show({
			                   title: 'Cannot create this point',
			                   msg: 'Invalid coordinates.',
			                   buttons: Ext.Msg.OK,
			                   icon: Ext.MessageBox.ERROR
			                });						
					}
				}}]	
		});
		// open modal window
		var win = new Ext.Window({
			       closable:true,
				   title: 'Add point from coordinates',
				   iconCls: "gxp-icon-add-point-from-coords",
				   border:false,
				   modal: true, 
				   bodyBorder: false,
				   width: 500,
                   // height: 200,
                   resizable: false,
			       items: [ new Ext.FormPanel({
					frame: true,
					border:false,
				    autoHeight: true,
					bodyStyle: 'padding: 10px 10px 0 10px;',
					defaults: {
					     anchor: '95%',
					     allowBlank: false,
					     msgTarget: 'side'
					},
					items:[{
			            xtype: "textfield",
			            fieldLabel: 'Latitude',
						width:5,
						decimalPrecision: 15,
						maxValue:90,
						minValue:-90,
						allowBlank:false,
						id:"lat-input-field"
			        },{  
						xtype:'textfield',
						fieldLabel: 'Longitude',
						width:5,
						decimalPrecision: 15,
						maxValue:180,
						minValue:-180,
						allowBlank:false,
						id:"lng-input-field"
					 }
			        ],
					buttons: [{
			            text: 'Add point',
			            formBind: true,
			            handler: function(){
							var latField = Ext.getCmp("lat-input-field");
							var lngField = Ext.getCmp("lng-input-field"); 
							if (latField.isValid(false) && lngField.isValid(true)){
								var point = new OpenLayers.Geometry.Point(latField.getValue(), lngField.getValue());
								// point = point.transform( new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
								var feature = new OpenLayers.Feature.Vector( point );
								layer.addFeatures(feature);
								win.destroy();
							} else {
								Ext.Msg.show({
					                   title: 'Cannot create this point',
					                   msg: 'Invalid coordinates.',
					                   buttons: Ext.Msg.OK,
					                   icon: Ext.MessageBox.ERROR
					                });						
							}
						}}]	
				}) ]
			});
		win.show();
	},

	createDrawControl: function(handler, tooltip){
		var control = new OpenLayers.Control.DrawFeature(this.layer, handler);
		return control;
	}

	/* activateDrawing: function( controlName ){

		if ( ! this.drawControls ){
			var map = this.target.mapPanel.map;
			// create a custom layer
			var customLayer = new OpenLayers.Layer.Vector(this.customLayerDefaultName);
			map.addLayer(customLayer);
			// map.addControl(new OpenLayers.Control.LayerSwitcher());
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
			                )
			            };


				for(var key in this.drawControls) {
			       map.addControl(this.drawControls[key]);
			    }			
		}

		this.drawControls[ controlName ].activate();	
	} */


});

Ext.preg(gxp.plugins.AddGeometry.prototype.ptype, gxp.plugins.AddGeometry);
