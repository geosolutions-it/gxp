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
    /** api: config[builderTypeNames]
     *  ``Array``
     *  A list of labels for that correspond to builder type constants.
     *  These will be the option names available in the builder type combo.
     *  Default is ``["any", "all", "none", "not all"]``.
     */
    builderTypeNames : ["any", "all", "none", "not all"],

    /** api: config[allowedBuilderTypes]
     *  ``Array``
     *  List of builder type constants.  Default is
     *  ``[ANY_OF, ALL_OF, NONE_OF]``.
     */
    allowedBuilderTypes : null,

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

    /** private: property[builderType]
     */
    builderType : null,

    /** private: property[childFilterContainer]
     */
    childFilterContainer : null,

    layout : 'form',
    /** Start i18n */
    addConditionText : "add condition",
    removeConditionText : "remove condition",
    /** End i18n */

    initComponent : function() {

        this.items = [{
            xtype : "container",
            //autoScroll: true,
            layout : "form",
            defaults : {
                anchor : "100%"
            },
            hideLabels : true,
            items : [
                this.createChildFiltersPanel(), {
                    xtype : "toolbar",
                    items : this.createToolBar()
                },
                {
                    xtype : "textarea",
                    itemId : "script",
                    //width: "100%"
                    emptyText: "Write your script here"  // TODO: make this i18n
                }
            ]

        }];

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
            text : this.addConditionText,
            iconCls : "add",
            handler : function() {
                this.addCondition();
            },
            scope : this
        },{
            text : this.removeConditionText,
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
            listeners : {
                change : function() {
                    this.fireEvent("change", this);
                },
                scope : this
            }
        };
        var containerCfg = Ext.applyIf({
            xtype : "container",
            layout : "form",
            hideLabels : true,
            items : fieldCfg
        }, fieldCfg);
        
        var newChild = this.newRow(containerCfg, this.childFilterContainer.items.length + 1 );

        this.childFilterContainer.add(newChild);
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
        // TODO: improve this boxing
        while(i>=0){
            var item = items.get(i--);
            if(item.items.get(1).items.get(0).items.get(0).value)
                ret.push(item.items.get(1).items.get(0).items.get(0).value);
            else{
                i=-1;
                ret = null;
            }
            //console.log(item.items.get(1).items.get(0).items.get(0).value);
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
        this.childFilterContainer = new Ext.Container();
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
            listeners : {
                change : function() {
                    this.fireEvent("change", this);
                },
                scope : this
            }
        };
        var containerCfg = Ext.applyIf({
            xtype : "container",
            layout : "form",
            hideLabels : true,
            items : fieldCfg
        }, fieldCfg);

        this.childFilterContainer.add(this.newRow(containerCfg, 1 ));

        return this.childFilterContainer;
    },

    /** private: method[newRow]
     *  :return: ``Ext.Container`` A container that serves as a row in a child
     *  filters panel.
     *
     *  Generate a "row" for the child filters panel.  This couples another
     *  filter panel or filter builder with a component that allows for
     *  condition removal.
     */
    newRow : function(filterContainer, index) {
        if(!index)
            index = "";
        var ct = new Ext.Container({
            layout : "column",
            items : [
                {
                    xtype: "label",
                    style: "padding-top: 0.3em; padding-right: 8px; padding-left: 4px; font-size: 12px",
                    text: "image"+index+ " = "
                },
                filterContainer
            ]
        });
        return ct;
    }
});

/** api: xtype = gxp_idaadvancedfilterbuilder */
Ext.reg('gxp_idaadvancedfilterbuilder', gxp.IDAAdvancedFilterBuilder);
