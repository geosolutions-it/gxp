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
 *  .. class:: FeatureSelector(config)
 *
 *    tools to select a feature.
 */
gxp.plugins.FeatureSelector = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_pilot_notes */
    ptype: "gxp_feature_selector",
    
    /** api: config[featureSelectorText]
     *  ``String``
     *  Text for feature selector item (i18n).
     */
    featureSelectorText: "Select",

    deleteFeatureText: "Delete",

    dragFeatureText: "Drag",

    rotateFeatureText: "Rotate",


    /** api: config[ featureSelectorTooltip]
     *  ``String``
     *  Text for feature selector tooltip (i18n).
     */
    featureSelectorTooltip: "Select and edit feature",

	
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.FeatureSelector.superclass.constructor.apply(this, arguments);
		this.layer = config.layer;
		this.onSelected = config.onSelected;
		this.onUnselected = config.onUnselected;
    },

    /** api: method[addActions]
     */
    addActions: function() {
	    
		var map = this.target.mapPanel.map;
		var self = this;
		this.selectorControl = this.createSelectorControl();
		this.modifyControl = this.createModifyControl(OpenLayers.Control.ModifyFeature.DRAG | OpenLayers.Control.ModifyFeature.ROTATE);
	
		 this.activeIndex = 0;
	        this.button = new Ext.SplitButton({
	            iconCls: "gxp-icon-select-feature",
	            tooltip: this.featureSelectorTooltip,
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
	                            i.setChecked(false);
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
	                            text: this.featureSelectorText,
	                            iconCls: "gxp-icon-select-feature",
	                            toggleGroup: this.toggleGroup,
	                            group: this.toggleGroup,
	                            listeners: {
	                                checkchange: function(item, checked) {
	                                    this.activeIndex = 0;
	                                    this.button.toggle(checked);
	                                    if (checked) {
	                                        this.button.setIconClass(item.iconCls);
	                                    } else {	
											this.selectorControl.unselectAll();
											this.onUnselected(self);
										}
	                                },
	                                scope: this
	                            },
	                            map: this.target.mapPanel.map,
	                            // control: this.selectorControl
								control: this.modifyControl
	                        })
						)/*, new Ext.menu.CheckItem(
			                        new GeoExt.Action({
			                            text: this.dragFeatureText,
			                            iconCls: "gxp-icon-drag-feature",
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
			                            control: this.createModifyControl(OpenLayers.Control.ModifyFeature.DRAG | OpenLayers.Control.ModifyFeature.ROTATE)
			                        })
						 ), new Ext.menu.CheckItem(
						            new GeoExt.Action({
						                 text: this.rotateFeatureText,
						                 iconCls: "gxp-icon-rotate-feature",
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
						                control: this.createModifyControl(OpenLayers.Control.ModifyFeature.ROTATE)
						            })
						)*/, new Ext.menu.CheckItem(
			                        new GeoExt.Action({
			                            text: this.deleteFeatureText,
			                            iconCls: "gxp-icon-delete-feature",
			                            toggleGroup: this.toggleGroup,
			                            group: this.toggleGroup,
			                            listeners: {
			                                checkchange: function(item, checked) {
			                                    this.activeIndex = 3;
			                                    this.button.toggle(checked);
			                                    if (checked) {
			                                        this.button.setIconClass(item.iconCls);
			                                    }
			                                },
			                                scope: this
			                            },
			                            map: this.target.mapPanel.map,
			                            control: this.createDeleteControl( )
			                        })
	                        )							 
	                ]
	            })
	        });		
	
	
		
        var actions = [
			this.button
		];
        return gxp.plugins.FeatureSelector.superclass.addActions.apply(this, [actions]);
    },

	createModifyControl: function(mode){
		var self = this;
		return new OpenLayers.Control.ModifyFeature(
			this.layer,
			{ mode: mode }
		);
	},

	createSelectorControl: function(){
		var self = this;
		this.layer.events.on(
					{
					 'featureselected': function(selected) {
							// self.target.fireEvent("featureselected", self, selected.feature);
							self.onSelected(self, selected.feature);
						}
					 });	
		var control = selectControl = new OpenLayers.Control.SelectFeature(
			                    this.layer,
			                    {
			                        clickout: false, toggle: false,
			                        multiple: false, hover: false,
			                        toggleKey: "ctrlKey", // ctrl key removes from selection
			                        // multipleKey: "shiftKey", // shift key adds to selection
			                        box: true
			                    });
	   return control;
	},
	
	createDeleteControl: function(){

		// from http://www.peterrobins.co.uk/it/oledit.html
		var DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
		    initialize: function(layer, options) {
		        OpenLayers.Control.prototype.initialize.apply(this, [options]);
		        this.layer = layer;
		        this.handler = new OpenLayers.Handler.Feature(
		            this, layer, {click: this.clickFeature}
		        );
		    },
		    clickFeature: function(feature) {
		        // if feature doesn't have a fid, destroy it
		        if(feature.fid == undefined) {
		            this.layer.destroyFeatures([feature]);
		        } else {
		            feature.state = OpenLayers.State.DELETE;
		            this.layer.events.triggerEvent("afterfeaturemodified", {feature: feature});
		            feature.renderIntent = "select";
		            this.layer.drawFeature(feature);
		        }
		    },
		    setMap: function(map) {
		        this.handler.setMap(map);
		        OpenLayers.Control.prototype.setMap.apply(this, arguments);
		    },
		    CLASS_NAME: "OpenLayers.Control.DeleteFeature"
		})		
		
		return new DeleteFeature(this.layer);
		
	},

   	/** private: method[getCustomLayer]
      * returns the layer with custom features
     */
   getCustomLayer: function(){
	   return this.layer;
   },

   saveFeature: function(feature){
		this.button.toggle();
		this.modifyControl.deactivate();
		this.selectorControl.unselectAll();
   },
    
   discardUpdates: function(feature){
		this.button.toggle();
	   this.modifyControl.deactivate();
	   this.selectorControl.unselectAll();
   }

});

Ext.preg(gxp.plugins.FeatureSelector.prototype.ptype, gxp.plugins.FeatureSelector);
