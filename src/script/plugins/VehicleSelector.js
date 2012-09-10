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
	
    data: null,
	
	refreshIconPath: '../theme/app/img/silk/arrow_refresh.png',  

	geoserverBaseURL: null,
	
	gliderPropertyName: null,
	
	cruisePropertyName: null,
	
	glidersFeatureType: null,
	
	glidersPrefix: null,
	
	wfsVersion: '1.1.0',
	
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
	
		if(!this.data)
			this.data = this.target.vehicleSelector.data;
		if(!this.refreshIconPath)
			this.refreshIconPath = this.target.vehicleSelector.refreshIconPath;
		if(!this.geoserverBaseURL)
			this.geoserverBaseURL = this.target.vehicleSelector.geoserverBaseURL;
		if(!this.gliderPropertyName)
			this.gliderPropertyName = this.target.vehicleSelector.gliderPropertyName;
		if(!this.cruisePropertyName)
			this.cruisePropertyName = this.target.vehicleSelector.cruisePropertyName;
		if(!this.glidersFeatureType)
			this.glidersFeatureType = this.target.vehicleSelector.glidersFeatureType;
		if(!this.glidersPrefix)
			this.glidersPrefix = this.target.vehicleSelector.glidersPrefix;
		if(!this.wfsVersion)
			this.wfsVersion = this.target.vehicleSelector.wfsVersion;
			
		var reader = new Ext.data.ArrayReader({}, [
		       {name: 'selected', type: 'bool'},
			   {name: 'vehicle', type: 'string'},
			   {name: 'style', type: 'string'},
               {name: 'availability', type: 'bool'}			   
		]);
		
		/**
		 * Custom function used for column renderer
		 * @param {Object} val
		 */
		function setStyle(val) {
			if (val) {
				return '<span style="color:' + val + ';"><img height=30px src="' + val + '"></img></span>';
			}			
			return val;
		}
	
	    var xg = Ext.grid;
		this.grid = new xg.GridPanel({
		    border: false,
			store: new Ext.data.Store({
				reader: reader,
				data: this.data
			}),
			listeners: {
			    scope: this, 
				afterrender: function(g){	
					this.refreshRecords();	
				}
			},
			cm: new xg.ColumnModel({
				columns: [
					{
						xtype: 'checkcolumn',
						header: '',
						dataIndex: 'selected',
						width: 20,
						listeners:{
						    scope: this, 
							click: function(col, gpanel, rowIndex, evt){
								this.refreshLayers(col, rowIndex);
							}
						}
					},
					{
						id       : 'vehicle',
						header   : 'Vehicle', 
						width    : 50, 
						sortable : false, 
						dataIndex: 'vehicle'
					},
					{
						header   : 'Style', 
						width    : 50,						
						renderer : setStyle,
						sortable : false, 
						dataIndex: 'style'
					},
					{
						header   : 'Availability', 
						width    : 50,						
						sortable : false, 
						dataIndex: 'availability',
						hidden: true
					},
					{
						xtype: 'actioncolumn',
						sortable : false, 
						width: 30,
						id: 'av_icon',
						items: [{
							tooltip: 'Availability'
						}, {
							getClass: function(v, meta, rec) {    					
								if (rec.get('availability')) {
									this.items[1].tooltip = 'Vehicle Available';
									return 'available-col';
								} else {
									this.items[1].tooltip = 'Vehicle Not Available';
									return 'not-available-col';
								}
							}
						}]
					},
					{
						xtype: 'actioncolumn',
						sortable : false, 
						width: 30,
						items: [{
							icon   : this.refreshIconPath,  
							tooltip: 'Refresh',
							scope: this,
							handler: function(gpanel, rowIndex, colIndex) {
							    var store = gpanel.getStore();		
								var record = store.getAt(rowIndex);
								
								var vehicle = record.get("vehicle");
								
								var filter = new OpenLayers.Filter.Logical({
									type: OpenLayers.Filter.Logical.AND,
									filters: [
										new OpenLayers.Filter.Comparison({
											type: OpenLayers.Filter.Comparison.EQUAL_TO,
											property: this.gliderPropertyName,
											value: vehicle
										}),
										new OpenLayers.Filter.Comparison({
											type: OpenLayers.Filter.Comparison.EQUAL_TO,
											property: this.cruisePropertyName,
											value: this.target.cruiseName
										})
									]
								});
								
     							var protocol = new OpenLayers.Protocol.WFS({
								   version: this.wfsVersion,					
								   url:  this.geoserverBaseURL + "wfs",									   
								   featureType: this.glidersFeatureType,
								   featurePrefix: this.glidersPrefix,
								   srsName: "EPSG:4326",
								   defaultFilter: filter
							    });

								var mask = new Ext.LoadMask(gpanel.getEl(), {msg:"Please wait..."});
								
								var callback = function(r) {
									var xmlFormat = new OpenLayers.Format.XML();                  
									var xmlResp = xmlFormat.read(r.priv.responseText);
									
									var rootNode = xmlResp.getElementsByTagName('wfs:FeatureCollection')[0];
									var numberOfFeatures = rootNode.getAttribute('numberOfFeatures');
									
									if(numberOfFeatures == 1){	
										var record = store.getAt(rowIndex);
										record.set('availability', true);
									}
									
									mask.hide();
								};
								
								mask.show();
								var response = protocol.read({
									callback: callback,
									resultType: "hits" 
								});										
							}
						}]
					}
				]
			}),
			autoExpandColumn: 'vehicle',
			height: 380,
			width: 250,
			tbar: [{
				text: 'Refresh All Vehicles',
				iconCls: 'vehicle-refresh-icon',
				tooltip: 'Refresh All Vehicles',
				scope: this,
				handler : function(){
					this.refreshRecords();								
				}
			}]
		});
		
		this.target.on('refreshToolActivated', function(){
		    var tabPanel = Ext.getCmp('west').setActiveTab(1);
			this.refreshRecords();
		}, this);
		
	    var panel = gxp.plugins.VehicleSelector.superclass.addOutput.call(this, this.grid);
        return panel;
    },
	
	refreshLayers: function(col, rowIndex){
		
		var store = this.grid.getStore();
								
		var records = store.getRange(0, this.data.length - 1);
		var checked = [];
		for(var i=0; i<records.length; i++){
			var selected = records[i].get("selected");
			if(selected){
				checked.push(records[i]);
			}
		}
		
		if (checked.length > 0){
			var clause = '(';
			for (var i=0; i<checked.length; i++){
				clause += " " + this.gliderPropertyName + " = '" + checked[i].get("vehicle") +"'";
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
							
								var type = this.getType(layer.params.CQL_FILTER);
								var cruiseName = this.getCruiseName(layer.params.CQL_FILTER);
								
								var filter = this.cruisePropertyName + " = "+ cruiseName + " AND " + clause;
								
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
			  
		} else {
			//
			// At least one box should be selected
			//
			Ext.Msg.show({
			   title: 'Cannot unselect this vehicle',
			   msg: 'At least one vehicle must be selected',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
				
			//
			// reset selection
			//
			if(col && rowIndex){
				this.restoreState(col, this.grid, rowIndex);
			}
		}
	},
	
	refreshRecords: function(){
        var store = this.grid.getStore();	
		var records = store.getRange(0, this.data.length - 1);
		
		var filter = new OpenLayers.Filter.Logical({
			type: OpenLayers.Filter.Logical.AND,
			filters: [
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					property: this.cruisePropertyName,
					value: this.target.cruiseName
				})
			]
		});					
		
		var protocol = new OpenLayers.Protocol.WFS({
		   version: this.wfsVersion,					
		   url:  this.geoserverBaseURL + "wfs",									   
		   featureType: this.glidersFeatureType,
		   featurePrefix: this.glidersPrefix,
		   srsName: "EPSG:4326",
		   defaultFilter: filter,
		   propertyNames: [this.gliderPropertyName]
		});

		var mask = new Ext.LoadMask(this.grid.getEl(), {msg:"Please wait..."});
		
		var refreshCallback = function(r) {
			var gmlFormat = new OpenLayers.Format.GML();              			
			gmlFormat.read(r.priv.responseText);
			
			for(var i=0; i<r.features.length; i++){
				for(var j=0; j<records.length; j++){
					if(r.features[i].attributes[this.gliderPropertyName.toLowerCase()] == records[j].get('vehicle').toLowerCase()){
						var record =  store.getAt(j);
						record.set('availability', true);
					}
				}							
			}
			
			mask.hide();
			
			this.refreshLayers();
		};
		
		mask.show();
		var response = protocol.read({
			callback: refreshCallback,
			scope: this
		});									
	},

    getType: function( filter ){
	  var match = filter.match(/.*type *= *([a-zA-Z0-9']*)/);
	  if ( match && match.length >= 2 ){
		return match[1];
	  } 
	  return null;
    },

    getCruiseName: function( filter ){
	  var match = filter.match(/.*cruise_name *= *([a-zA-Z0-9']*)/);
	  if ( match && match.length >= 2 ){
		return match[1];
	  } 
	  return null;
    },

    saveState: function(state){
	 this.oldState = state;
    },

    restoreState: function(col, gpanel, rowIndex){	
		var store = gpanel.getStore();		
		var record = store.getAt(rowIndex);
		record.set("selected", true);
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