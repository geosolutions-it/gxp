Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: AddLayer(config)
 *
 *    Base class to add a new layer on the map accordingly the gxp rules.
 *    This means WMS source check/creation and also creation fo layerrecord 
 *    (for the layer tree) to add the new layer to the map.
 
 *    ``createLayerRecord`` method.
 */   
gxp.plugins.AddLayer = Ext.extend(gxp.plugins.Tool, {
   
    /** api: ptype = gxp_addlayer */
    ptype: "gxp_addlayer",
	
	id: "addlayer",
	
    /** private: property[target]
     *  ``Object``
     *  The object that this plugin is plugged into.
     */
     
    /** api: property[title]
     *  ``String``
     *  A descriptive title for this layer source.
     */
    title: "",
	
	/** api: property[waitMsg]
     *  ``String``
     *  A wait message for this layer source loading.
     */
	waitMsg: "Please Wait ...",
	
	/** api: property[capabilitiesFailureMsg]
     *  ``String``
     *  A status message for a failure in the WMSCapabilities loading.
     */
	capabilitiesFailureMsg: " The layer cannot be added to the map", 
	
    /** api: property[useEvents]
     *  ``Boolean``
     *  
     */
	useEvents: false,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        this.initialConfig = config;
		
        Ext.apply(this, config);
        
        this.addEvents(
            /** api: event[ready]
             *  Fires when the layer source is ready for action.
             */
            "ready",
            /** api: event[failure]
             *  Fires if the layer source fails to load.
             */
            "failure"
        );
		
        gxp.plugins.AddLayer.superclass.constructor.apply(this, arguments);
    },
    
    /** api: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.AddLayer.superclass.init.apply(this, arguments);
        this.target = target;
    },
	
	/**  
	 * api: method[addLayerRecord]
     */
	addLayerRecord: function(source, sourceId, msLayerName, gnUrl, enableViewTab, layerUUID, gnLangStr){
		  
		var props = {
			name: msLayerName,
			title: msLayerName,
			source: sourceId
		};
		  
		if(layerUUID)
			props.uuid = layerUUID;
		
		if(gnUrl && gnLangStr)
			props.gnURL = gnUrl + "srv/" + gnLangStr + "/";
		  
		var record = source.createLayerRecord(props);   
				  
		if (record) {
			var layerStore = this.target.mapPanel.layers;  
			layerStore.add([record]);

			modified = true; // TODO: refactor this
					
		    //
			// If tabs are used the View tab is Activated
			//
			if(this.target.renderToTab && enableViewTab){
				var portalContainer = Ext.getCmp(this.target.renderToTab);
				portalContainer.setActiveTab(1);
			}					
						
			// //////////////////////////
			// Zoom To Layer extent
			// //////////////////////////
			var layer = record.get('layer');
			var extent = layer.restrictedExtent || layer.maxExtent || this.target.mapPanel.map.maxExtent;
			var map = this.target.mapPanel.map;

			// ///////////////////////////
			// Respect map properties
			// ///////////////////////////
			var restricted = map.restrictedExtent || map.maxExtent;
			if (restricted) {
				extent = new OpenLayers.Bounds(
					Math.max(extent.left, restricted.left),
					Math.max(extent.bottom, restricted.bottom),
					Math.min(extent.right, restricted.right),
					Math.min(extent.top, restricted.top)
				);
			}

			map.zoomToExtent(extent, true);
		}
	},

    /**  
	 * api: method[checkLayerSource]
     */
	checkLayerSource: function(wmsURL){
		var source;
		for (var id in this.target.layerSources) {
			  var src = this.target.layerSources[id];    
			  var url  = src.initialConfig.url; 
			  
			  // //////////////////////////////////////////
			  // Checking if source URL aldready exists
			  // //////////////////////////////////////////
			  if(url && url.indexOf(wmsURL) != -1){
				  source = src;
				  break;
			  }
		} 

		return source;
	},
	
	/**  
	 * api: method[addLayer]
     */
	addLayer: function(msLayerName, wmsURL, gnUrl, enableViewTab, msLayerUUID){		

		var source = this.checkLayerSource(wmsURL);

		if(source){
			this.addLayerRecord(source, source.id, msLayerName, gnUrl, enableViewTab, msLayerUUID);
		}else{
			var mask = new Ext.LoadMask(Ext.getBody(), {msg: this.waitMsg});
			mask.show();

			var sourceOpt = {
				config: {
				  url: wmsURL
				}
			};
		  
			source = this.target.addLayerSource(sourceOpt);
		  
			//
			// Waiting GetCapabilities response from the server.
			//			
			source.on('ready', function(){ 
				mask.hide();
				
				this.addLayerRecord(source, source.id, msLayerName, gnUrl, enableViewTab, msLayerUUID);
				
				if(this.useEvents)
					this.fireEvents('ready');
			}, this);
		  
			//
			// To manage failure in GetCapabilities request (invalid request url in 
			// GeoNetwork configuration or server error).
			//
			source.on('failure', function(src, msg){		          
				mask.hide();
				
				if(!this.useEvents){
					Ext.Msg.show({
						 title: 'GetCapabilities',
						 msg: msg + this.capabilitiesFailureMsg,
						 width: 300,
						 icon: Ext.MessageBox.ERROR
					});  
				}else{
					this.fireEvents('failure', msg);
				}
			}, this);
		}
	},

	/**  
	 * api: method[addSource]
     */
	addSource: function(wmsURL){		  
		var source = this.checkLayerSource(wmsURL);

		if(!source){
			  var mask = new Ext.LoadMask(Ext.getBody(), {msg: this.waitMsg});
			  mask.show();

			  var sourceOpt = {
				  config: {
					  url: wmsURL
				  }
			  };
			  
			  source = this.target.addLayerSource(sourceOpt);
			  
			  //
			  // Waiting GetCapabilities response from the server.
			  //
			  source.on('ready', function(){ 
				mask.hide();
				
				if(this.useEvents)
					this.fireEvents('ready');
			  }, this);
			  
			  //
			  // To manage failure in GetCapabilities request (invalid request url in 
			  // GeoNetwork configuration or server error).
			  //
			  source.on('failure', function(src, msg){		          
				mask.hide();
				  
				if(!this.useEvents){
					Ext.Msg.show({
						 title: 'GetCapabilities',
						 msg: msg + this.capabilitiesFailureMsg,
						 width: 300,
						 icon: Ext.MessageBox.ERROR
					});  
				}else{
					this.fireEvents('failure', msg);
				}
			  }, this);
		}
	}
});

Ext.preg(gxp.plugins.AddLayer.prototype.ptype, gxp.plugins.AddLayer);
