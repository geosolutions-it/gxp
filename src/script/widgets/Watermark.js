/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp
 *  class = Watermark
 *  base_link = `Ext.Panel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class::Watermark(config)
 *   
 *      create a panel to display a watermark on the map
 */
gxp.Watermark = Ext.extend(Ext.Panel, {
	/** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map where to show the watermark.
     */
    map: null,
    /** api: config[map]
     *  ``String`` 
     *  html style for the watermark (to control position).
     */
    style: null,
    /** api: config[map]
     *  ``String`` 
     *  attribution displayed by the watermark, it could be also an image.
     */
    attribution: null,

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function() {
        gxp.Watermark.superclass.initComponent.call(this);
        if(this.map) {
            if(this.map instanceof GeoExt.MapPanel) {
                this.map = this.map.map;
            }
            this.bind(this.map);
        }
        this.on("beforedestroy", this.unbind, this);        
    },

    /** private: method[addToMapPanel]
     *  :param panel: :class:`GeoExt.MapPanel`
     *  
     *  Called by a MapPanel if this component is one of the items in the panel.
     */
    addToMapPanel: function(panel) {
        this.on({
            afterrender: function() {
                this.bind(panel.map);
            },
            scope: this
        });
    },

    /** private: method[removeFromMapPanel]
     *  :param panel: :class:`GeoExt.MapPanel`
     *  
     *  Called by a MapPanel if this component is one of the items in the panel.
     */
    removeFromMapPanel: function(panel) {
        this.unbind();
    },

    /** private: method[addWatermark]
     *  
     *  Create the watermark and add it to the map.
     */
    addWatermark: function() {
		var self = this;
        var watermarkPanel = new Ext.BoxComponent({
			style: {
				bottom:'0px',
			    right:'0px'
			}
		});
        watermarkPanel.on('render', function(){
	
			var poweredByControl = new OpenLayers.Control({displayClass: "olControl_Watermark", name: "olWatermark"});
			OpenLayers.Util.extend(poweredByControl, {
			        draw: function () {
			          var wrapdiv =OpenLayers.Control.prototype.draw.apply(this, arguments);
					  wrapdiv.setAttribute("style",self.position);
			          this.div.innerHTML = '<div class=\"olPoweredBy\" id=\"olPoweredBy\" style=\"'+ self.position +'\" ><img src=\"' + self.url + '\" width=\"60\" height=\"60\"  title=\"Powered by NURC\" /></div>';
			          return this.div;
			        }

			    });
			this.map.addControl(poweredByControl);	
	
        }, this);
        this.add(watermarkPanel);
    },

    /** private: method[bind]
     *  :param map: ``OpenLayers.Map``
     */
    bind: function(map) {
        this.map = map;
        this.addWatermark();
    },
    
    /** private: method[unbind]
     */
    unbind: function() {
    }


});

/** api: xtype = gxp_watermark */
Ext.reg('gxp_watermark', gxp.Watermark);