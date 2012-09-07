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

	startTime: null,
	endTime: null,
	timeInterval:null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Synchronizer.superclass.constructor.apply(this, arguments);
		this.timeInterval = config.refreshTimeInterval;
		this.range = config.range;
		this.startTime = this.range[0];
		this.endTime = this.range[1];
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

	/*	this.syncButton = new Ext.Button({
				 id:'sync-button',
				 text: 'Sync',
		         iconCls: "gxp-icon-real-time",
		         tooltip: "Real time sync",
				 enableToggle:true,
		         toggleHandler: function(button, pressed) {

						if (pressed){

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
							if (self.tooltip && self.tooltip.getEl()){
								self.tooltip.update(  'next refresh in ' +timeToRefresh/1000 + ' secs' );
							}

							timeToRefresh -= 1000;
							if ( timeToRefresh === 0){
								timeToRefresh = self.timeInterval;
							}
						  };

							timeManager.stop();
							self.tooltip = 	new Ext.ToolTip({
									        target: 'sync-button',
									        html:  timeToRefresh/1000 + ' seconds',
									        title: 'Working interval: ' + Ext.util.Format.date(self.range[0], "d/m/Y") + ' to ' 
														+ Ext.util.Format.date(self.range[1], "d/m/Y" ),
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

			this.configurationButton = new Ext.Button({
			         iconCls: "gxp-icon-sync-configuration",
					 text:'Settings',
			         tooltip: "Config real time sync",
					 handler: function(){},
					 scope: this
					});*/

		this.activeIndex = 0;
		this.button = new Ext.SplitButton({
				id:"sync-button",
	            iconCls: "gxp-icon-real-time",
	            tooltip: "Real time sync",
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
	    					{
								text: 'Sync',
		                        iconCls: "gxp-icon-real-time",
		                        toggleGroup: this.toggleGroup,
		                        group: this.toggleGroup,
								listeners: {
	                                checkchange: function(item, checked) {
	                                    this.activeIndex = 0;
	                                    this.button.toggle(checked);
	                                    if (checked) {
	                                        this.button.setIconClass(item.iconCls);
	
												  var timeManager = self.getTimeManager();
												  var timeToRefresh = self.timeInterval;

												  var refresh = function(){

															var layers = timeManager.layers;					

															for (var i=0; i<layers.length; i++){
																var layer = layers[i];
																if (layer.getVisibility()){
																	// layer.redraw(true);
																	var timeParam = self.startTime.toISOString() +'/'+ self.endTime.toISOString();
																	layer.mergeNewParams({
																		TIME: timeParam,
																		fake: (new Date()).getTime()
																	});
																}

															}	
												  };

												  var countDown = function(){	
													if (self.tooltip && self.tooltip.getEl()){
														self.tooltip.update(  'next refresh in ' +timeToRefresh/1000 + ' secs' );
													}

													timeToRefresh -= 1000;
													if ( timeToRefresh === 0){
														timeToRefresh = self.timeInterval;
													}
												  };

													timeManager.stop();
													self.tooltip = 	new Ext.ToolTip({
															        target: 'sync-button',
															        html:  timeToRefresh/1000 + ' seconds',
															        title: 'Working interval: ' + Ext.util.Format.date(self.range[0], "d/m/Y") + ' to ' 
																				+ Ext.util.Format.date(self.range[1], "d/m/Y" ),
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
	                                },
	                                scope: this
	                            },
								scope:this
							}
						),
						{
								text: 'Settings',
		                        iconCls: "gxp-icon-sync-configuration",
		                        toggleGroup: this.toggleGroup,
		                        group: this.toggleGroup,
		                        handler: function(){
								
										// open modal window
										var win = new Ext.Window({
											   closable:true,
												   title: 'Synchronization settings',
												   iconCls: "gxp-icon-sync-configuration",
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
														id:"start-datefield",
											            xtype: "datefield",
											            fieldLabel: 'Start time',
														allowBlank:false,
														editable: false,
														maxValue: self.range[1],
														minValue: self.range[0],
														format:"d/m/Y",
														value:Ext.util.Format.date(self.startTime, "d/m/Y"),
														width:5
											        },{  
														id:"end-datefield",
														xtype:'datefield',
														fieldLabel: 'End time',
														allowBlank:false,
														editable: false,
														maxValue: self.range[1],
														minValue: self.range[0],
														format:"d/m/Y",
														value:Ext.util.Format.date(self.endTime, "d/m/Y"),
														width:5
													 },{  
														id:"interval-numberfield",
														xtype:'numberfield',
														fieldLabel: 'Refresh interval (5-60 secs)',
														allowDecimals:false,
														width:5,
														maxValue:60,
														minValue:5,
														value:self.timeInterval/1000,
														allowBlank:false
													 }
											        ],
													buttons: [{
											            text: 'Save',
											            formBind: true,
											            handler: function(){
															var startTimeField = Ext.getCmp("start-datefield");
															var endTimeField = Ext.getCmp("end-datefield"); 
															var intervalField = Ext.getCmp("interval-numberfield"); 
															if (startTimeField.isValid(false) && endTimeField.isValid(true) && intervalField.isValid(true)){	
																self.startTime = startTimeField.getValue();
																self.endTime = endTimeField.getValue();
																self.timeInterval = intervalField.getValue() * 1000;
																win.destroy();
															} else {
																Ext.Msg.show({
													                   title: 'Cannot update sync configuration',
													                   msg: 'Invalid values.',
													                   buttons: Ext.Msg.OK,
													                   icon: Ext.MessageBox.ERROR
													                });						
															}
														}
													}]	
												}) ]
											});
										win.show();			
								
								
								},
								scope:this		
						}	
	                ]
	            })
	        });
		
	
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