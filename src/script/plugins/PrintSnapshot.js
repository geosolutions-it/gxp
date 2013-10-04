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
 *  class = PrintSnapshot
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: PrintSnapshot(config)
 *
 *    Provides an action to print a snapshot of the map.
 */
gxp.plugins.PrintSnapshot = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_printsnapshot */
    ptype: "gxp_printsnapshot",

	/** private: property[iconCls]
     */
    iconCls: "gxp-icon-printsnapshot",
    
	/** api: config[customParams]
     *  ``Object`` Key-value pairs of custom data to be sent to the print
     *  service. Optional. This is e.g. useful for complex layout definitions
     *  on the server side that require additional parameters.
     */
    customParams: null,
    
    /** api: config[menuText]
     *  ``String``
     *  Text for print menu item (i18n).
     */
    menuText: "Snapshot",

    /** api: config[tooltip]
     *  ``String``
     *  Text for print action tooltip (i18n).
     */
    tooltip: "Snapshot",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.PrintSnapshot.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
    	var actions = gxp.plugins.Print.superclass.addActions.call(this, [{
                menuText: this.menuText,
                tooltip: this.tooltip,
                iconCls: this.iconCls,
                disabled: false,
                handler: function() {
                	var canvas = document.getElementById("printcanvas");
                	var mapPanel = this.target.mapPanel;
                	var map = mapPanel.map;
                	
                	var width = map.div.style.width;
                	    width = width.substring(0, width.indexOf('px'));
                	var height = map.div.style.height;
                	    height = height.substring(0, height.indexOf('px'));
                	
                	var extent = map.getExtent();
                	var layers = map.layers;
                	
                	var baseURL;
                	var srsID;
                	var supportedLayers = [];
                	var vectorialLayers = [];
                	var filters = [];
                	for (var i = 0; i < layers.length; i++) {
                		var layer = layers[i].clone();
                		if (layer.getVisibility()) {
                			if (layer instanceof OpenLayers.Layer.WMS) {
	                			supportedLayers.push(layer.params.LAYERS);
	                			filters.push(layer.params.CQL_FILTER ? encodeURIComponent(layer.params.CQL_FILTER) : "INCLUDE");
	                			
	                			if (!baseURL) {
	                				baseURL = layer.url;
	                			}
	                			
	                			if (!srsID) {
	                				srsID = layer.projection.projCode;
	                			}
	                		}

                			if (layer instanceof OpenLayers.Layer.Vector) {
                				vectorialLayers.push(layer.clone());
                			}
                		}
                	}
                	
                	var gsURL = baseURL + 
                	    "LAYERS=" + supportedLayers.join(",") +
                		"&FORMAT=" + encodeURIComponent("image/png") + 
						"&SRS=" + srsID +  
						"&VERSION=1.1.1" +
						"&REQUEST=GetMap" +
						"&BBOX=" + encodeURIComponent(extent.toBBOX())+
						"&WIDTH=" + width +
						"&HEIGHT=" + height +
						"&CQL_FILTER=" + filters.join(";");
						
                	var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
					var mHost=pattern.exec(app.xmlJsonTranslateService);
                	
                	var img = new Image();
                	
                	img.onload = function(){
                    	//Draw
                    	canvas.width  = width;      // change if you have to add legend
                    	canvas.height = height;    // change if you have to add legend
                    	var ctx = canvas.getContext("2d");

                    	//WARNING: cross domain is not allowed 
                    	ctx.drawImage(img,0, 0);
                    	//to avoid clear use another canvas and draw on the old after executing canvg
                    	var canvas2 = document.createElement("canvas");
                    	canvas2.width  = width;      // change if you have to add legend
                    	canvas2.height = height;    // change if you have to add legend

						// draw vectorial layers
						if (vectorialLayers) {
							for (var i = 0; i < map.div.getElementsByTagName('svg').length; i++) {
								var svgTags = map.div.getElementsByTagName('svg');
								for (var c=0; c<svgTags.length; c++) {
					                var svgTag = svgTags[c].cloneNode(true);
					                var div = document.createElement('div');
					                div.appendChild(svgTag);
					                        
					                canvg(canvas2, div.innerHTML,{
					                    ignoreMouse: true,
					                    ignoreAnimation: true,
					                    ignoreDimensions: true,
					                    ignoreClear: true,
					                    offsetX: 0,
					                    offsetY: 0
					                });
								}
							}
						}
						
						// Print final image
                    	canvas.getContext('2d').drawImage(canvas2, 0,0);
		    			
		    			//Save
                    	var canvasData = canvas.toDataURL("image/png;base64");

	                    var ajax = new XMLHttpRequest();

	                    ajax.onreadystatechange = function(data){
	                            if (ajax.readyState==4 && ajax.status==200){
                                    var fname = "ida-snapshot.png";
                					var mUrl = app.xmlJsonTranslateService + "UploadCanvas";
                	    			    mUrl = mHost[2] == location.host ? mUrl+"?ID="+ajax.responseText+"&fn="+fname : proxy + encodeURIComponent(mUrl+"?ID="+ajax.responseText+"&fn="+fname);
                                    window.location.assign(mUrl);
	                            }
	                            enableSaving=true;
	                    };
	                    
	                    var mUrl = app.xmlJsonTranslateService + "UploadCanvas";
                	    	mUrl = mHost[2] == location.host ? mUrl : proxy + mUrl;
	                    ajax.open("POST",mUrl,false);
	                    ajax.setRequestHeader('Content-Type', 'application/upload');
	                    ajax.send(canvasData);
                    };
                    
                    img.src = proxy + encodeURIComponent(gsURL);
                },
                scope: this,
                listeners: {
                    render: function() {
                        // wait to load until render so we can enable on success
                    }
                }
            }]);
            
		return actions;
    }

});

Ext.preg(gxp.plugins.PrintSnapshot.prototype.ptype, gxp.plugins.PrintSnapshot);
