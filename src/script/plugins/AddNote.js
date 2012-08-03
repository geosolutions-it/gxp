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
 *  .. class:: AddNote(config)
 *
 *    tools to create pilot notes.
 */
gxp.plugins.AddNote = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_add_note */
    ptype: "gxp_add_note",
    
    /** api: config[addNoteMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    addNoteMenuText: "Add Note",


    /** api: config[addNoteTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    addNoteTooltip: "Add Note",

  
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.AddNote.superclass.constructor.apply(this, arguments);
    },



    /** api: method[addActions]
     */
    addActions: function() {
		var self = this;
		var map = this.target.mapPanel.map;
		var layer = this.target.notesLayer;
		
		var clickHandler = function(e){
			var lonlat = map.getLonLatFromPixel(e.xy);
			var size = new OpenLayers.Size(21,25);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			var icon = new OpenLayers.Icon('../theme/app/img/silk/note.png', size, offset); 	
		    layer.addMarker(new OpenLayers.Marker(lonlat,icon));

		}
		
		
		this.addNoteBtn = new Ext.Button({
				menuText: self.addNoteMenuText,
             	tooltip: self.addNoteTooltip,
	            iconCls: "gxp-icon-add-note",
				enableToggle: true,
				toggleGroup: this.toggleGroup,
	            allowDepress: true,
	            toggleHandler: function(button, state) {
					if(state) { // button pressed
					  	map.events.register("click", map , clickHandler);
				    } else {
						map.events.unregister("click", map, clickHandler); 
					}
				},
	            scope: this
		});
		
		
		
        var actions = [
			this.addNoteBtn
		];
		
		
        return gxp.plugins.AddNote.superclass.addActions.apply(this, [actions]);
    }



});

Ext.preg(gxp.plugins.AddNote.prototype.ptype, gxp.plugins.AddNote);
