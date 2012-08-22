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
 *  class = Synchronizer
 */

/** api: (extends)
 *  plugins/Synchronizer.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Synchronizer(config)
 *
 *    update the content of layers and the status of the time slider dynamically.
 */
gxp.plugins.Synchronizer = Ext.extend(gxp.plugins.Tool, {
    
	/** api: ptype = gxp_synchronizer */
    ptype: "gxp_synchronizer",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Synchronizer.superclass.constructor.apply(this, arguments);
		this.timeInterval = config.refreshTimeInterval;
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.Synchronizer.superclass.init.apply(this, arguments);
		// get the timemanager when the portal is ready
		/*var self = this;
		this.target.on(
			'portalready',
			function(){
				 var timeManagers = self.target.mapPanel.map.getControlsByClass('OpenLayers.Control.TimeManager');
				 if (timeManagers.length <= 0){
					console.error('Cannot init Synchronizer: no TimeManager found');
					return;
				  }
				  self.timeManager = timeManagers[0];
				  // listen to play events
				  self.timeManager.events.register('play', self, function(){ console.log('play');});

		}, this);*/
		
		
	},
	
  addActions: function() {

		var map = this.target.mapPanel.map;
		var interval;
		var self = this;
		this.button = new Ext.Button({
			 menuText: this.exportKMLMenuText,
	         iconCls: "gxp-icon-real-time",
	         tooltip: "Real time sync",
			 enableToggle:true,
	         toggleHandler: function(button, pressed) {

				  var timeManager = self.getTimeManager();

				  var refresh = function(){

							var layers = timeManager.layers;					

							for (var i=0; i<layers.length; i++){
								var layer = layers[i];
								if (layer.getVisibility()){
									layer.redraw(true);
								}

							}	
				  };
					if (pressed){
						timeManager.stop();
						interval = setInterval(refresh, self.timeInterval);

					} else {
						clearInterval( interval );

					}			
			 }, scope:this});
			
        var actions = [
			this.button
        ];
        return gxp.plugins.Synchronizer.superclass.addActions.apply(this, [actions]);
    },

    getTimeManager: function(){
	    if ( ! this.timeManager ){ // if it is not initialized
			var timeManagers = this.target.mapPanel.map.getControlsByClass('OpenLayers.Control.TimeManager');
			if (timeManagers.length <= 0){
				console.error('Cannot init Synchronizer: no TimeManager found');
				return;
			}
			this.timeManager = timeManagers[0];
			var self = this;
			// listen to play events
			this.timeManager.events.register('play', this, 
					function(){ 
						if (self.button.pressed){
							self.button.toggle();
						}
					});		
	    }
		return this.timeManager;
    }


	


});

Ext.preg(gxp.plugins.Synchronizer.prototype.ptype, gxp.plugins.Synchronizer);