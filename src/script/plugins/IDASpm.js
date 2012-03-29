
/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDASpm
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDASpm(config)
 *
 */   
gxp.plugins.IDASpm = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_layertree */
    ptype: "gxp_idaspm",

    title: "SPM Create",
    
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDASpm.superclass.constructor.apply(this, arguments);
    },
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        var cpanel = new Ext.Panel({
            border: false,
            layout: "fit",
            disabled: true,
            title: this.title
        });
        
        config = Ext.apply(cpanel, config || {});
        
        var spmPanel = gxp.plugins.IDASpm.superclass.addOutput.call(this, config);

        //Ext.getCmp("idacontrol").setActiveTab(cpanel);
        
        return spmPanel;
    }
});

Ext.preg(gxp.plugins.IDASpm.prototype.ptype, gxp.plugins.IDASpm);
