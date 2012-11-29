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
     * Property: coverages
     * {GeoExt.data.AttributeStore} A configured coverages store for use in
     *     the filter property combo.
     */
    coverages: null,
    
    /**
     * Property: coveragesComboConfig
     * {Object}
     */
    coveragesComboConfig: null,
	
	baseURL: null,
	
	version: "1.1.1",
	
	proxy: null,
	
	coveragesSettings: [],
	
    initComponent: function() {
                
        if(!this.filter) {
            this.filter = this.createDefaultFilter();
        }
		
        // Maintain compatibility with QueryPanel, which relies on "remote"
        // mode and the filterBy filter applied in it's attributeStore's load
        // listener *after* the initial combo filtering.
        // TODO Assume that the AttributeStore is already loaded and always
        // create a new one without geometry fields.
        var mode = "remote";
		
		//
		// Check domain for proxy
		//
		if(!this.baseURL || !this.proxy){
			Ext.Msg.show({
				title: "Layer Attribute Exception",
				msg: "The geoserver base URL  or proxy are undefined! Check your 'risk_data' property configuration.",
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR
			});
		}
		
		var pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
        var mHost = pattern.exec(this.baseURL);

        var mUrl = this.baseURL + "/ows?service=wcs&" + this.version + "&request=GetCapabilities";
		
		var coverages = new Ext.data.Store({
			reader : new WCSCapabilitiesReader({
				fields: ['name']
			}),
			autoLoad : true,
			proxy: new Ext.data.HttpProxy({
                //url: (this.proxy ? this.proxy : "") + encodeURIComponent(this.baseURL + "/ows?service=wcs&" + this.version + "&request=GetCapabilities"),
                url: mHost[2] == location.host ? mUrl : (this.proxy ? this.proxy : "") + encodeURIComponent(mUrl),
				timeout: 60,
                method: 'GET'
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
            xtype: "combo",
            store: coverages,
            editable: mode == "local",
            typeAhead: true,
            forceSelection: true,
            mode: mode,
            triggerAction: "all",
            allowBlank: this.allowBlank,
            displayField: "name",
            valueField: "name",
            value: this.filter.property,
			resizable: true,
			minChars:2,
            listeners: {
                select: function(combo, record) {
                    this.items.get(1).enable();
					
					if(this.items.get(1).getValue()){
						this.setSlider();	
					}
                    
					this.filter.property = record.get("name");
                    this.fireEvent("change", this.filter);
                },
				// //////////////////////////////////////////////////////////////
                // Workaround for select event not being fired when tab is hit
                // after field was autocompleted with forceSelection
				// //////////////////////////////////////////////////////////////
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
     * Method: setSlider
	 * Define rules about the slider/multislider switching.
     */
	setSlider: function(){
		var data = this.coveragesSettings, min = 0, max = 250;
		for(var i=0; i<data.length; i++){
		    var name = this.items.get(0).getValue();
			if(data[i].name == name){
				min = data[i].min;
				max = data[i].max;
			}
		}
		
		if(this.items.get(1).getValue()){
			if(this.items.get(1).getValue() != ".."){
				this.slider.setMinValue(min);
				this.slider.setMaxValue(max);
				
				if((max - min) == 1){
					this.slider.decimalPrecision = 2;
				}
				
				this.items.get(2).setValue(min);
				this.items.get(3).reset();
				
				
			}else{

                this.multislider.setMaxValue(max);
                this.multislider.setMinValue(min);
                this.multislider.values = [min, max];
                
                //fix slider overlap
                this.multislider.setValue(0,min);         
                this.multislider.setValue(1,max);                  

			    if((max - min) == 1){
					this.multislider.decimalPrecision = 2;
				}

                this.items.get(3).setValue(max);                     
                this.items.get(2).setValue(min);

			}
		}else{
			this.slider.setMinValue(min);
			this.slider.setMaxValue(max);

			this.items.get(2).setValue(min);
		}
	},
    
    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems: function() {
        this.slider = new Ext.Slider({
			disabled: true,
			minValue: 0,
			maxValue: 250,	
			width: 100,
			listeners: {
				change: function (field, newv, oldv){
					this.items.get(2).setValue(newv);
					this.items.get(2).fireEvent("change", this.items.get(2).getEl(), newv);
				},
				scope: this
			}
        });
		
		this.multislider = new Ext.slider.MultiSlider({                       
			width: 100,
			disabled: false,
			hidden: true,
			minValue: 0,
			maxValue: 250,
			values  : [0, 250],
			plugins : new Ext.slider.Tip(),
			listeners: {
			      show: function(field){
						this.items.get(2).setValue(field.getValues()[0]);
						this.items.get(3).setValue(field.getValues()[1]);
						this.items.get(2).fireEvent("change", this.items.get(2).getEl(), field.getValues()[0]);
						this.items.get(3).fireEvent("change", this.items.get(3).getEl(), field.getValues()[1]);
				  },
				  changecomplete : function (field){
						this.items.get(2).setValue(field.getValues()[0]);
						this.items.get(3).setValue(field.getValues()[1]);
						this.items.get(2).fireEvent("change", this.items.get(2).getEl(), field.getValues()[0]);
						this.items.get(3).fireEvent("change", this.items.get(3).getEl(), field.getValues()[1]);
				  },                
				  scope: this
			}
		});
		
	    var cfield = new Ext.Panel({
		    width: 105,
			border: false,
			height: 22,
			items:[
				this.slider, this.multislider
			]
		});
		
        return [
            this.coveragesComboConfig, {
                xtype: "gxp_comparisoncombo",
				allowedTypes: [
					[OpenLayers.Filter.Comparison.LESS_THAN, "<"],
					[OpenLayers.Filter.Comparison.GREATER_THAN, ">"],
					[OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, "<="],
                    [OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, ">="],
					[OpenLayers.Filter.Comparison.BETWEEN, ".."]
				],
                disabled: true,
                allowBlank: this.allowBlank,
                value: this.filter.type,
				forceSelection: true,
                listeners: {
					beforeselect: function(combo, record, index){
					    this.items.get(2).reset();
						this.items.get(3).reset();
						
						if(combo.getValue() == ".."){
						    this.multislider.setVisible(false);
							this.slider.setVisible(true);
							this.slider.enable();
							this.slider.fireEvent("change", this.slider, this.slider.getValue());
						}
					},					
                    select: function(combo, record) {
                        this.items.get(2).enable();		

						if(combo.getValue() == ".."){							
							this.multislider.setVisible(true);
							this.items.get(3).enable();	
							this.slider.disable();
							this.slider.setVisible(false);							
							this.setSlider();
						}else{
						    this.items.get(3).disable();
							this.slider.enable();
							
							//
							// This define the startup setting
							//
							this.setSlider();	
							this.slider.fireEvent("change", this.slider, this.slider.getValue());							
						}
						
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
					    if(this.multislider.isVisible()){
							this.filter.lowerBoundary = value;
						}else{
							this.filter.value = value;
						}
						
						this.fireEvent("change", this.filter);
                    },
                    scope: this
                }
            }, cfield, {
                xtype: "textfield",
				readOnly: true,
                disabled: true,
                value: this.filter.value,
                width: 50,
                allowBlank: this.allowBlank,
                listeners: {
                    change: function(el, value) {
					    if(this.multislider.isVisible()){
							this.filter.upperBoundary = value;
						}else{
							this.filter.value = value;
						}
						
						this.fireEvent("change", this.filter);
                    },
                    scope: this
                }
            }
        ];
    }
});

Ext.reg('gxp_idafilterfield', gxp.form.IDAFilterField);