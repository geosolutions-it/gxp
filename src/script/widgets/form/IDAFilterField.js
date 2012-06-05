/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @include widgets/form/ComparisonComboBox.js
 */

/** api: (define)
 *  module = gxp.form
 *  class = IDAFilterField
 *  base_link = `Ext.form.CompositeField <http://extjs.com/deploy/dev/docs/?class=Ext.form.CompositeField>`_
 */
Ext.namespace("gxp.form");

/** api: constructor
 *  .. class:: IDAFilterField(config)
 *   
 *      A form field representing a comparison filter.
 */
gxp.form.IDAFilterField = Ext.extend(Ext.form.CompositeField, {
    
    /**
     * Property: filter
     * {OpenLayers.Filter} Optional non-logical filter provided in the initial
     *     configuration.  To retreive the filter, use <getFilter> instead
     *     of accessing this property directly.
     */
    filter: null,
    
    /**
     * Property: attributes
     * {GeoExt.data.AttributeStore} A configured attributes store for use in
     *     the filter property combo.
     */
    attributes: null,
    
    /**
     * Property: attributesComboConfig
     * {Object}
     */
    attributesComboConfig: null,

    initComponent: function() {
                
        if(!this.filter) {
            this.filter = this.createDefaultFilter();
        }
        // Maintain compatibility with QueryPanel, which relies on "remote"
        // mode and the filterBy filter applied in it's attributeStore's load
        // listener *after* the initial combo filtering.
        //TODO Assume that the AttributeStore is already loaded and always
        // create a new one without geometry fields.
        
		// TODO - reenable this if necessary when we will use remote store
		//var mode = "remote", attributes = new GeoExt.data.AttributeStore();
        //if (this.attributes) {
        //    if (this.attributes.getCount() != 0) {
        //        mode = "local";
        //        this.attributes.each(function(r) {
        //            var match = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/.exec(r.get("type"));
        //            match || attributes.add([r]);
        //        });
        //    } else {
                attributes = this.attributes;
        //    }
        //}

        var defAttributesComboConfig = {
            xtype: "combo",
            store: attributes,
            //editable: mode == "local",
            typeAhead: true,
            forceSelection: true,
            //mode: mode,
            triggerAction: "all",
            allowBlank: this.allowBlank,
            //displayField: "name",
            //valueField: "name",
            value: this.filter.property,
            listeners: {
                select: function(combo, record) {
                    this.items.get(1).enable();
                    this.filter.property = combo.getValue(); //record.get("name");
                    this.fireEvent("change", this.filter);
                },
                // workaround for select event not being fired when tab is hit
                // after field was autocompleted with forceSelection
                "blur": function(combo) {
                    var index = combo.store.findExact("name", combo.getValue());
                    if (index != -1) {
                        combo.fireEvent("select", combo, combo.store.getAt(index));
                    } else if (combo.startValue != null) {
                        combo.setValue(combo.startValue);
                    }
                },
                scope: this
            },
            width: 120
        };
        this.attributesComboConfig = this.attributesComboConfig || {};
        Ext.applyIf(this.attributesComboConfig, defAttributesComboConfig);

        this.items = this.createFilterItems();
        
        this.addEvents(
            /**
             * Event: change
             * Fires when the filter changes.
             *
             * Listener arguments:
             * filter - {OpenLayers.Filter} This filter.
             */
            "change"
        ); 

        gxp.form.IDAFilterField.superclass.initComponent.call(this);
    },
    
    /**
     * Method: createDefaultFilter
     * May be overridden to change the default filter.
     *
     * Returns:
     * {OpenLayers.Filter} By default, returns a comarison filter.
     */
    createDefaultFilter: function() {
        return new OpenLayers.Filter.Comparison();
    },
    
    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems: function() {
        var slider = new Ext.Slider({
			anchor: "100%",
			disabled: true,
			minValue: 0,		// TODO - These values should be retrieved remotely 
			maxValue: 100,		// TODO - These values should be retrieved remotely 
			width: 100,
			listeners: {
				change: function (field, newv, oldv){
					this.items.get(2).setValue(newv);
					this.items.get(2).fireEvent("change", this.items.get(2).getEl(), newv);
				},
				scope: this
			}
        });
		
		/*var multislider = new Ext.slider.MultiSlider({                       
			width: 100,
			disabled: false,
			minValue: 0,		// TODO - These values should be retrieved remotely 
			maxValue: 100,		// TODO - These values should be retrieved remotely 
			values  : [0, 100],
			plugins : new Ext.slider.Tip(),
			listeners: {
				  changecomplete : function (){
						alert(this.getValues()[0]);
				  }
			}
		});
		
		this.on('afterrender', function(){
			multislider.hide();
		});*/
			
        return [
            this.attributesComboConfig, {
                xtype: "gxp_comparisoncombo",
				allowedTypes: [
					[OpenLayers.Filter.Comparison.LESS_THAN, "<"],
					[OpenLayers.Filter.Comparison.GREATER_THAN, ">"],
					[OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, "<="],
                    [OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, ">="]
					/*,[OpenLayers.Filter.Comparison.BETWEEN, ".."]*/
				],
                disabled: true,
                allowBlank: this.allowBlank,
                value: this.filter.type,
				forceSelection: true,
                listeners: {
                    select: function(combo, record) {
                        this.items.get(2).enable();						
						slider.enable();
                        this.filter.type = record.get("value");
                        this.fireEvent("change", this.filter);
                    },
                    scope: this
                }
            }, {
                xtype: "textfield",
				readOnly: true,
                disabled: true,
                value: this.filter.value,
                width: 50,
                allowBlank: this.allowBlank,
                listeners: {
                    change: function(el, value) {
                        this.filter.value = value;
                        this.fireEvent("change", this.filter);
                    },
                    scope: this
                }
            }, slider
        ];
    }

});

Ext.reg('gxp_idafilterfield', gxp.form.IDAFilterField);