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
 *  class = RemoveOverlays
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RemoveLayer(config)
 *
 *    Plugin for removing all overlays from the map.
 */
gxp.plugins.RemoveOverlays = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_removeoverlays */
    ptype: "gxp_removeoverlays",
    
    /** api: config[removeOverlaysMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    removeOverlaysMenuText: "Remove overlays",

    /** api: config[removeOverlaysActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeOverlaysActionTip: "Removes all overlays from the map",

    /** api: config[removeOverlaysConfirmationText]
     *  ``String``
     *  Text that is diplayed inside inside delete confirmation window (i18n).
     */
    removeOverlaysConfirmationText: "Are you sure you want to remove all loaded overlays from the map?",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.RemoveLayer.superclass.addActions.apply(this, [{
            menuText: this.removeOverlaysMenuText,
            iconCls: "gxp-icon-removeoverlays",
            disabled: true,
            tooltip: this.removeOverlaysActionTip,
            handler: function() {
            
                var removeAction = function(buttonId, text,opt){
                    if(buttonId === 'ok'){
                        var layers = this.target.mapPanel.layers;

                        layers.data.each(function(record, index, totalItems ) {
                            if(record.get('group') !== 'background'){
                                layers.remove(record);
                            }
                        }); 
                    }
                };
                
                Ext.Msg.show({
                   title: this.removeOverlaysMenuText,
                   msg: this.removeOverlaysConfirmationText,
                   buttons: Ext.Msg.OKCANCEL,
                   fn: removeAction,
                   icon: Ext.MessageBox.QUESTION,
                   scope: this
                });
                
            },
            scope: this
        }]);
        
        var removeLayerAction = actions[0];

        var enforceOne = function(store) {
            var hasOverlays = store.findBy(function(record,id){
                if(record.get('group') !== 'background'){
                    return true;
                }
            });
            removeLayerAction.setDisabled(
                hasOverlays < 1
            );
        }
        
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": enforceOne
        });
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.RemoveOverlays.prototype.ptype, gxp.plugins.RemoveOverlays);