/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDASpm
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDASpm(config)
 *
 */   
gxp.plugins.IDASpm = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_layertree */
    ptype: "gxp_idaspm",
	
	// start i18n
    title: "SPM Create",
	pointSelectionButtonLabel: '',
	springText : "Spring",
	winterText : "Winter",
	fallText : "Fall",
	summerText : "Summer",
	soundPropagationModelParamText: 'Sound Propagation Model param...',
	soundSourcePointText: 'Sound Source Point',
	sourcedepthLabel : "Source Depth (m)",
	sourcefrequencyLabel : 'Source Frequency (kHz)',
	sourcepressurelevelLabel : 'Source Pressure Level (dB)',
	modelnameLabel : 'Model Name',
	pointSelectionButtionTip: 'Enable Point Selection',
	seasonLabelText: 'Season',
	//securityLevelLabelText : 'Security Level',
	applyText: 'Apply',
	resetText: 'Reset',
	//settingColorTitle: 'Color',
	//end i18n
	
	wpsManager: null,
        
	spatialFilterOptions: {
            lonMax: 180,
            lonMin: -180,
            latMax: 90,
            latMin: -90
    },
	
	/*securityLevels: [
		'NATO_UNCLASSIFIED',
		'NATO_RESTRICTED',
		'NATO_CONFIDENTIAL',
		'NATO_SECRET',
		'NATO_TOP_SECRET'
	],*/
	
	settingColor: 'FF0000',
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDASpm.superclass.constructor.apply(this, arguments);
    },
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
		//map 
		var map = this.target.mapPanel.map;
		map.enebaleMapEvent = true;
		
		//
		//latitude and longitude controls
		//
		this.pointSelectionButton =new Ext.Button({
			text: this.pointSelectionButtonLabel,
			tooltip: this.pointSelectionButtionTip,
			enableToggle: true,
			toggleGroup: this.toggleGroup,
			iconCls: 'spm-create-button ',
			cls: 'spm-btn-bottom',
			listeners: {
			  scope: this, 
			  toggle: function(button, pressed) {  
				 if(pressed){                 
					  this.selectLonLat.activate();
				  }else{					
					  this.selectLonLat.deactivate();
				  }
			  }
			}
        });
		//latitude text field
		this.latitudeField = new Ext.form.NumberField({
				fieldLabel: 'Lat',
				name: 'lat',
				allowBlank:false,
			    minValue: this.spatialFilterOptions.latMin,
                maxValue: this.spatialFilterOptions.latMax,
                decimalPrecision: 5,
				allowDecimals: true,
				hideLabel : false
		});
		//longitude text field
		this.longitudeField = new Ext.form.NumberField({
			fieldLabel: 'Lon',
			name: 'lon',
			allowBlank:false,
			minValue: this.spatialFilterOptions.lonMin,
            maxValue: this.spatialFilterOptions.lonMax,
		    decimalPrecision: 5,
			allowDecimals: true,
			hideLabel : false
		});
		//Latitude and longitude fieldset: sound source point
		this.lonLatFieldSet = new Ext.form.FieldSet({
			title: this.soundSourcePointText,
			labelAlign: 'top',
			layout: 'table',
			autoWidth:true,
			layoutConfig: {
                columns: 3,
				tableAttrs: {
					style: {
						width: '100%',
						margin: '0 auto'	
					}
				}
            },
			bodyStyle: 'text-align:center;margin:0 auto;table-layout:auto',
			bodyCssClass: 'spm-center',			
			items: [
				{
					layout: 'form',
					bodyStyle:'float:left;',
					border: false,
					items: [this.latitudeField]
				},
				this.pointSelectionButton,
				{				
					layout: 'form',
					bodyStyle:'float:right;',
					border: false,
					items: [this.longitudeField]
				}
			]
		});
	
		//create the click control
		OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},

			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.trigger
					}, this.handlerOptions
				);
			}, 
			trigger: this.updateLonLat,
			latitudeField: this.latitudeField,
			longitudeField: this.longitudeField,
			map:map,
			spmPanel:this
		});

		this.selectLonLat = new OpenLayers.Control.Click();
		map.addControl(this.selectLonLat);
		
		// season combo
		this.seasonCombo = new Ext.form.ComboBox({
			width: 150,
			allowBlank: false,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender:true,
			fieldLabel:this.seasonLabelText,
			mode: 'local',
			store:  [ this.springText,this.summerText,this.fallText,this.winterText],
			
			
			value:  this.springText
		});

		/*this.securityLevelCombo=  new Ext.form.ComboBox({
			width: 150,
			allowBlank: false,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender:true,
			fieldLabel: this.securityLevelLabelText,
			mode: 'local',
			store:  this.securityLevels,
			
			value: this.securityLevels[0]
		});*/
		
		//
		// whole form
		//
		this.spmCreateForm = new Ext.form.FormPanel({
			region:'center',
			layout: "form",
			frame: false,
			autoScroll:true,
			bodyStyle: "padding: 5px",
			defaults:{
				labelStyle: 'width:170px;',
				width: 150	
			},
			bbar: new Ext.Toolbar({
				items:['->',
					{
						xtype: 'button',
						iconCls:'icon-attribute-apply',
						text: this.applyText,
						handler: function(){
							if(this.spmCreateForm.getForm().isValid()){
								var today = new Date();
								var currentDate= today.getFullYear() + "-" + (today.getMonth()+1) + "-" +today.getDate();

								var wps = this.target.tools[this.wpsManager];
								var formValues=this.spmCreateForm.getForm().getFieldValues(true);
								
								var lat=this.latitudeField.getValue();
								var lon=this.longitudeField.getValue();
					
								var requestObj = {
									/*storeExecuteResponse: false,
									lineage:  false,
									status: false,*/
									type: "raw",
									inputs:{
										octaveExecutablePath: new OpenLayers.WPSProcess.LiteralData({
															value:spm.octaveExecutablePath
										}),
										octaveConfigFilePath: new OpenLayers.WPSProcess.LiteralData({
															value:spm.octaveConfigFilePath
										}),
										userId: new OpenLayers.WPSProcess.LiteralData({
															value:spm.userId
										}),
										
										outputUrl: new OpenLayers.WPSProcess.LiteralData({
															value:spm.outputUrl
										}),
										runBegin: new OpenLayers.WPSProcess.LiteralData({
															value:currentDate
										}),
										runEnd: new OpenLayers.WPSProcess.LiteralData({
															value:currentDate
										}),
										itemStatus: new OpenLayers.WPSProcess.LiteralData({
															value:spm.itemStatus
										}),
										itemStatusMessage: new OpenLayers.WPSProcess.LiteralData({
															value:spm.itemStatusMessage
										}),
										wsName: new OpenLayers.WPSProcess.LiteralData({
															value:spm.wsName
										}),
										storeName: new OpenLayers.WPSProcess.LiteralData({
															value:spm.storeName
										}),
										layerName: new OpenLayers.WPSProcess.LiteralData({
															value:spm.layerName
										}),
										/*securityLevel: new OpenLayers.WPSProcess.LiteralData({
															value:this.securityLevelCombo.getValue()
										}),*/
										srcPath: new OpenLayers.WPSProcess.LiteralData({
															value:spm.srcPath
										}),
										season: new OpenLayers.WPSProcess.LiteralData({
											 value:this.seasonCombo.getValue().toLowerCase()
										})
									},
									outputs: [{
										identifier: "result",
										mimeType: "text/xml; subtype=wfs-collection/1.0"
										//asReference: true,
										//type: "raw"
									}]
								};
								
								if(formValues["sourcepressurelevel"])
									requestObj.inputs.srcPressureLevel= new OpenLayers.WPSProcess.LiteralData({
												value:formValues["sourcepressurelevel"]
									});
								
								if(formValues["sourcefrequency"])
									requestObj.inputs.srcFrequency= new OpenLayers.WPSProcess.LiteralData({
												value:formValues["sourcefrequency"]
									});

								if(formValues["modelname"])
									requestObj.inputs.name= new OpenLayers.WPSProcess.LiteralData({
												value:formValues["modelname"]
									});

								if(lat!="" && lon!="")
									 requestObj.inputs.footprint=new OpenLayers.WPSProcess.ComplexData({
										 value: "POINT("+lon+" "+lat+")",
										 mimeType: "text/xml; subtype=gml/3.1.1"
								});
							
								var executeInstance=wps.execute("gs:IDASoundPropagationModel",requestObj); 
							}
                                                           
						},
                                                scope: this
					},
					{
						xtype: 'button',
						iconCls:'icon-attribute-reset',
						text: this.resetText,
						handler: function(){
							this.spmCreateForm.getForm().reset();
							var layer = map.getLayersByName("spm_source")[0];	
							if(layer){
								map.removeLayer(layer);
							}
						},
						scope:this
					}
				]
				
			}),
			items: [
				/*     
				{	
					region:'north',
					xtype:'panel',
					html:'<div>'+this.soundPropagationModelParamText+'</div>',
					bodyStyle:'margin:5px;padding:5px'
				},
				*/
				this.lonLatFieldSet,
				{
					xtype:'fieldset',
					autoWidth:true,
					layout:'form',
					defaultType: 'numberfield',
					bodyStyle:'padding:5px',
					defaults:{				
						width: 150	
						
					 },
					items:[
						this.seasonCombo,
						/*{
							name: 'color',
							xtype: 'colorpickerfield',
							id: 'SPMCreateColorPicker',
							fieldLabel: this.settingColorTitle,
							name: this.settingColorTitle,
							editable: false,
							value: this.settingColor
						},*/
						{
							fieldLabel: this.sourcedepthLabel,
							name: 'sourcedepth',
							allowBlank:false
						},{
							fieldLabel: this.sourcefrequencyLabel,
							name: 'sourcefrequency',
							allowBlank:false
						},{
							fieldLabel: this.sourcepressurelevelLabel,
							name: 'sourcepressurelevel',
							allowBlank:false
						}, {
							fieldLabel: this.modelnameLabel,
							name: 'modelname',
							xtype: 'textfield',
							allowBlank:false
						}/*,
						this.securityLevelCombo*/
					]
				}
			]
		});
		
        var cpanel = new Ext.Panel({
            border: false,
            layout: "border",
            disabled: false,
			autoScroll:false,
            title: this.title,
			items: [
				this.spmCreateForm
			]
        });
        
        config = Ext.apply(cpanel, config || {});
        
        var spmPanel = gxp.plugins.IDASpm.superclass.addOutput.call(this, config);

        //Ext.getCmp("idacontrol").setActiveTab(cpanel);
        
        return spmPanel;
    },
	/**
	 * Updates the fields Latitude and longitude.
	 */
	updateLonLat: function(e){
		var map = this.map;
		var lonlat = map.getLonLatFromPixel(e.xy);
		this.latitudeField.setValue(lonlat.lat);
		this.longitudeField.setValue(lonlat.lon);
	
		var layer = map.getLayersByName("spm_source")[0];	
		if(layer){
			map.removeLayer(layer);
		}
		
		var cp = Ext.getCmp("SPMCreateColorPicker");
		var color = "#"+ cp.getValue();
		var style = new OpenLayers.Style({
			pointRadius: 4, // sized according to type attribute
			graphicName: "circle",
			fillColor: color,
			strokeColor: color,
			fillOpacity:0.5,
			strokeWidth:2
		});
		
		layer = new OpenLayers.Layer.Vector("spm_source",{
			styleMap: style
		});
		
		var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);	
		var pointFeature = new OpenLayers.Feature.Vector(point);
		layer.addFeatures([pointFeature]);
		layer.displayInLayerSwitcher = true;
		map.addLayer(layer);
	}
});

Ext.preg(gxp.plugins.IDASpm.prototype.ptype, gxp.plugins.IDASpm);