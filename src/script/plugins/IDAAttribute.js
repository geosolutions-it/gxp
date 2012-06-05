
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
    
    /** api: ptype = gxp_idaattribute */
    ptype: "gxp_idaattribute",

    title: "Layer Attribute",
	
	settingsTitle: "Base Settings",
	
	settingNameTitle: "Name",
	
	settingColorTitle: "Color",
	
	settingClassificationTitle: "Classification",
	
	settingColor: '000000',
	
	filterTitle: "Filter",
	
	reloadLayerText: "Reload Layers",
	
	applyFilterText: "Apply",

	resetText: "Reset",
	
	store:[
		'ALL',
		'NATO UNCLASSIFIED',
		'NATO RESTRICTED',
		'NATO CONFIDENTAL',
		'NATO SECRET',
		'NATO TOP SECRET'						
	],
	
	/*defaultBuilder: {
		xtype: "gxp_idafilterbuilder",
		// The attributes conrespont to the IDA raste layers (SPM + Habitat)
		// TODO - If/When  possible make it as remote (store/reader) 
		attributes: [
			"bathymetry",
			"dem_slope",
			"dem_aspect",
			"distance_1000m",
			"CHL_spring_2007",
			"CHL_spring_2008",
			"CHL_spring_2009"
		],
		allowBlank: true,
		allowGroups: true
	},*/
    
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
		Ext.form.Field.prototype.msgTarget = 'side';
		Ext.ux.form.FieldPanel.prototype.msgTarget = 'side';
		
		//
		// Fix for ExtJs 3 version
		//
		Ext.override(Ext.Element, {
			getColor: function(attr, defaultValue, prefix){
				var v = this.getStyle(attr), color = typeof prefix == "undefined" ? "#" : prefix, h;
				if (!v || /transparent|inherit/.test(v)) {
					return defaultValue;
				}
				if (/^r/.test(v)) {
					Ext.each(v.slice(4, v.length - 1).split(','), function(s){
						h = parseInt(s, 10);
						color += (h < 16 ? '0' : '') + h.toString(16);
					});
				} else {
					v = v.replace('#', '');
					color += v.length == 3 ? v.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3') : v;
				}
				return (color.length > 5 ? color.toLowerCase() : defaultValue);
			}
		});
	
		var settings = new Ext.form.FieldSet({
                title: this.settingsTitle,
                autoHeight: true,
				labelWidth: 80,
                items: [{
						xtype: 'textfield',
						fieldLabel: this.settingNameTitle,
						width: 200,
						name: this.settingNameTitle,
						value: 'Attribute match-' + new Date().getTime()
					}, {
						xtype: 'colorpickerfield',
						fieldLabel: this.settingColorTitle,
						width: 200,
						name: this.settingColorTitle,
						editable: false,
						value: this.settingColor
					}, {
						xtype: 'combo',
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						resizable: true,
						fieldLabel: this.settingClassificationTitle,
						width: 200,
						name: this.settingClassificationTitle,
						store: this.store,
						value: 'ALL'
				}]
		});
		
		var filterBuilder = new gxp.IDAFilterBuilder({
					// The attributes conrespond to the IDA raste layers (SPM + Habitat)
					// TODO - If/When  possible make it as remote (store/reader) 
					attributes: [
						"bathymetry",
						"dem_slope",
						"dem_aspect",
						"distance_1000m",
						"CHL_spring_2007",
						"CHL_spring_2008",
						"CHL_spring_2009"
					],
					allowBlank: true,
					allowGroups: true
		});
		
		var filter = new Ext.form.FieldSet({
			title: this.filterTitle,
			autoHeight: true,
			labelWidth: 80,
			maxNumberOfGroups: 2,
			items: [
				filterBuilder
			]
		});
		
		var form = new Ext.form.FormPanel({
			border: false,
			autoScroll: true,
			labelAlign: 'left',
			items: [settings, filter]
		});		
	
        var cpanel = new Ext.Panel({
            border: false,
            layout: "fit",
            disabled: false,
            title: this.title,
			bbar: [
			    {
					text: this.reloadLayerText,
					iconCls: "icon-reload-layers",
					handler: function(){
					}
				},
					'->',
				{
					text: this.applyFilterText,
					iconCls: "icon-attribute-apply",
					scope: this,
					handler: function(){
						var f = filterBuilder.getFilter();
						
						var filterFormat = new OpenLayers.Format.Filter();
						var filterOGC = filterFormat.write(f);  
										
						var xmlFormat = new OpenLayers.Format.XML();                  
						filterOGC = xmlFormat.write(filterOGC);
						
					    alert(filterOGC);
					}
				},{
					text: this.resetText,
					iconCls: "icon-attribute-reset",
					scope: this,
					handler: function(){
						filter.removeAll();
						filter.add({
							xtype: "gxp_idafilterbuilder",
							// The attributes conrespont to the IDA raste layers (SPM + Habitat)
							// TODO - If/When  possible make it as remote (store/reader) 
							attributes: [
								"bathymetry",
								"dem_slope",
								"dem_aspect",
								"distance_1000m",
								"CHL_spring_2007",
								"CHL_spring_2008",
								"CHL_spring_2009"
							],
							allowBlank: true,
							allowGroups: true
						});
						filter.doLayout();
						form.getForm().reset();
					}
				}
			],
			items:[form]
        });
		
        config = Ext.apply(cpanel, config || {});
        
        var attributePanel = gxp.plugins.IDAAttribute.superclass.addOutput.call(this, config);

        //Ext.getCmp("idacontrol").setActiveTab(cpanel);
        
        return attributePanel;
    }
});

Ext.preg(gxp.plugins.IDAAttribute.prototype.ptype, gxp.plugins.IDAAttribute);
