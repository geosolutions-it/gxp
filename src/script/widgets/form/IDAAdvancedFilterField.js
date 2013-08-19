/**
 * Copyright (c) 2012-2013 GeoSolutions SAS
 *
 * Published under the BSD license.
 * See https://github.com/geosolutions-it/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @include widgets/form/IDAAdvancedFilterField.js
 */

/** api: (define)
 *  module = gxp.form
 *  class = IDAAdvancedFilterField
 *  base_link = `Ext.form.CompositeField <http://extjs.com/deploy/dev/docs/?class=Ext.form.CompositeField>`_
 */
Ext.namespace("gxp.form");

/** api: constructor
 *  .. class:: IDAAdvancedFilterField(config)
 *
 *      A form field representing a comparison filter.
 */
gxp.form.IDAAdvancedFilterField = Ext.extend(Ext.form.CompositeField, {

    /**
     * Property: filter
     * {OpenLayers.Filter} Optional non-logical filter provided in the initial
     *     configuration.  To retreive the filter, use <getFilter> instead
     *     of accessing this property directly.
     */
    filter : null,

    /**
     * Property: coverages
     * {GeoExt.data.AttributeStore} A configured coverages store for use in
     *     the filter property combo.
     */
    coverages : null,

    /**
     * Property: coveragesComboConfig
     * {Object}
     */
    coveragesComboConfig : null,

    baseURL : null,

    version : "1.0.0",

    proxy : null,

    defualtCoverageSetting : null,

    spmCoverageSetting : null,

    layerAttributeCoverageSetting : null,

    initComponent : function() {

        // Maintain compatibility with QueryPanel, which relies on "remote"
        // mode and the filterBy filter applied in it's attributeStore's load
        // listener *after* the initial combo filtering.
        // TODO Assume that the AttributeStore is already loaded and always
        // create a new one without geometry fields.
        var mode = "remote";

        //
        // Check domain for proxy
        //
        if (!this.baseURL || !this.proxy) {
            Ext.Msg.show({
                title : "Layer Attribute Exception",
                msg : "The geoserver base URL  or proxy are undefined! Check your 'risk_data' property configuration.",
                buttons : Ext.Msg.OK,
                icon : Ext.Msg.ERROR
            });
        }

        var pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
        var mHost = pattern.exec(this.baseURL);

        var mUrl = this.baseURL + "/ows?service=wcs&version=" + this.version + "&request=GetCapabilities";

        var coverages = new Ext.data.Store({
            reader : new WCSCapabilitiesReader({
                fields : ['name']
            }),
            autoLoad : true,
            proxy : new Ext.data.HttpProxy({
                url : mHost[2] == location.host ? mUrl : (this.proxy ? this.proxy : "") + encodeURIComponent(mUrl),
                timeout : 60,
                method : 'GET'
            })
        });

        if (this.coverages) {
            if (this.coverages.length != 0) {
                mode = "local";
                this.coverages.each(function(r) {
                    coverages.add([r]);
                });
            } else {
                coverages = this.coverages;
            }
        }

        var defAttributesComboConfig = {
            xtype : "combo",
            store : coverages,
            editable : mode == "local",
            typeAhead : true,
            forceSelection : true,
            mode : mode,
            triggerAction : "all",
            allowBlank : this.allowBlank,
            displayField : "name",
            valueField : "name",
            resizable : true,
            minChars : 2,
            listeners : {
                "expand" : function(combo) {
                    combo.store.reload();
                    combo.list.setWidth('auto');
                    combo.innerList.setWidth('auto');
                },
                select : function(combo, record) {
                    this.fireEvent("change", this.filter);
                },
                // //////////////////////////////////////////////////////////////
                // Workaround for select event not being fired when tab is hit
                // after field was autocompleted with forceSelection
                // //////////////////////////////////////////////////////////////
                "blur" : function(combo) {
                    var index = combo.store.findExact("name", combo.getValue());
                    if (index != -1) {
                        combo.fireEvent("select", combo, combo.store.getAt(index));
                    } else if (combo.startValue != null) {
                        combo.setValue(combo.startValue);
                    }
                },
                scope : this
            },
            width : 120
        };

        this.coveragesComboConfig = this.coveragesComboConfig || {};
        Ext.applyIf(this.coveragesComboConfig, defAttributesComboConfig);

        this.items = this.createFilterItems();

        this.addEvents(
        /**
         * Event: change
         * Fires when the filter changes.
         *
         * Listener arguments:
         * filter - {OpenLayers.Filter} This filter.
         */"change");

        gxp.form.IDAAdvancedFilterField.superclass.initComponent.call(this);
    },

    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems : function() {
        return [this.coveragesComboConfig];
    }
});

Ext.reg('gxp_idaadvancedfilterfield', gxp.form.IDAAdvancedFilterField); 