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
		this.range = config.range;
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.Synchronizer.superclass.init.apply(this, arguments);
		
	},
	
  addActions: function() {

		var map = this.target.mapPanel.map;
		var interval;
		var tooltipInterval;
		var self = this;
		this.button = new Ext.Button({
			 id:'sync-button',
			 menuText: this.exportKMLMenuText,
	         iconCls: "gxp-icon-real-time",
	         tooltip: "Real time sync",
			 enableToggle:true,
	         toggleHandler: function(button, pressed) {

				  var timeManager = self.getTimeManager();
				  var timeToRefresh = self.timeInterval;

				  var refresh = function(){

							var layers = timeManager.layers;					

							for (var i=0; i<layers.length; i++){
								var layer = layers[i];
								if (layer.getVisibility()){
									// layer.redraw(true);
									var timeParam = self.range[0].toISOString() +'/'+ self.range[1].toISOString();
									layer.mergeNewParams({
										TIME: timeParam,
										fake: (new Date()).getTime()
									});
								}

							}	
				  };
				
				  var countDown = function(){	
					if (self.tooltip !== undefined ){
						self.tooltip.update(  timeToRefresh/1000 + ' seconds' );
					}
					
					timeToRefresh -= 1000;
					if ( timeToRefresh === 0){
						timeToRefresh = self.timeInterval;
					}
				  };
				
					if (pressed){
						timeManager.stop();
						self.tooltip = 	new Ext.ToolTip({
								        target: 'sync-button',
								        html:  timeToRefresh/1000 + ' seconds',
								        title: 'Time to refresh',
								        autoHide: false,
								        closable: true,
								        draggable:true
									});
						tooltipInterval = setInterval( countDown, 1000 );
						interval = setInterval(refresh, self.timeInterval);
					} else {
						clearInterval( interval );
						if (self.tooltip){
							self.tooltip.destroy();
							clearInterval( tooltipInterval );
						}
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