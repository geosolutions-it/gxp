/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires plugins/FeatureEditorGrid.js
 * @requires GeoExt/widgets/Popup.js
 * @requires OpenLayers/Control/WMSGetFeatureInfo.js
 * @requires OpenLayers/Format/WMSGetFeatureInfo.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = WMSGetFeatureInfo
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: WMSGetFeatureInfo(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
gxp.plugins.WMSGetGraphs = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_wmsgetfeatureinfo */
    ptype: "gxp_wmsgetgraphs",
    
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
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Get Graph",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Graph",
    
    /** api: config[text]
     *  ``String`` Text for the GetFeatureInfo button (i18n).
     */
    buttonText: "Get Graph",
    
    /** api: config[format]
     *  ``String`` Either "html" or "grid". If set to "grid", GML will be
     *  requested from the server and displayed in an Ext.PropertyGrid.
     *  Otherwise, the html output from the server will be displayed as-is.
     *  Default is "html".
     */
    format: "grid",
    
    /** api: config[vendorParams]
     *  ``Object``
     *  Optional object with properties to be serialized as vendor specific
     *  parameters in the requests (e.g. {buffer: 10}).
     */
    
    /** api: config[layerParams]
     *  ``Array`` List of param names that should be taken from the layer and
     *  added to the GetFeatureInfo request (e.g. ["CQL_FILTER"]).
     */
     layerParams: ["TIME","ELEVATION","CQL_FILTER"],    

    /** private: method[constructor]
     */
    constructor: function(config) {		
        gxp.plugins.WMSGetGraphs.superclass.constructor.apply(this, arguments);
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.WMSGetGraphs.superclass.init.apply(this, arguments);
        this.layers = target.map.layers;
	},
    
    /** api: config[itemConfig]
     *  ``Object`` A configuration object overriding options for the items that
     *  get added to the popup for each server response or feature. By default,
     *  each item will be configured with the following options:
     *
     *  .. code-block:: javascript
     *
     *      xtype: "propertygrid", // only for "grid" format
     *      title: feature.fid ? feature.fid : title, // just title for "html" format
     *      source: feature.attributes, // only for "grid" format
     *      html: text, // responseText from server - only for "html" format
     */

    /** api: method[addActions]
     */
    addActions: function() {

        this.popupCache = {};
        var actions = gxp.plugins.WMSGetGraphs.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "gxp-icon-graph-wms",
            text: "Modelli",
            buttonText: this.buttonText,
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
        var valueData = new Array();
        var timeData = new Array();
        var count=0;
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
            queryableLayers.each(function(x){
                var layer = x.getLayer();
                var vendorParams = Ext.apply({}, this.vendorParams), param;
                if (this.layerParams) {
                    for (var i=this.layerParams.length-1; i>=0; --i) {
                        param = this.layerParams[i].toUpperCase();
                        vendorParams[param] = layer.params[param];
                    }
                }
                var infoFormat = x.get("infoFormat");
                if (infoFormat === undefined) {
                    // TODO: check if chosen format exists in infoFormats array
                    // TODO: this will not work for WMS 1.3 (text/xml instead for GML)
                    infoFormat = this.format == "html" ? "text/html" : "application/vnd.ogc.gml";
                }
                var control = new OpenLayers.Control.WMSGetFeatureInfo(Ext.applyIf({
                    url: layer.url,
                    queryVisible: true,
                    layers: [layer],
                    infoFormat: infoFormat,
                    vendorParams: vendorParams,
                    maxFeatures: 100,
                    eventListeners: {
                        getfeatureinfo: function(evt) {
                            var title = x.get("title") || x.get("name");
                            var displayGraph = x.get("getGraph") || false;
                            var cumulative = x.get("cumulative") || false;
                            var graphTable = x.get("graphTable") || null;
                            var graphAttribute = x.get("graphAttribute") || null;
                            
                            if (infoFormat == "text/html") {
                                var match = evt.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
                                if (match && !match[1].match(/^\s*$/)) {
                                    this.displayPopup(evt, title, match[1]);
                                }
                            } else if (infoFormat == "text/plain") {
                                this.displayPopup(evt, title, '<pre>' + evt.text + '</pre>');
                            } else if (evt.features && evt.features.length > 0) {
                                    
                                if (!graphAttribute){
                                    count++;
                                    this.displayChartModels(
                                            count,
                                            evt,
                                            title,
                                            x.get("getFeatureInfo"),
                                            graphTable,
                                            graphAttribute,
                                            cumulative,
                                            true,
                                            info,
                                            valueData,
                                            timeData
                                        );
                                }
                                    
                            }
                        },
                        scope: this
                    }
                }, this.controlOptions));
                map.addControl(control);
                info.controls.push(control);
                if(infoButton.pressed) {
                    control.activate();
                }
            }, this);

        };
        
        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);
        
        return actions;
    },
    
    displayChartModels: function(count,evt, title, featureinfo, table, attribute, cumulative, displayGraph, info, valueData, timeData){
        
        for(var oldkey in this.popupCache){
            this.popupCache[oldkey].close();
        }           
        
        var pippo = info.controls;
        
        var xxx = new Array();
        var ddd = new Array();
        var numLayers = new Array();
        for (var i = 0; i<pippo.length;i++){
            if (pippo[i].layers[0].name == title){
                    numLayers.push(pippo[i].layers[0].name);
                    xxx = info.controls[i];
                    ddd = pippo[i].layers;
            }
        }
        
        var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, loading data..."});    
        
        if(evt.features[0].data.GRAY_INDEX != "NaN"){
            
            var millisecondi  = 3600000;
            var myTime = OpenLayers.Date.parse(evt.object.vendorParams.TIME);        
            var cccc = new Date(myTime);
            var piuUno = timeData.length == 0 ? cccc.getTime() : cccc.getTime()+(millisecondi);
            
            if (timeData.length==0) appMask.show();
            
            var buona = new Date(piuUno);
            var ultima = OpenLayers.Date.toISOString(buona);            
            evt.object.vendorParams.TIME = ultima;
            xxx.buildWMSOptions("http://159.213.57.108/geoserver/ows?SERVICE=WMS&",ddd,evt.xy,"application/vnd.ogc.gml");                
            xxx.getInfoForClick(evt);

                  
            valueData.push(evt.features[0].data.GRAY_INDEX);
            timeData.push(evt.object.vendorParams.TIME);

            console.log("TIME: " + evt.object.vendorParams.TIME + " - VALUE: " + evt.features[0].data.GRAY_INDEX + " - TITLE: " + title);
                        
        }else{
            
            appMask.hide();
            
            var delLastChar = function (str){
                len = str.length;
                str = str.substring(0,len-1);
                return str;
            }
            
            var popup;
            var tabPanel;
            var popupKey = evt.xy.x + "." + evt.xy.y;
            featureinfo = featureinfo || {};
        
            if (!(popupKey in this.popupCache)) {
                

                
                popup = this.addOutput({
                    xtype: "gx_popup",
                    title: this.popupTitle,
                    layout: "fit",
                    fill: false,
                    autoScroll: true,
                    location: evt.xy,
                    map: this.target.mapPanel,
                    width:605,
                    height:380,
                    items  : {
                        xtype           : 'tabpanel',
                        activeTab       : 0,
                        minTabWidth     : 10,
                        tabWidth        : 170,                         
                        id              : 'wmsGraphTab',
                        enableTabScroll : true,
                        resizeTabs      : true,
                        layoutOnTabChange:true,
                        deferredRender:false
                    },
                    listeners: {
                        close: (function(key) {
                            return function(panel){
                                delete this.popupCache[key];
                            };
                        })(popupKey),
                        scope: this
                    }
                });
                this.popupCache[popupKey] = popup;
            } else {
                popup = this.popupCache[popupKey];
            }
        
            var features = evt.features, config = [];

            popup.doLayout();
        
            Ext.getCmp('wmsGraphTab').add({
                title: title,
                resizeTabs      : true,
                html: "<div id='chartContainer_" + title + "' style='min-height: 305px; min-width: 584px'></div>"
            });
        
            Ext.getCmp('wmsGraphTab').doLayout();
        
            Ext.getCmp('wmsGraphTab').setActiveTab(0);
        
            //var campo = findCampo();
            var dataGraph = "[";
            
            for (var i = 0; i<valueData.length; i++){
                var time = OpenLayers.Date.parse(timeData[i]);
                var cccc = new Date(time);
                dataGraph += "[" + cccc.getTime() + "," + valueData[i] + "],";
            }
            
            dataGraph = delLastChar(dataGraph);   
            dataGraph += "]";
            dataGraph = Ext.util.JSON.decode(dataGraph);
            dataGraph = dataGraph.sort();
                    
            /*var cum = checkCumulative();
            
            if (cum){
                var makeCumulative = parseFloat(dataGraph[0].slice(1));
                dataGraph[0].splice(1,1,makeCumulative);
                
                for (var  i = 1; i<dataGraph.length; i++){
                    makeCumulative = makeCumulative + parseFloat(dataGraph[i].slice(1));
                    dataGraph[i].splice(1,1,parseFloat(makeCumulative.toFixed(2)));
                }
            }*/

           Ext.onReady(function () {
                var chart = new Highcharts.StockChart({
                    chart : {
                        type: 'line',
                        renderTo : "chartContainer_" + title
                    },
                    rangeSelector : {
                        /*buttonTheme: { // styles for the buttons
                            fill: 'none',
                            stroke: 'none',
                            style: {
                                color: '#039',
                                fontWeight: 'bold'
                            },
                            states: {
                                hover: {
                                    fill: 'white'
                                },
                                select: {
                                    style: {
                                        color: 'white'
                                    }
                                }
                            }
                        },
                        inputStyle: {
                            color: '#039',
                            fontWeight: 'bold'
                        },
                        labelStyle: {
                            color: 'silver',
                            fontWeight: 'bold'
                        },*/                                
                        buttons: [{
                            type: 'day',
                            count: 0.25,
                            text: '6 h'
                        },{
                            type: 'day',
                            count: 0.5,
                            text: '12 h'
                        },{
                            type: 'day',
                            count: 1,
                            text: '1 d'
                        }, {
                            type: 'all',
                            text: 'All'
                        }],                                
                        selected : 3,
                        enabled: true
                    },
                    legend: {
                        enabled: false
                    },

                    title : {
                        text : title,
                        style: {
                            color: '#3E576F',
                            fontSize: '12px'
                        }        
                    },
                    subtitle : {
                        text : title,
                        style: {
                            color: '#3E576F',
                            fontSize: '10px'
                        }        
                    },                            
                    series : [{
                        name : title,
                        data: dataGraph,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                }
                )      
            });
                    
            //alert("END VALUE: " + data[data.length-1] +" - ARRAY LENGTH: "+ data.length);
            valueData.splice(0, valueData.length);
            evt.object.vendorParams.TIME = timeData[0];
            timeData.splice(0, timeData.length);
            count=1;
            return;                
        }
    }
});

Ext.preg(gxp.plugins.WMSGetGraphs.prototype.ptype, gxp.plugins.WMSGetGraphs);
