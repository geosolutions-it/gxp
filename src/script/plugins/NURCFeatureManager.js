/**
 * Author: Tobia Di Pisa at tobia.dipisa@geo-solutions.it
 * 
 * @requires plugins/Tool.js
 * @requires data/WFSFeatureStore.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = FeatureManager
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: NURCFeatureManager(config)
 *
 *    Plugin for a shared feature manager that other tools can reference. Works
 *    on layers added by the :class:`gxp.plugins.WMSSource` plugin, if there is
 *    a WFS resource advertized in the layer's DescribeLayer document.
 *
 *    The FeatureManager handles WFS feature loading, filtering, paging and
 *    transactions.
 */   
gxp.plugins.NURCFeatureManager = Ext.extend(gxp.plugins.FeatureManager, {
    
    /** api: ptype = gxp_featuremanager */
    ptype: "gxp_nurcfeaturemanager",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.NURCFeatureManager.superclass.constructor.apply(this, arguments);        
    },

    /** private: method[init]
     */
    init: function(target) {
        gxp.plugins.FeatureManager.superclass.init.apply(this, arguments);
        this.toolsShowingLayer = {};
        
        this.style = {
            "all": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: this.initialConfig.symbolizer || {
                        "Point": {
                            pointRadius: 4,
                            graphicName: "square",
                            fillColor: "white",
                            fillOpacity: 1,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#333333"
                        },
                        "Line": {
                            strokeWidth: 4,
                            strokeOpacity: 1,
                            strokeColor: "#ff9933"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 0,
                            strokeColor: "#ff6633",
                            fillColor: "white",
                            fillOpacity: 0
                        }
                    }
                })]
            }),
            "selected": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({symbolizer: {display: "none"}})]
            })
        };
        
        this.featureLayer = new OpenLayers.Layer.Vector(this.id, {
            displayInLayerSwitcher: false,
            visibility: false,
            styleMap: new OpenLayers.StyleMap({
                "select": OpenLayers.Util.extend({display: ""},
                    OpenLayers.Feature.Vector.style["select"]),
                "vertex": this.style["all"]
            }, {extendDefault: false})    
        });
        
        this.target.on({
            ready: function() {
                this.target.mapPanel.map.addLayer(this.featureLayer);
            },
            //TODO add featureedit listener; update the store
            scope: this
        });
        this.on({
            //TODO add a beforedestroy event to the tool
            beforedestroy: function() {
                this.target.mapPanel.map.removeLayer(this.featureLayer);
            },
            scope: this
        });
    }    
});

Ext.preg(gxp.plugins.NURCFeatureManager.prototype.ptype, gxp.plugins.NURCFeatureManager);
