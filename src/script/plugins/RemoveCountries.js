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
 *  class = RemoveLayer
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RemoveCountries(config)
 *
 *    Plugin for removing all contries from the countryList.
 *    
 */
gxp.plugins.RemoveCountries = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_removelayer */
    ptype: "gxp_removecountries",
    
    /** api: config[removeMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    removeMenuText: "Remove All",

    /** api: config[removeActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeActionTip: "Remove All Countries",
    
    /** api: method[addActions]
     */
    addActions: function() {
         
        var apptarget = this.target;

        var actions = gxp.plugins.RemoveCountries.superclass.addActions.apply(this, [{
            menuText: this.removeMenuText,
            iconCls: "gxp-icon-removeallcountries",
			text: "Remove All",
            disabled: true,
            tooltip: this.removeActionTip,
            handler: function() {
                
                //TODO
                    //this.target.mapPanel.layers.remove(record);
                    apptarget.modified = true;
                    //modified = true;
					
                
            },
            scope: this
        }]);
        var removeLayerAction = actions[0];

        
        //TODO event store change 
		
        /* this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": function(store){
                removeLayerAction.setDisabled(true);
            }
        });
		*/
        
        return actions;
    }
        
});


Ext.preg(gxp.plugins.RemoveCountries.prototype.ptype, gxp.plugins.RemoveCountries);
