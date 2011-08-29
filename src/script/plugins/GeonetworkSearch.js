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
 *  class = GeonetworkSearch
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: GeonetworkSearch(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.GeonetworkSearch = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_geonetworksearch */
    ptype: "gxp_geonetworksearch",
    
    /** api: config[removeMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    geonetworkSearchText: "View metadata",

    /** api: config[removeActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    geonetworkSearchActionTip: "View metadata",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.GeonetworkSearch.superclass.addActions.apply(this, [{
            menuText: this.geonetworkSearchText,
            iconCls: "gxp-icon-geonetworksearch",
            disabled: true,
            tooltip: this.geonetworkSearchActionTip,
            handler: function() {
                var record = selectedLayer;
                if(record) {
                    var uuid = record.get('uuid');
					if(uuid){
						viewRecordMetadata(uuid);
					} else {
						var title = record.get('name');
						title = title.split(':');
						if(title.length > 1){
							title = title[1];
						} else {
							title = title[0];
						}
						runSimpleSearch(title);
					}
                }
            },
            scope: this
        }]);
        var geonetworkSearchAction = actions[0];

        this.target.on("layerselectionchange", function(record) {
            selectedLayer = record.get('group') === 'background' ? null : record;
            geonetworkSearchAction.setDisabled(
                 !selectedLayer || this.target.mapPanel.layers.getCount() <= 1 || !record
            );
        }, this);
        var enforceOne = function(store) {
            geonetworkSearchAction.setDisabled(
                !selectedLayer || store.getCount() <= 1
            );
        }
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": function(store){
                geonetworkSearchAction.setDisabled(true);
            }
        });
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.GeonetworkSearch.prototype.ptype, gxp.plugins.GeonetworkSearch);
