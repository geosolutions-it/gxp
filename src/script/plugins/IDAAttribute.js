
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
    
    id: null,

    title: "Layer Attribute",
	
	settingsTitle: "Base Settings",
    rasterAlgebraExecuteMessage: "Raster Algebra run request sent.",
	settingNameTitle: "Name",
	settingColorTitle: "Color",
	settingClassificationTitle: "Classification",
    filterApplyTitle: "Filter Apply",
	filterApplyMsg: "Your filter is empty or not properly formatted!",
    filterTitle: "Filter",
    reloadLayerText: "Reload Layers",
    applyFilterText: "Run",
	resetText: "Reset",
        
	settingColor: '000000',

        wpsManager: null,
        
        wfsGrid: null,
        
        wpsProcess: "gs:IDARasterAlgebra",
	
	store:[
		'ALL',
		'UNCLASSIFIED',
		'RESTRICTED',
		'CONFIDENTAL',
		'SECRET',
		'TOPSECRET'						
	],
        
        layerNamePrefix: "AttributeMatch",
        
        /** api: config[colorStyles]
        *  ``Array String``
        *  
        */
        colorStyles: null,
	
	defaultBuilder: {
		// The attributes conrespont to the IDA raste layers (SPM + Habitat)
		// TODO - If/When  possible make it as remote (store/reader) 
		baseURL: "http://localhost:8080/",
		//proxy: "/proxy/?url=",
		allowBlank: true,
		allowGroups: true
	},
        
        attributeField: null,
    
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
		/*Ext.override(Ext.Element, {
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
		});*/
        
             var now = new Date();
             this.attributeField= new Ext.form.TextField({
			 xtype: 'textfield',
			 fieldLabel: this.settingNameTitle,
                         readOnly: true,
			 width: 200,
			 name: this.settingNameTitle,
			 value: this.layerNamePrefix + "_" +now.format("Y_m_d_H_i_s")
	       });
	
		var settings = new Ext.form.FieldSet({
                title: this.settingsTitle,
                autoHeight: true,
				labelWidth: 80,
                items: [this.attributeField, {
				xtype: 'combo',
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				resizable: true,
				fieldLabel: this.settingColorTitle,
				width: 200,
				name: this.settingColorTitle,
				store: this.colorStyles,
				value: this.colorStyles[0]
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
		params.proxy = this.target.proxy;
		
		if(this.target.riskData.urlParameters.geoserverURL)
			params.baseURL = this.target.riskData.urlParameters.geoserverURL;
		
		if(this.target.riskData.coveragesSettings)
			params.coveragesSettings = this.target.riskData.coveragesSettings;
                    
                if(this.target.riskData.defualtCoverageSetting)
			params.defualtCoverageSetting = this.target.riskData.defualtCoverageSetting;
                    
               if(this.target.riskData.spmCoverageSetting)
			params.spmCoverageSetting = this.target.riskData.spmCoverageSetting;
               
               if(this.target.riskData.layerAttributeCoverageSetting)
			params.layerAttributeCoverageSetting = this.target.riskData.layerAttributeCoverageSetting;
		
		var filterBuilder = new gxp.IDAFilterBuilder(params);
		
		var filter = new Ext.form.FieldSet({
			title: this.filterTitle,
			autoHeight: true,
			maxNumberOfGroups: 2,
			
			layout:'fit',
			autoScroll:true,
			items: [
				filterBuilder
			]
		});
		
		var form = new Ext.form.FormPanel({
			border: false,
			width: 510,
			autoScroll:true,
			labelAlign: 'left',
			items: [settings, filter]
		});		
	var me=this;
        var cpanel = new Ext.Panel({
            border: false,
			autoScroll: true,
			bodyStyle: "padding: 5px",
            disabled: false,
            title: this.title,
			bbar: [
			    /*{
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
				},*/
					'->',
				{
					text: this.applyFilterText,
					iconCls: "icon-attribute-apply",
					scope: this,
					handler: function(){
						var f = filterBuilder.getFilter();
						
						if(f){
                            var infoRun= {};
                            var now= new Date();
                            me.attributeField.setValue(me.layerNamePrefix + "_" + now.format("Y_m_d_H_i_s"));
                            var wfsGrid= me.target.tools[this.wfsGrid];
                            infoRun.inputs={};
                            infoRun.inputs=settings.getMetadata();
							var filterFormat = new OpenLayers.Format.CQL();
							var filterCQL = filterFormat.write(f);  
                                                        
                            infoRun.inputs.attributeFilter= filterCQL;

                            var wps = me.target.tools[me.wpsManager];
                                                        
                            var runProcess= me.getRARun(infoRun);
                            now= new Date();
                            me.attributeField.setValue(me.layerNamePrefix + "_" + now.format("Y_m_d_H_i_s"));
                                                        
                            wps.execute(me.wpsProcess,runProcess,function(response){
                                wfsGrid.refresh();
                                var fc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
                                var fid = fc.getElementsByTagName("gml:ftUUID")[0];  
                                if(!fid){
                                    var wpsError=new OpenLayers.Format.WPSExecute().read(response);
                                    if(wpsError && wpsError.executeResponse && wpsError.executeResponse.status){
                                          var ex=wpsError.executeResponse.status.exception.exceptionReport.exceptions[0];
                                          if(ex)
                                               Ext.Msg.show({
                                                   title:"Layer Attribute: " + ex.code,
                                                   msg: ex.texts[0] ,
                                                   buttons: Ext.Msg.OK,
                                                   icon: Ext.MessageBox.ERROR
                                               });
                                     }
                                 }    
                                 wfsGrid.refresh();         
                            });
							wfsGrid.refresh();
							
							me.activateRasterAlgebraList(true);
                                                        
						}else{
							Ext.Msg.show({
								title: me.filterApplyTitle,
								msg: me.filterApplyMsg,
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
						filter.maxNumberOfGroups=2;
						
					}
				}
			],
			items:[form]
        });
		
        config = Ext.apply(cpanel, config || {});
        
        var attributePanel = gxp.plugins.IDAAttribute.superclass.addOutput.call(this, config);

        //Ext.getCmp("idacontrol").setActiveTab(cpanel);
        
        return attributePanel;
    },
    
    getRARun: function(infoRun){
             var inputs= infoRun.inputs;
             var today = new Date();
             var currentDate = today.format("Y-m-d\\TH:i:s")+"Z";
             var requestObj = {
			type: "raw",
			inputs:{
                                areaOfInterest: new OpenLayers.WPSProcess.ComplexData({
                                        value: this.target.mapPanel.map.getExtent().toGeometry().toString(),
					mimeType: "application/wkt"
                                }),
				attributeName: new OpenLayers.WPSProcess.LiteralData({
					value:inputs['name']
				}),
				runBegin: new OpenLayers.WPSProcess.LiteralData({
					value:currentDate
				}),
				wsName: new OpenLayers.WPSProcess.LiteralData({
					value:inputs.wsName || rasterAlgebra.wsName
				}),
                                storeName: new OpenLayers.WPSProcess.LiteralData({
				    value:rasterAlgebra.storeName
				}),
                                outputUrl: new OpenLayers.WPSProcess.LiteralData({
					value:rasterAlgebra.outputUrl
				}),
				classification: new OpenLayers.WPSProcess.LiteralData({
					value:inputs['classify']
				}),
                                styleName: new OpenLayers.WPSProcess.LiteralData({
					value: inputs.styleName || "layerattribute_"+inputs['color'].toLowerCase()
				}),
                                /*attributeFilter: new OpenLayers.WPSProcess.ComplexData({
                                        value: inputs['attributeFilter'],
                                        mimeType: "text/plain; subtype=cql"
                                })*/
                                attributeFilter: new OpenLayers.WPSProcess.LiteralData({
                                        value: inputs['attributeFilter']
                                })
				},
			outputs: [{
					identifier: "result",                                 
					mimeType: "text/xml; subtype=wfs-collection/1.0"
                                        
			}]
		};
          
            return requestObj;
         },
         
   activateRasterAlgebraList: function(tooltip){
	var wfsgrid = Ext.getCmp(this.wfsGrid);
	Ext.getCmp('south').expand(false);
	Ext.getCmp('idalaylist').setActiveTab(wfsgrid);
                
       if(tooltip)         
         this.showMsgTooltip(this.rasterAlgebraExecuteMessage);
    },
    
     showMsgTooltip: function(msg){
          var title="Layer Attribute";
          var elTooltop= Ext.getCmp("east").getEl();  
          var t = new Ext.ToolTip({
               floating: {
                          shadow: false
               },
               width: elTooltop.getWidth()-10,
               title: title,
               html: msg,
               hideDelay: 190000,
               closable: true
         });
         t.showAt([elTooltop.getX()+5, elTooltop.getBottom()-100]);
         t.el.slideIn('b');  
    }
});

Ext.preg(gxp.plugins.IDAAttribute.prototype.ptype, gxp.plugins.IDAAttribute);
