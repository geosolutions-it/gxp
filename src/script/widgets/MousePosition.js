/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp
 *  class = MousePosition
 *  base_link = `Ext.Panel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class::Watermark(config)
 *   
 *      create a panel to display a watermark on the map
 */
gxp.MousePosition = Ext.extend(Ext.Panel, {
	/** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map where to show the watermark.
     */
    map: null,

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function() {
        gxp.MousePosition.superclass.initComponent.call(this);
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
     *  Create the map position control and add it to the map.
     */
    addMousePosition: function() {
		var self = this;
        var mousePanel = new Ext.BoxComponent({});
        mousePanel.on('render', function(){
			this.map.addControl(new OpenLayers.Control.MousePosition());	
	
        }, this);
        this.add(mousePanel);
    },

    /** private: method[bind]
     *  :param map: ``OpenLayers.Map``
     */
    bind: function(map) {
        this.map = map;
        this.addMousePosition();
    },
    
    /** private: method[unbind]
     */
    unbind: function() {
    }


});

/** api: xtype = gxp_watermark */
Ext.reg('gxp_mouse_position', gxp.MousePosition);