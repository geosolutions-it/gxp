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


    /** api: config[ featureSelectorTooltip]
     *  ``String``
     *  Text for feature selector tooltip (i18n).
     */
    featureSelectorTooltip: "Select a feature",

	customLayerDefaultName: "Custom layer",
  
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.FeatureSelector.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
	    
		var map = this.target.mapPanel.map;
	
		
	
		var self = this;
		this.selectFeatureBtn = new Ext.Button({
			    menuText: this.featureSelectorText,
	            iconCls: "gxp-icon-select-feature",
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: true,
	            tooltip: this.featureSelectorTooltip,
	            handler: function(button, event) {
					if(button.pressed) {
						
						var customLayer = this.getCustomLayer();
						if (customLayer){
							customLayer.events.on({
									 'featureselected': function(selected) {
															self.target.fireEvent("featureselected", self, selected.feature);
												        }
											 });	
							this.selectControl = new OpenLayers.Control.SelectFeature(
							                    customLayer,
							                    {
							                        clickout: false, toggle: false,
							                        multiple: false, hover: false,
							                        toggleKey: "ctrlKey", // ctrl key removes from selection
							                        multipleKey: "shiftKey", // shift key adds to selection
							                        box: true
							                    });
							map.addControl(this.selectControl);

							this.selectControl.activate();
						}
						

				    } else {
						this.selectControl.unselectAll();
						this.selectControl.deactivate();
					}
				},
	            scope: this
		});
	
		
        var actions = [
			this.selectFeatureBtn
		];
        return gxp.plugins.FeatureSelector.superclass.addActions.apply(this, [actions]);
    },

   	/** private: method[getCustomLayer]
      * returns the layer with custom features
     */
   getCustomLayer: function(){
	   var layers = this.target.mapPanel.map.getLayersByName(this.customLayerDefaultName);
		if (layers && layers.length > 0){
			return layers[0];
		} 
		return null;
   },

   removeFeature: function(feature){
	  var layer = this.getCustomLayer();
	  layer.removeFeatures(feature);
   },

   saveFeature: function(feature){
		this.selectControl.unselectAll();
   },
    
   discardUpdates: function(feature){
	   this.selectControl.unselectAll();
   }

});

Ext.preg(gxp.plugins.FeatureSelector.prototype.ptype, gxp.plugins.FeatureSelector);
