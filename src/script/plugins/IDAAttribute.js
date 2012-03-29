
/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDAAttribute
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDAAttribute(config)
 *
 */   
gxp.plugins.IDAAttribute = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_layertree */
    ptype: "gxp_idaattribute",

    title: "Layer Attribute",
    
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDAAttribute.superclass.constructor.apply(this, arguments);
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
        
        var attributePanel = gxp.plugins.IDAAttribute.superclass.addOutput.call(this, config);

        //Ext.getCmp("idacontrol").setActiveTab(cpanel);
        
        return attributePanel;
    }
});

Ext.preg(gxp.plugins.IDAAttribute.prototype.ptype, gxp.plugins.IDAAttribute);
