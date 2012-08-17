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
 *  class = Synchronizer
 */

/** api: (extends)
 *  plugins/Synchronizer.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Synchronizer(config)
 *
 *    update the content of layers and the status of the time slider dynamically.
 */
gxp.plugins.Synchronizer = Ext.extend(gxp.plugins.Tool, {
    
	/** api: ptype = gxp_synchronizer */
    ptype: "gxp_synchronizer",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Synchronizer.superclass.constructor.apply(this, arguments);
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
	
		//setInterval(this.refresh, 5000);
		
	},
	
	/** private: method[refresh]
	 *
	 */
	refresh: function(){
		console.log('refreshed');
	}

});

Ext.preg(gxp.plugins.Synchronizer.prototype.ptype, gxp.plugins.Synchronizer);