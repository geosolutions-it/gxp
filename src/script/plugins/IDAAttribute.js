
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
	
	defaultBuilder: {
		// The attributes conrespont to the IDA raste layers (SPM + Habitat)
		// TODO - If/When  possible make it as remote (store/reader) 
		baseURL: "http://localhost:8080/",
		proxy: "/proxy/?url=",
		allowBlank: true,
		allowGroups: true
	},
    
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
		settings.getMetadata = function(){
			var meta = {};
			
			meta.name = this.items.get(0).getValue();
			meta.color = this.items.get(1).getValue();
			meta.classify = this.items.get(2).getValue();
			
			return meta;
		};
		
		var params = this.defaultBuilder;
		params.proxy = this.target.riskData.urlParameters.proxy ? this.target.riskData.urlParameters.proxy : this.target.proxy;
		if(this.target.riskData.urlParameters.capabilitiesURL)
			params.baseURL = this.target.riskData.urlParameters.capabilitiesURL;
		if(this.target.riskData.coveragesSettings)
			params.coveragesSettings = this.target.riskData.coveragesSettings;
		
		var filterBuilder = new gxp.IDAFilterBuilder(params);
		
		var filter = new Ext.form.FieldSet({
			title: this.filterTitle,
			autoHeight: true,
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
			bodyStyle: "padding: 5px",
            disabled: false,
            title: this.title,
			bbar: [
			    {
					text: this.reloadLayerText,
					iconCls: "icon-reload-layers",
					handler: function(){
					    //
						// Find sub components by type and reload the combo store on the fly. 
						//
						var filterFields = filter.findByType("gxp_idafilterfield");
						for(var i=0; i<filterFields.length; i++){
							filterFields[i].items.get(0).store.reload();
						}
					}
				},
					'->',
				{
					text: this.applyFilterText,
					iconCls: "icon-attribute-apply",
					scope: this,
					handler: function(){
						var f = filterBuilder.getFilter();
						
						if(f){
							var filterFormat = new OpenLayers.Format.Filter();
							var filterOGC = filterFormat.write(f);  
											
							var xmlFormat = new OpenLayers.Format.XML();                  
							filterOGC = xmlFormat.write(filterOGC);
							
							alert(filterOGC);
							//var meta = settings.getMetadata(); // to JOIN in the request
						}else{
							Ext.Msg.show({
								title: "Filter Apply",
								msg: "Your filter is empty or not properly formatted!",
								buttons: Ext.Msg.OK,
								icon: Ext.Msg.INFO
							});
						}
					}
				},{
					text: this.resetText,
					iconCls: "icon-attribute-reset",
					scope: this,
					handler: function(){
					    filterBuilder.cleanFilter();
						filter.removeAll();
						
						filterBuilder = new gxp.IDAFilterBuilder(this.defaultBuilder);
						
						filter.add(filterBuilder);
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
