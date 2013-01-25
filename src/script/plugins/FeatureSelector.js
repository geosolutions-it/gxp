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

    /**
     *  prefix to identify events risen by an instance of the Feature Selector
     *  default is empty
     */
    prefix: '',
    
    /** api: config[featureSelectorText]
     *  ``String``
     *  Text for feature selector item (i18n).
     */
    featureSelectorText: "Select",

    deleteFeatureText: "Delete",

    dragFeatureText: "Drag",

    rotateFeatureText: "Rotate",

	newSelection: false,
	
	undo:false,
	
	alternativeStyle: false,


    /** api: config[ featureSelectorTooltip]
     *  ``String``
     *  Text for feature selector tooltip (i18n).
     */
    featureSelectorTooltip: "Select and edit feature",

	
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.FeatureSelector.superclass.constructor.apply(this, arguments);
		// this.layer = config.layer;
		this.toggleGroup = config.toggleGroup;
		this.layerName = config.layerName;
		this.alternativeStyle = config.alternativeStyle || false;
		this.srs = config.srs || "EPSG:4326";
    },

    /** api: method[addActions]
     */
    addActions: function() {
	
	    
		   
		var self = this;
		var map = this.target.mapPanel.map;
		
		this.selectButton = new Ext.Button({
                // text: this.featureSelectorText,
                iconCls: "gxp-icon-select-feature",
                toggleGroup: this.toggleGroup,
                group: this.toggleGroup,
				disabled: true,
				tooltip: 'Select',
				enableToggle: true,
				toggleHandler: function(button, pressed){
					if (! pressed ){
						this.newSelection = false;
						this.modifyControl.deactivate();
						this.selectorControl.unselectAll();
						this.selectorControl.deactivate();
						// this.onUnselected(self);	
						// this.deleteButton.disable();
						this.newSelection = false;
					} else {
						if(this.vheicleSelector){
							this.vheicleSelector.grid.deactivate();
						}
						this.modifyControl.activate();
						this.selectorControl.activate();
					} 
				},
				scope:this

		});

		/*this.deleteButton = new Ext.Button({
			 // text: this.deleteFeatureText,
             iconCls: "gxp-icon-delete-feature",
             toggleGroup: this.toggleGroup,
             group: this.toggleGroup,		
		     disabled:true,
			 tooltip: 'Delete',
			 enableToggle: true,
			 toggleHandler: function(button, pressed){
					if (! pressed ){
						this.newSelection = false;
						this.deleteControl.deactivate();
						this.modifyControl.deactivate();
						this.selectorControl.unselectAll();
						this.onUnselected(self);	
					} else {
						this.deleteControl.activate();

					}
			 },
			scope:this
		});*/
		
		
		// when map is created and layers are loaded
		this.target.on('ready', function(){
			
				this.layer = this.createLayer( this.target.mapPanel.map);
				this.selectorControl = this.createSelectorControl();
				this.selectorControl.name = 'PilotNotes:SelectFeature';
				this.modifyControl = this.createModifyControl( OpenLayers.Control.ModifyFeature.DRAG | OpenLayers.Control.ModifyFeature.ROTATE);
				this.modifyControl.name = 'PilotNotes:ModifyFeature';
				this.deleteControl = this.createDeleteControl( );

				map.addControl(this.modifyControl);
				map.addControl( this.selectorControl );
				map.addControl(this.deleteControl);

				for(var tool in this.target.tools){
					if(this.target.tools[tool].ptype == "gxp_vehicle_selector"){
						this.vheicleSelector = this.target.tools[tool];
					}
				}

		}, this);    

        var actions = [
			this.selectButton 
		];
        return gxp.plugins.FeatureSelector.superclass.addActions.apply(this, [actions]);
    },

    /**
     *  create a custom layer or it returns an existing one
     *  TODO externalize this method because it is the same for many classes
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

	createModifyControl: function(mode){
		var self = this;
		return new OpenLayers.Control.ModifyFeature(
			this.layer,
			{
				 clickout:false, 	toggle: false,
                 multiple: false, hover: false,
                 toggleKey: "ctrlKey", // ctrl key removes from selection
                 multipleKey: "shiftKey", // shift key adds to selection
                 box: true,
				 // standalone:true,
				 mode: mode }
		);
	},

	createSelectorControl: function(){
		var self = this;
		this.layer.events.on(
					{
					'featureadded': function(feature){
						self.selectButton.enable();
					},
					'featureselected': function(selected) {
							
							
							if ( selected.feature.isNew === undefined ){
								selected.feature.isNew = true;
							} else {
								selected.feature.isNew = false;
							}
							
							// a feature can be selected also by mouse selection
							if (!self.selectButton.pressed)
								self.selectButton.toggle();
							
							if (self.layer.selectedFeatures.length === 1 ){
								
								// self.modifyControl.selectFeature(selected.feature);
								
								
									if ( self.newSelection ){
										self.onSave( self, selected.feature );
									} else {
										self.newSelection = true;
										self.onSelected(self, selected.feature);
									}								
								
							} else if (self.layer.selectedFeatures.length > 1 ) {
								// disable modify control for selected features
								for (var i=0; i< self.layer.selectedFeatures.length; i++){
									var feature = self.layer.selectedFeatures[i];
									self.modifyControl.unselectFeature(feature);
								}
								// disable note panel
								// self.onUnselected(self);
								self.onMultiSelected(self, selected.feature);
								
							}
							
							
						

						
					  },
					
					   'featuresremoved': function( features ){
							if ( self.layer.features.length <= 0 ){
								self.selectButton.toggle( false );
								self.selectButton.disable();
							}
						},

						'featureunselected': function(unselected){
							self.modifyControl.unselectFeature(unselected.feature);
							self.onUnselected(self, unselected.feature);
						},
						
						'featureremoved': function(deleted){
							self.newSelection = false;
							self.modifyControl.unselectFeature(deleted.feature);
							if ( self.layer.features.length <= 0 ){
								self.selectButton.toggle(false);
								self.selectorControl.deactivate();
								self.selectButton.disable();
								
							}
							// self.onUnselected(self, deleted.feature);
							self.onRemoved(self, deleted.feature);
						},

						
						// drag events
						'featuremodified': function(selected){
							self.onChanged(self, selected.feature);
						}
					 });	
		var control = selectControl = new OpenLayers.Control.SelectFeature(
			                    this.layer,
			                    {
			                        clickout: false, toggle: false,
			                        multiple:  false, hover: false,
			                        toggleKey: "ctrlKey", // ctrl key removes from selection
			                        multipleKey: "shiftKey", // shift key adds to selection
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
		this.newSelection = false;
		// this.button.toggle();
		this.modifyControl.deactivate();
		this.selectorControl.unselectAll();
   },
    
   discardUpdates: function(feature){
	   this.newSelection = false;
	   // this.button.toggle();
	   this.modifyControl.deactivate();
	   this.selectorControl.unselectAll();
   },
	
	onMultiSelected: function( target, feature ){
		Ext.getCmp('vselector').deactivate();
        this.target.fireEvent( this.prefix + "multiselected", target, feature);
    },
	
    onSelected: function( target, feature ){
		//Ext.getCmp('vselector').deactivate();
        this.target.fireEvent( this.prefix + "selected", target, feature);
    },
    onUnselected: function( target, feature ){
        this.target.fireEvent( this.prefix + "unselected", target, feature);
    },
	onSave: function( target, feature ){
        this.target.fireEvent( this.prefix + "saved", target, feature);
    },
	onChanged: function(target, feature){
		this.target.fireEvent( this.prefix + "changed", target, feature);
	},
	onRemoved: function(target, feature){
		 this.target.fireEvent( this.prefix + "removed", target, feature);
	}

});

Ext.preg(gxp.plugins.FeatureSelector.prototype.ptype, gxp.plugins.FeatureSelector);
