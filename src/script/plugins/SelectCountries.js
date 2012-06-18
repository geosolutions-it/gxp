/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = SelectCountries
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: (config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of a specific layer of the map 
 *	  to add an item to a store with the relative features.
 *    
 */   
gxp.plugins.SelectCountries = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_selectfeatureactiontip */
    ptype: "gxp_selectcountries",
	
    
    /** api: config[outputTarget]
     *  ``String`` Popups created by this tool are added to the map by default.
     */
    outputTarget: "map",

    /** private: property[popupCache]
     *  ``Object``
     */
    popupCache: null,

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature select countries action tooltip (i18n).
     */
    enableSelectionTip: "Enable Country Selection",
	/** api: config[infoActionTip]
     *  ``String``
     *  Text for feature select countries  tooltip (i18n).
     */
	enableSelectionText: "Enable Selection",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Enable Selection of countries",
    

     
    /**
	 * Returns an array from an array of objects. the re
	 * returned array contains all the values of the attributename
	 * passed as second parameter
	 *
	 */
	objectToAttributeArray: function(model, attributename) {
		var ret =new Array();
		for(x in model){
			if(model[x][attributename]){
				ret.push(model[x][attributename]);
			}
		}
		return ret;
	} ,
	/** api: method[addActions]
    */
    addActions: function() {
		// set countryList and attributeList links
		for(var tool in this.target.tools){
            if(this.target.tools[tool].ptype == "gxp_countrylist"){
                this.countryList=this.target.tools[tool];
				
            }
			if(this.target.tools[tool].ptype == "gxp_countrylist"){
				this.attributeList =this.target.tools[tool];
			}
        }
        //generate propertyName string
		var propertyNameList="()(";
		var gboundariesAllowedValues =this.objectToAttributeArray(gxp.data.GBoundariesModel,'name');
		var  fra1AllowedProperties = this.objectToAttributeArray(gxp.data.fraAttributeModel, 'name');
		propertyNameList+=fra1AllowedProperties.concat()+")("+gboundariesAllowedValues.concat()+")";
        this.vendorParams={
			propertyName: propertyNameList
		};
		
		// create Action
        var actions = gxp.plugins.SelectCountries.superclass.addActions.call(this, [{
            tooltip: this.enableSelectionTip,
			text: this.enableSelectionText,
            iconCls: "gxp-icon-selectcountries", //TODO change
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = info.controls.length; i < len; i++){
                    if (pressed) {
                        info.controls[i].activate();
                    } else {
                        info.controls[i].deactivate();
                    }
                }
             }
        }]);
        var infoButton = this.actions[0].items[0];

        var info = {controls: []};
		// callback on map 
        var updateInfo = function() {
			
            var queryableLayers = this.target.mapPanel.layers.queryBy(function(x){
                return x.get("queryable");
            });
			
            var map = this.target.mapPanel.map;
            var control;
            for (var i = 0, len = info.controls.length; i < len; i++){
                control = info.controls[i];
                control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
                control.destroy();
            }

            info.controls = [];
			var layers =new Array();
            queryableLayers.each(function(x){
				layers.push(x.getLayer());
			}, this);
			//INFO_FORMAT=application%2Fvnd.ogc.gml&QUERY_LAYERS=fra%3Afra1%2Cgn%3Agboundaries&
			    
			var control = new OpenLayers.Control.WMSGetFeatureInfo({
				url: [0].url,
				infoFormat: "application/vnd.ogc.gml",
				queryVisible: false,
				layers:layers,
				vendorParams: this.vendorParams,
				eventListeners: {
					getfeatureinfo: function(evt) {
						
						var match = evt.text.match(/<wfs:FeatureCollection[^>]*>([\s\S]*)<\/wfs:FeatureCollection>/);
						
						if (match && !match[1].match(/^\s*$/)) {
							this.addRecord(evt);
						}else{
								//TODO notify the user (?)
						}
						
						this.loadMask.hide();
					},
					beforegetfeatureinfo: function(){
						this.loadMask = new Ext.LoadMask('countries',{msg:'Loading data...'});
						this.loadMask.show();
					},
					scope: this
				}
			});
			map.addControl(control);
			info.controls.push(control);
			if(infoButton.pressed) {
				control.activate();
			}
           

        };
        //TODO use this code to enable disable remove button
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    },

    /** private: method[addRecord]
     * :arg evt: the event object from a 
     *     :class:`OpenLayers.Control.GetFeatureInfo` control
     * :arg title: a String to use for the title of the results section 
     *     reporting the info to the user
     * :arg text: ``String`` Body text.
     */
    addRecord: function(evt, features) {

		var data =new Array();
		var dataEntry ,country;
		for (index in evt.features){
			//Country FeatureMember in the GridPanel Store
			if (evt.features[index].fid && evt.features[index].fid.indexOf("gboundaries")!=-1){
				country = evt.features[index].attributes;	
			}else if(evt.features[index].fid && evt.features[index].fid.indexOf("fra")!=-1){
				data.push(evt.features[index].attributes);
			}
		}
		if(country!=null){
			country.data=data;
			dataEntry=new gxp.data.FraDataEntry(country);
			this.countryList.store.add(dataEntry);
		}
		
		
		
    }
    
});

Ext.preg(gxp.plugins.SelectCountries.prototype.ptype, gxp.plugins.SelectCountries);