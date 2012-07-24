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
 *  class = AddGeometry
 */

/** api: (extends)
 *  plugins/AddGeometry.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: AddGeometry(config)
 *
 *    tools to create points, polygons and other geometries.
 */
gxp.plugins.AddGeometry = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_pilot_notes */
    ptype: "gxp_add_geometry",
    
    /** api: config[addPointMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addPointMenuText: "Add Point",


    /** api: config[ addPointTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addPointTooltip: "Add Point",

    /** api: config[addLinesMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addLinesMenuText: "Add Lines",


    /** api: config[ addLinesTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addLinesTooltip: "Add Lines",

    /** api: config[addPolygonMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addPolygonMenuText: "Add Polygon",


    /** api: config[ addPolygonTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addPolygonTooltip: "Add Polygon",
  
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.AddGeometry.superclass.constructor.apply(this, arguments);
        this.addEvents( 
            "addgeometry"
        );
    },

    /** api: method[addActions]
     */
    addActions: function() {
		var self = this;
		this.addPointBtn = this.createButton( 
								this.addPointMenuText,
								this.addPointTooltip,
								"gxp-icon-add-point",
								 function untoggle(){
									self.addPointBtn.toggle(false);
							    }); 
		this.addLinesBtn = this.createButton( 
							this.addLinesMenuText,
							this.addLinesTooltip,
							"gxp-icon-add-lines",
							function untoggle(){
								self.addLinesBtn.toggle(false);
							}); 

		this.addPolygonBtn = this.createButton( 
								this.addPolygonMenuText,
								this.addPolygonTooltip,
								"gxp-icon-add-polygon",
								function untoggle(){
									self.addPolygonBtn.toggle(false);
								});	
		
        var actions = [
			this.addPointBtn,
			this.addLinesBtn,
			this.addPolygonBtn
		];
        return gxp.plugins.AddGeometry.superclass.addActions.apply(this, [actions]);
    },
	
	/** private: method[createButton]
     *  
     */
	createButton: function( text, tooltip, icon, callback ){
		return new Ext.Button({
			    menuText: text,
	            iconCls: icon,
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: false,
	            tooltip: tooltip,
	            handler: function(button, event) {
					if(button.pressed) {
						this.target.fireEvent("addgeometry", this, callback);
				    }

	            },
	            scope: this
		});
	}

});

Ext.preg(gxp.plugins.AddGeometry.prototype.ptype, gxp.plugins.AddGeometry);
