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
 *  module = gxp
 *  class = IDAAdvancedFilterBuilder
 *  base_link = `Ext.Container <http://extjs.com/deploy/dev/docs/?class=Ext.Container>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: IDAAdvancedFilterBuilder(config)
 *
 *      Create a panel for assembling a filter.
 */
gxp.IDAAdvancedFilterBuilder = Ext.extend(Ext.Container, {

    autoWidth : false,


    /** api: config[allowBlank]
     *  ``Boolean`` Do we allow blank FilterFields? It is safe to say true
     *  here, but for compatibility reasons with old applications, the default
     *  is false.
     */
    allowBlank : false,

    /** api: config[cls]
     *  ``String``
     *  The CSS class to be added to this panel's element (defaults to
     *  ``"gxp-filterbuilder"``).
     */
    cls : "gxp-filterbuilder",


    /** private: property[childFilterContainer]
     */
    childFilterContainer : null,

    layout : 'form',
    /** Start i18n */
    addImageText : "add input image",
    removeImageText : "remove input image",
    emptyScriptText: "Write your script here",
    /** End i18n */

    initComponent : function() {

            this.defaults = {
                anchor : "100%"
            },
            this.hideLabels = true,
            this.items = [
                this.createChildFiltersPanel(), {
                    xtype : "toolbar",
                    items : this.createToolBar()
                },
                {
                    xtype : "textarea",
                    itemId : "script",
                    width : 420,  // IE width fix
                    height : 200,
                    emptyText: this.emptyScriptText
                }
            ]

        ;

        this.addEvents(
        /**
         * Event: change
         * Fires when the filter changes.
         *
         * Listener arguments:
         * builder - {gxp.IDAAdvancedFilterBuilder} This filter builder.  Call
         *     ``getFilter`` to get the updated filter.
         */
        "change");

        gxp.IDAAdvancedFilterBuilder.superclass.initComponent.call(this);
    },

    /** private: method[createToolBar]
     */
    createToolBar : function() {
        var bar = [{
            text : this.addImageText,
            iconCls : "add",
            handler : function() {
                this.addCondition();
            },
            scope : this
        },{
            text : this.removeImageText,
            iconCls : "delete",
            handler : function() {
                this.removeCondition();
            },
            scope : this
        }];
        return bar;
    },

    /** private: method[addCondition]
     *  Add a new condition or group of conditions to the builder.  This
     *  modifies the filter and adds a panel representing the new condition
     *  or group of conditions.
     */
    addCondition : function() {
        
        var fieldCfg = {
            xtype : "gxp_idaadvancedfilterfield",
            allowBlank : this.allowBlank,
            baseURL : this.baseURL, // new custom field
            defualtCoverageSetting : this.defualtCoverageSetting,
            spmCoverageSetting : this.spmCoverageSetting,
            layerAttributeCoverageSetting : this.layerAttributeCoverageSetting,
            proxy : this.proxy, // new custom field
            columnWidth : 1,
            attributes : this.attributes,
            coverages : this.coverages,
            labelIndex : this.childFilterContainer.items.length + 1,
            listeners : {
                change : function() {
                    this.fireEvent("change", this);
                },
                scope : this
            }
        };

        this.childFilterContainer.add(fieldCfg);
        this.childFilterContainer.doLayout();
    },

    /** private: method[removeCondition]
     *  Remove a condition or group of conditions from the builder.  This
     *  modifies the filter and removes the panel representing the condition
     *  or group of conditions.
     */
    removeCondition : function() {
        var container = this.childFilterContainer;
        var items = container.items;
        if (items.getCount() > 1){
            container.remove(items.get(items.getCount()-1));
            this.fireEvent("change", this);
        }
    },

    /** public: method[getFilter]
     *  Returns an Array of String, with all the selected layers,
     *  or null if there is an empty value
     */
    // Trying to make it behave the same as the other filterBuilder
    getFilter : function() {
        var items = this.childFilterContainer.items;
        var i = items.getCount()-1;
        var ret = [];
        while(i>=0){
            var item = items.get(i--);
            // item.items referes to Fields inside the CompositeField
            // in this case there is only a ComboBox
            if(item.items.get(0).value)
                ret.push(item.items.get(0).value);
            else{
                i=-1;
                ret = null;
            }
        };
        return ret;
    },

    /** private: method[createChildFiltersPanel]
     *  :return: ``Ext.Container``
     *
     *  Create the panel that holds all conditions and condition groups.  Since
     *  this is called after this filter has been customized, we always
     *  have a logical filter with one child filter - that child is also
     *  a logical filter.
     */
    createChildFiltersPanel : function() {
        this.childFilterContainer = new Ext.Container({
            layout : "form",
            hideLabels : true
        });
        var fieldCfg = {
            xtype : "gxp_idaadvancedfilterfield",
            allowBlank : this.allowBlank,
            baseURL : this.baseURL, // new custom field
            defualtCoverageSetting : this.defualtCoverageSetting,
            spmCoverageSetting : this.spmCoverageSetting,
            layerAttributeCoverageSetting : this.layerAttributeCoverageSetting,
            proxy : this.proxy, // new custom field
            columnWidth : 1,
            attributes : this.attributes,
            coverages : this.coverages,
            labelIndex : 1,
            listeners : {
                change : function() {
                    this.fireEvent("change", this);
                },
                scope : this
            }
        };
        
        this.childFilterContainer.add(fieldCfg);

        return this.childFilterContainer;
    }

});

/** api: xtype = gxp_idaadvancedfilterbuilder */
Ext.reg('gxp_idaadvancedfilterbuilder', gxp.IDAAdvancedFilterBuilder);
