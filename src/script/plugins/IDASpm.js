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
    userInput: "User Input",
	soundPropagationModelParamText: 'Sound Propagation Model param...',
	soundSourcePointText: 'Sound Source Location',
	svpsoundSourcePointText: 'Sound Velocity Profile Location',
	svpUploadDialogTitle: "Sound Velocity Profile",
	sourcedepthLabel : "Source Depth (m)",
	sourcefrequencyLabel : "Source Frequency (kHz)",
	sourcepressurelevelLabel : "Source Pressure Level (dB)",
	modelnameLabel : 'Run Name',
	pointSelectionButtionTip: 'Enable Point Selection',
	seasonLabelText: 'Season',
	//securityLevelLabelText : 'Security Level',
	applyText: 'Run',
	applyMultiText: 'Run All',
	saveText: 'Save SPM',
	resetText: 'Reset',
	spmList: "SPM List",
	spmTooltip: "Show the SPM List",
	spmSaveTooltip: "Save Sound Propagation Model run",
	spmExecuteTooltip: "Execute Sound Propagation Model run/runs",
	spmResetTooltip: "Reset SPM Inputs",
	spmExecuteMessage: "Sound Propagation Model run requests sent.",
	spmSaveMessage: "Sound Propagation Model run <b>{modelName}</b> saved",
	spmXMLImportMsg: "All SPM XML runs are added",
	svpImportMsg: "Sound Velocity Profile successfully imported",
	svpFileMissingMsg: "SVP file is mandatory for \"User Input\" season",
	spmBatchComposerMsg: "Composer Runs",
	composerErrorMsg:"Composer Error",
	removeMsg: "Remove",
	runNameMsg: "Run Name",
	runListFieldSetName: "Run List (Click Run All to START)",
	runListNoRunMsg: "No SPM run to execute",
	composerErrorTitle:"Enter at least two SPM runs to use the composer",
	missingParameterTitle:"Missing Parameters",
	missingParameterMsg:"Please set all mandatory parameters",
	svpFileImportErrorTitle: "SVP Upload Error.",
	svpFileImportErrorMsg: "SVP file is not correctly loaded.",
	xmlRunListImportWinTitle: "Import Runs from XML",
	importRunButton: "Import Runs",
    errorDoubleLayerNameMsg: "A model with this name already exists",
    errorLayerNameMsg: "The model name can not begin with a digit </br>, can not contain blank spaces </br> and can not contain characters '*' ,'%', '-'",
	composerOperationLabelText: "Operation",
	
	advancedTitle: "Advanced Mode",
	advancedTitleA: "Advanced Input 1",
	advancedTitleB: "Advanced Input 2",
	batchModeTitle: "Batch Mode",
	
	tlModelLabelText: "TL Model",
	tlModelEmptyText: "TL Model Selection",
	tlModelStore: [
		"IsoVelocity",
		"Bellhop",
		"RAM"
	],
	/*tlModelIsoVelocity: "IsoVelocity",
	tlModelBellhop: "Bellhop",
	tlModelRAM: "RAM",*/
	
	bottomTypeEmptyText: "Bottom type Selection",
	bottomTypeLabelText: "Bottom Type",
	bottomTypeStore: [
		"Silt",
		"Gravel",
		"Limestone",
		"Basalt"
	],
	
	/*bottomTypeSilt: "Silt",
	bottomTypeGravel: "Gravel",
	bottomTypeLimestone: "Limestone",
	bottomTypeBasalt: "Basalt",*/
	
	qualityEmptyText: "Quality Selection",
	qualityLabelText: "Quality",
	qualityStore: [
		"low",
		"medium",
		"high"
	],	
	/*qualityLow: "low",
	qualityMedium: "medium",
	qualityHigh: "high",*/
	
	maxRangeText: "Max Range",
	maxRangeMin: 0,
	maxRangeMax: 1000,	
	
	//settingColorTitle: 'Color',
	//end i18n
	
	wpsManager: null,
        
	idaAttribute: null,
	
	wfsGrid: "wfsGridPanel",
        
	svpUploader: null,
	
	spmListUploader: null,
	
	svpFile: null,
        
	spatialFilterOptions: {
            lonMax: 180,
            lonMin: -180,
            latMax: 90,
            latMin: -90
        },
    
    /*
     * Object list of queued runs
     */
	runList: [],
	
	/*
	 * Arraystore to display queued runs names 
	 */
	runStore: null,
	
	composerList: [],
	
	modelNameRegEx: "^[0-9]|[./*.%.-]|[. ]",
	
	/*securityLevels: [
		'NATO_UNCLASSIFIED',
		'NATO_RESTRICTED',
		'NATO_CONFIDENTIAL',
		'NATO_SECRET',
		'NATO_TOP_SECRET'
	],*/
    
	batchModeComposerOp: null,
	
	composerOperations: [
		["MIN", "min2"],
		["MAX", "max2"]
	],
	
	compOperation: null,
	
	settingColor: 'FF0000',
        
	runListView: null,
	
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
					    var layer = map.getLayersByName("spm_source")[0];	
						if(layer){
							map.removeLayer(layer);
						}
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
		
	    //
		//latitude and longitude controls
		//
		this.vpPointSelectionButton =new Ext.Button({
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
					  this.vpSelectLonLat.activate();
				  }else{					
					  this.vpSelectLonLat.deactivate();
					    var layer = map.getLayersByName("spm_vp_source")[0];	
						if(layer){
							map.removeLayer(layer);
						}
				  }
			  }
			}
		});
		
	    // velocity profile latitude text field
		this.vplatitudeField = new Ext.form.NumberField({
			fieldLabel: 'Lat',
			name: 'lat',
			allowBlank: true,
			minValue: this.spatialFilterOptions.latMin,
			maxValue: this.spatialFilterOptions.latMax,
			decimalPrecision: 5,
			allowDecimals: true,
			hideLabel : false
		});
		
		// velocity profile longitude text field
		this.vplongitudeField = new Ext.form.NumberField({
			fieldLabel: 'Lon',
			name: 'lon',
			allowBlank: true,
			minValue: this.spatialFilterOptions.lonMin,
            maxValue: this.spatialFilterOptions.lonMax,
		    decimalPrecision: 5,
			allowDecimals: true,
			hideLabel : false
		});
		
	    //Latitude and longitude fieldset: velocity profile  point
		this.vplonLatFieldSet = new Ext.form.FieldSet({
			title: this.svpsoundSourcePointText,
			//checkboxToggle: true,
			//disabled: true,
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
			listeners: {
				scope: this,
				afterrender: function(cmp){
					//cmp.collapse(true);
				},
				beforeexpand: function(p, animate){
					var combo = this.seasonCombo;
					
					if(combo.getValue() != me.userInput){
						return false;
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
					items: [this.vplatitudeField]
				},
				this.vpPointSelectionButton,
				{				
					layout: 'form',
					bodyStyle:'float:right;',
					border: false,
					items: [this.vplongitudeField]
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
			map: map,
			spmPanel: this
		});
		
		//create the click control
		OpenLayers.Control.VPClick = OpenLayers.Class(OpenLayers.Control, {                
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
			latitudeField: this.vplatitudeField,
			longitudeField: this.vplongitudeField,
			vp: true,
			map: map,
			spmPanel: this
		});

		this.selectLonLat = new OpenLayers.Control.Click();		
		this.vpSelectLonLat = new OpenLayers.Control.VPClick();	
		
		map.addControls([this.selectLonLat, this.vpSelectLonLat]);
		
        var me = this;
		
		// season combo
		this.seasonCombo = new Ext.form.ComboBox({
			width: 150,
			allowBlank: false,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender:true,
			fieldLabel:this.seasonLabelText,
			mode:   'local',
			store:  [this.springText,this.summerText,this.fallText,this.winterText, this.userInput],
			value:  this.springText,
			listeners: {
				select: function(combo, record, index){
					if(combo.getValue() == me.userInput){
					    //me.vplonLatFieldSet.enable();
						//me.vplonLatFieldSet.expand();
						
						me.target.tools[me.svpUploader].getWindowPanel({
							winTitle: me.svpUploadDialogTitle,
							submitButton: false,
							width: 380,
							close: function(){
								if(!me.svpFile){
									me.seasonCombo.setValue(me.springText);
									//me.vplonLatFieldSet.collapse();
									//me.vplonLatFieldSet.disable();
								}
							}
						});
					}else{
						//me.vplonLatFieldSet.collapse();
						//me.vplonLatFieldSet.disable();
					}
				}
			}
		});
		
	    // TL Model combo
		this.tlModelCombo = new Ext.form.ComboBox({
			width: 150,
			allowBlank: true,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender: true,
			emptyText: this.tlModelEmptyText,
			fieldLabel: this.tlModelLabelText,
			mode: 'local',
			value: this.tlModelStore[0],
			store: this.tlModelStore,
			listeners: {
				select: function(combo, record, index){
				}
			}
		});
		
	    // Bottom Type combo
		this.bottomTypeCombo = new Ext.form.ComboBox({
			width: 150,
			allowBlank: true,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender: true,
			emptyText: this.bottomTypeEmptyText,
			fieldLabel: this.bottomTypeLabelText,
			mode: 'local',
			value: this.bottomTypeStore[0],
			store: this.bottomTypeStore,
			listeners: {
				select: function(combo, record, index){
				}
			}
		});
		
	    // Quality Type combo
		this.qualityCombo = new Ext.form.ComboBox({
			width: 150,
			allowBlank: true,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender: true,
			emptyText: this.qualityEmptyText,
			fieldLabel: this.qualityLabelText,
			mode: 'local',
			value: this.qualityStore[0],
			store: this.qualityStore,
			listeners: {
				select: function(combo, record, index){
				}
			}
		});
		
		// Max Range of teh sound 
		this.maxRangeField = new Ext.form.NumberField({
			fieldLabel: this.maxRangeText,
			name: 'maxrange',
			allowBlank: true,
			minValue: this.maxRangeMin,
            maxValue: this.maxRangeMax,
		    decimalPrecision: 5,
			allowDecimals: true,
			hideLabel : false
		});
           
		this.batchModeComposerOp =  new Ext.form.ComboBox({
			width: 150,
			forceSelection: true,
			editable: false,
			triggerAction: 'all',
			lazyRender:true,
			allowBlank: false,
			disabled: true,
			fieldLabel: this.composerOperationLabelText,
			displayField: 'name',
			mode: 'local',
			listeners: {
				select: function(cb, record, index) {
					me.compOperation= record.get('value');    
				}
			},
			store: new Ext.data.ArrayStore({
				fields: ['name', 'value'],
				data :  me.composerOperations
			})/*,
			value: me.composerOperations[0][0]*/
	    });
		
		//
		// whole form
		//                
		this.runStore=new Ext.data.ArrayStore({
			fields: ['name'],
			data : []
		});
		
		this.runListView = new Ext.list.ListView({
			store: this.runStore,
			multiSelect: false,
			id:'runListView',
			emptyText: me.runListNoRunMsg,
			reserveScrollOffset: true,
			removeRecord:function(name){
				me.removeRun(name);
			},
			columns: [{
				header: me.runNameMsg,
				width: .6,
				dataIndex: 'name'
			},{
			  //  header: 'Run Name',
				width: .4,
				tpl: new Ext.XTemplate(
					'<a onclick=\"Ext.getCmp(\'runListView\').removeRecord(\'{name}\')\">' + me.removeMsg + '<a>'
				)			  
			}]
		});
                
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
				items:[{
					xtype: 'button',
					iconCls:'spm-list-show',
					text: this.spmList,
					tooltip: this.spmTooltip,
					handler: function(){
						this.activateSPMList();
					},
					scope:this
				}, '->',
			    {
					xtype: 'button',
					iconCls:'icon-attribute-add',
					text: this.saveText,
					id: "saveSPM",
					tooltip: this.spmSaveTooltip,
					handler: function(){
                        var modelName = this.addFormRun();
                        Ext.getCmp("modelName_Cmp").setValue("");
                        Ext.getCmp("batchMode_fieldSet").expand(false);
                        // change button text if there 2 or more batch in queue (runList)
                        if(me.runList.length > 1)
                            Ext.getCmp("executeSPM").setText(me.applyMultiText);
                        if(modelName){
                            //this.spmCreateForm.getForm().reset();
                            var layer = map.getLayersByName("spm_source")[0];	
                            if(layer){
                                map.removeLayer(layer);
                            }
                            
                            layer = map.getLayersByName("spm_vp_source")[0];	
                            if(layer){
                                map.removeLayer(layer);
                            }
                            	  
                            var template = new Ext.XTemplate(
                                this.spmSaveMessage
                            );
                            this.showMsgTooltip(template.apply({
                                modelName : modelName
                            }));
                        }         
					},
					scope: this
			    },{
					  xtype: 'button',
					  iconCls:'icon-attribute-apply',
					  text: this.applyText,
					  id: "executeSPM",
					  tooltip: this.spmExecuteTooltip,
					  handler: function(){
							me=this;
							var composer=this.spmCreateForm.getForm().getFieldValues(true)["batch_mode_composer"];
							var wfsgrid= this.target.tools[this.wfsGrid];
							wfsgrid.resetFilter();
							var wps = this.target.tools[this.wpsManager];
							
							var spmExecIndex=0;
							var spmExecNum=me.runList.length;
							if(spmExecNum > 0){
							   var callbackSPM= function(response){
									wfsgrid.setPage(1);
									var recordIndex=me.runStore.find("name", me.runList[spmExecIndex].inputs.modelName.value);
									if(recordIndex !=  -1)
										me.runStore.remove(me.runStore.getAt( recordIndex )); 
									
									spmExecIndex++;
									var fc = new OpenLayers.Format.XML().read(response);
									var layerName=OpenLayers.Util.getXmlNodeValue(OpenLayers.Ajax.getElementsByTagNameNS(fc, "http://www.opengis.net/gml","gml", "layerName")[0]);
									var wsName=OpenLayers.Util.getXmlNodeValue(OpenLayers.Ajax.getElementsByTagNameNS(fc, "http://www.opengis.net/gml","gml", "wsName")[0]);
								    
									/* var layerName = fc.getElementsByTagName("gml:layerName")[0].childNodes[0].nodeValue; 
									var wsName = fc.getElementsByTagName("gml:wsName")[0].childNodes[0].nodeValue;  */
									
								    if(!layerName){
									  var wpsError = new OpenLayers.Format.WPSExecute().read(response);
										if(wpsError && wpsError.executeResponse){
											var ex=wpsError.executeResponse.status.exception.exceptionReport.exceptions[0];
											if(ex)
											Ext.Msg.show({
												title:"SPM: " + ex.code,
												msg: ex.texts[0] ,
												buttons: Ext.Msg.OK,
												icon: Ext.MessageBox.ERROR
											});
										}
								    }
									 
									if(composer){
									   me.composerList.push(wsName+":"+layerName);    
									}
									if(spmExecIndex< spmExecNum)
										wps.execute("gs:IDASoundPropagationModel",
											me.runList[spmExecIndex],callbackSPM);											
									else{
										me.runList= null;
										delete me.runList;
										me.runList= new Array();
										if(composer){
										   var idaAttribute = this.target.tools[me.idaAttribute]; 
										   var wpsRasterAlgebra= idaAttribute.target.tools[idaAttribute.wpsManager];
										   var wfsRAGrid= idaAttribute.target.tools[idaAttribute.wfsGrid];
										   
										   var now = new Date();
										   var idaComposerRun=idaAttribute.getRARun({
											   inputs:{
												   name: "batch_"+ now.format("Y_m_d_H_i"),
												   classify: "NONE",
												   wsName: spm.wsName,
												   styleName: "spm",
												   attributeFilter: me.compOperation +"(" + me.composerList +")"
											   }
										   });
										    wpsRasterAlgebra.execute(idaAttribute.wpsProcess,idaComposerRun,function(response){
											me.composerList= null;
											delete me.composerList;
											me.composerList= new Array();   
											wfsRAGrid.refresh();
											var fc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
											var fid = fc.getElementsByTagName("gml:ftUUID")[0];  
											if(!fid){
												var wpsError=new OpenLayers.Format.WPSExecute().read(response);
													if(wpsError){
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
											wfsRAGrid.refresh();         
										 });
										 
										 idaAttribute.activateRasterAlgebraList(true);
										}
									}    
							   };
							   
							   wps.execute("gs:IDASoundPropagationModel",me.runList[spmExecIndex],callbackSPM);
							   me.activateSPMList(true);
							}else{
								if(!composer){
								   if(me.addFormRun()){
										Ext.getCmp("modelName_Cmp").setValue("");
										wps.execute("gs:IDASoundPropagationModel", me.runList[0],
											function(response){
                                                wfsgrid.setPage(1);
												var fc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
												var fid = fc.getElementsByTagName("gml:ftUUID")[0];  
												//me.composerList.push(fid);
												if(!fid){
													var wpsError=new OpenLayers.Format.WPSExecute().read(response);
													if(wpsError && wpsError.executeResponse.status){
															var ex = wpsError.executeResponse.status.exception.exceptionReport.exceptions[0];
															if(ex)
															Ext.Msg.show({
																title:"SPM: " + ex.code,
																msg: ex.texts[0] ,
																buttons: Ext.Msg.OK,
																icon: Ext.MessageBox.ERROR
															});
													}
												}												 
											}
										);  
										
									    // Do not wait, remove the running instance from the pending list
                                        var recordIndex=me.runStore.find("name", me.runList[spmExecIndex].inputs.modelName.value);
                                        
                                        if(recordIndex !=  -1)
                                            me.runStore.remove(me.runStore.getAt( recordIndex )); 
                                            
                                        me.runList= null;
                                        delete me.runList;
                                        me.runList= new Array();   
							    
									    ////
									    

										me.activateSPMList(true);
									    // I have to wait a little time for geostore to have data
									    setTimeout(function() {
									        wfsgrid.setPage(1);
									        wfsgrid.refresh();
									        }
									        ,1000
									    );
									}
								}else{
									Ext.Msg.show({
										title:this.composerErrorTitle,
										msg: this.composerErrorMsg,
										buttons: Ext.Msg.OK,
										icon: Ext.MessageBox.ERROR
									});
								}								
							}                                                           
					   },
					   scope: this
					},{
					   xtype: 'button',
					   iconCls:'icon-attribute-reset',
					   text: this.resetText,
					   tooltip: this.spmResetTooltip,
					   handler: function(){
							this.spmCreateForm.getForm().reset();
							this.svpFile = null;
							
							var layer = map.getLayersByName("spm_source")[0];	
							if(layer){
								map.removeLayer(layer);
							}
							
							layer = map.getLayersByName("spm_vp_source")[0];	
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
				this.vplonLatFieldSet,
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
						},
						this.tlModelCombo,
						this.bottomTypeCombo,
						this.qualityCombo,
						this.maxRangeField,
						{
							fieldLabel: this.modelnameLabel,
							name: 'modelname',
							id: "modelName_Cmp",
							xtype: 'textfield',
							listeners: {
								"change": function (field, newValue, oldValue){
									var layerPat = new RegExp(me.modelNameRegEx);
									
									if(layerPat.test(newValue)){
										 field.markInvalid(me.errorLayerNameMsg);
									}
								}   
							},
							allowBlank:false
						}/*,
						this.securityLevelCombo*/
					]
				},/*{
					xtype: "fieldset",
					title: "Sound Velocity Profile",
					id: "svp_fieldSet",
					autoHeight: true,
					hidden: true,
					autoWidth:true,
					items: [
					   this.target.tools[this.svpUploader].getPanel({submitButton: false})
					]
				},*/
				{				
					xtype: "fieldset",
					title: this.advancedTitle,
					id: "advMod_fieldSet",
					autoHeight: true,
					hidden: false,
					autoWidth:true,
					collapsed: true,
					checkboxToggle: true,
					items: [{
					   fieldLabel: this.advancedTitleA,
					   name: 'adv_input_1',
					   xtype: 'textfield',
					   allowBlank:true
					}, {
					    fieldLabel: this.advancedTitleB,
					    name: 'adv_input_2',
						xtype: 'textfield',
					    allowBlank:true
					}]
					},{
						xtype: "fieldset",
						title: this.batchModeTitle,
						id: "batchMode_fieldSet",
						autoHeight: true,
						hidden: false,
						collapsed: true,
						autoWidth:true,
						listeners: {
							"expand": {
							    fn: function (){
							        if(me.runList.length > 1)
							             Ext.getCmp("executeSPM").setText(this.applyMultiText);
    							},
    							scope: this
							},
							"collapse": {
                                fn: function (){
    							    // TODO: cancellare la lista dei batch inseriti
    							    Ext.getCmp("executeSPM").setText(this.applyText);
                                },
                                scope: this
                            }
						},
						checkboxToggle: true,
						items: [
							{
								fieldLabel: this.spmBatchComposerMsg,
								name: 'batch_mode_composer',
								xtype: 'checkbox',
								listeners:{
									 check: function(checkbox,checked){
										 if(checked)
											me.batchModeComposerOp.enable();
										 else
											me.batchModeComposerOp.disable(); 
									 }
								},
								allowBlank:true  
							},
							this.batchModeComposerOp,
						    {
								 xtype: "fieldset",
								 title: me.runListFieldSetName,
								 id: "runList_fieldSet",
								 autoHeight: true,
								 hidden: false,
								 collapsed: false,
								 autoWidth:true,
								 checkboxToggle: false,
								 items: [
								  this.runListView
								 ]
						    }, {
								xtype: 'button',
								iconCls:'icon-attribute-add',
								text: me.importRunButton,
								tooltip: me.xmlRunListImportWinTitle,
								handler: function(){
									me.target.tools[me.spmListUploader].getWindowPanel({
										winTitle: me.xmlRunListImportWinTitle,
										submitButton: true,
										width: 380
									});
								},
								scope:this
							}/*,this.target.tools[this.spmListUploader].getPanel({submitButton: false})*/
						]
					}                         
			]
		});
        
        this.target.tools[this.spmListUploader].setSuccessCallback(
		 function(content){
			var responseObj=new OpenLayers.Format.RunList().read(content);
			var runList= responseObj.runList;
			for(var i=0; i<runList.length; i++){
				me.addRun(runList[i]);
			}
			 if(me.runList.length > 1)
			   Ext.getCmp("executeSPM").setText(me.applyMultiText);
		   
			me.target.tools[me.spmListUploader].closeWindowPanel();
			me.showMsgTooltip(me.spmXMLImportMsg);
		});  
             
        this.target.tools[this.svpUploader].setSuccessCallback(
             function(response){
                 me.target.tools[me.svpUploader].closeWindowPanel();
                 if(response.result.code){
                    me.svpFile=response.result.code;
                    me.showMsgTooltip(me.svpImportMsg);
                    me.seasonCombo.setValue(me.userInput);
					 
					me.vplonLatFieldSet.enable();
					me.vplonLatFieldSet.expand();
                 }else{
                    me.seasonCombo.setValue(me.springText);
					me.vplonLatFieldSet.collapse();
					me.vplonLatFieldSet.disable();
                    Ext.Msg.show({
                      title: this.svpFileImportErrorTitle,
                      msg: this.svpFileImportErrorMsg + this.svpFileMissingMsg,
                      buttons: Ext.Msg.OK,
                      icon: Ext.MessageBox.ERROR
                    }); 
                 }
	    });   
             
        this.target.tools[this.svpUploader].setFailureCallback(
            function(error){
				me.seasonCombo.setValue(me.springText);
				 Ext.Msg.show({
				  title: this.svpFileImportErrorTitle,
				  msg: error + this.svpFileImportErrorMsg + this.svpFileMissingMsg,
				  buttons: Ext.Msg.OK,
				  icon: Ext.MessageBox.ERROR
				}); 
            }        
        );     
             
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
        return spmPanel;
    },
	
    activateSPMList: function(tooltip){
		var wfsgrid = Ext.getCmp(this.wfsGrid);
		var southPanel = Ext.getCmp('south').expand(false);
		var idaLayList = Ext.getCmp('idalaylist').setActiveTab(wfsgrid);
                
		if(tooltip)         
			 this.showMsgTooltip(this.spmExecuteMessage);
		},
        
        showMsgTooltip: function(msg){
          var title="Sound Propagation Model";
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
        },
	
	/**
	 * Updates the fields Latitude and longitude.
	 */
	updateLonLat: function(e){
		var map = this.map;
		var lonlat = map.getLonLatFromPixel(e.xy);
		this.latitudeField.setValue(lonlat.lat);
		this.longitudeField.setValue(lonlat.lon);
	
		var layerName;
	    if(this.vp && this.vp === true)
			layerName = "spm_vp_source";
		else
			layerName = "spm_source";
			
		var layer = map.getLayersByName(layerName)[0];	
		if(layer){
			map.removeLayer(layer);
		}
		
		//var cp = Ext.getCmp("SPMCreateColorPicker");
		var color = this.settingColor; //cp.getValue();
		var style = new OpenLayers.Style({
			pointRadius: 4, // sized according to type attribute
			graphicName: "circle",
			fillColor: color,
			strokeColor: color,
			fillOpacity:0.5,
			strokeWidth:2
		});
		
		layer = new OpenLayers.Layer.Vector(layerName, {
			styleMap: style
		});
		
		var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);	
		var pointFeature = new OpenLayers.Feature.Vector(point);
		layer.addFeatures([pointFeature]);
		layer.displayInLayerSwitcher = true;
		map.addLayer(layer);
	},
	
	addFormRun: function(){
		var layerPat = new RegExp(this.modelNameRegEx);
		var formValues = this.spmCreateForm.getForm().getFieldValues(true);
		if(this.spmCreateForm.getForm().isValid()){
		  if(!(layerPat.test(formValues["modelname"]))){
		      
		      var wfsGridPanel= Ext.getCmp("wfsGridPanel");
		      var all_records = wfsGridPanel.store.getRange();
		      var tot = all_records.length, found = false;
		      for (var i=0; i<tot && !found; i++){
		          if(all_records[i].get('modelName') == formValues["modelname"]){
		              Ext.getCmp("modelName_Cmp").markInvalid(this.errorDoubleLayerNameMsg); 
                      Ext.Msg.show({
                          title:"SPM: " + this.missingParameterTitle,
                          msg:  this.errorDoubleLayerNameMsg,
                          buttons: Ext.Msg.OK,
                          icon: Ext.MessageBox.ERROR
                      }); 
                      return null;
		          }
              }
		                   
		      
		      if(!formValues["modelname"]){
                  Ext.getCmp("modelName_Cmp").markInvalid(this.errorDoubleLayerNameMsg); 
                  Ext.Msg.show({
                      title:"SPM: " + this.missingParameterTitle,
                      msg:  this.errorDoubleLayerNameMsg,
                      buttons: Ext.Msg.OK,
                      icon: Ext.MessageBox.ERROR
                  }); 
		      }
		      
		      
		      
    		  if((this.seasonCombo.getValue() == this.userInput && this.svpFile)
    				|| this.seasonCombo.getValue() != this.userInput){
    				
    				var infoRun= {};
    				infoRun.inputs={};
    					
    				var lat = this.latitudeField.getValue();
    				var lon = this.longitudeField.getValue();
    				
    				var vplat = this.vplatitudeField.getValue();
    				var vplon = this.vplongitudeField.getValue();
    				
    				var advValues="";
    				   
    				infoRun.inputs["soundVelocityProfile"]={};
    				infoRun.inputs["soundVelocityProfile"].value = this.svpFile; 
    				
    				if(vplat != ""){
    				  infoRun.inputs["soundVelocityProfile_lat"]={}; 
    				  infoRun.inputs["soundVelocityProfile_lat"].value = vplat;
    				}
    				
    				if(vplon != ""){
    				  infoRun.inputs["soundVelocityProfile_lon"]={}; 
    				  infoRun.inputs["soundVelocityProfile_lon"].value = vplon;
    				}
    				
    				infoRun.inputs.season={};
    				infoRun.inputs.season.value=this.seasonCombo.getValue();
    				
    				if(formValues["sourcepressurelevel"]){
    					infoRun.inputs["sourcePressureLevel"]={};
    					infoRun.inputs["sourcePressureLevel"].value=formValues["sourcepressurelevel"];   
    				}
    				
    				if(formValues["sourcedepth"]){
    					infoRun.inputs["sourceDepth"]={};
    					infoRun.inputs["sourceDepth"].value=formValues["sourcedepth"];   
    				}
    							   
    				if(formValues["sourcefrequency"]){
    				  infoRun.inputs["sourceFrequency"]={};    
    				  infoRun.inputs["sourceFrequency"].value=formValues["sourcefrequency"];
    				}
    				   
    				infoRun.inputs.tlmodel={};
    				infoRun.inputs.tlmodel.value=this.tlModelCombo.getValue();
    				
    				infoRun.inputs.bottomtype={};
    				infoRun.inputs.bottomtype.value=this.bottomTypeCombo.getValue();
    				
    				infoRun.inputs.quality={};
    				infoRun.inputs.quality.value=this.qualityCombo.getValue();
    				
    				if(formValues["maxrange"]){
    				  infoRun.inputs["maxrange"]={};   
    				  infoRun.inputs["maxrange"].value=formValues["maxrange"];
    				}
    				
    				if(formValues["modelname"]){
    				  infoRun.inputs["modelName"]={};   
    				  infoRun.inputs["modelName"].value=formValues["modelname"];
    				}
    			   
    				if(lat!=""){
    				  infoRun.inputs["soundSourcePoint_lat"]={}; 
    				  infoRun.inputs["soundSourcePoint_lat"].value=lat;
    				}
    				   
    				if(lon!=""){
    				  infoRun.inputs["soundSourcePoint_lon"]={};
    				  infoRun.inputs["soundSourcePoint_lon"].value=lon; 
    				}
    				
    				/* Set adv Values*/
    				var i=0;
    				while(i<formValues["adv_input_"+i]){
    					advValues+=formValues["adv_input_"+i];
    					i++;
    				}
    
    				if(advValues!=""){
    				  infoRun.inputs["advParams"]={};
    				  infoRun.inputs["advParams"].value=advValues.substr(0, advValues.length-1); 
    				}
    
    				this.addRun(infoRun);
    
    				return formValues["modelname"];		   
    			}
		  }else{
			  Ext.getCmp("modelName_Cmp").markInvalid(this.errorLayerNameMsg); 
			  Ext.Msg.show({
				  title:"SPM: " + this.missingParameterTitle,
				  msg:  this.errorLayerNameMsg,
				  buttons: Ext.Msg.OK,
				  icon: Ext.MessageBox.ERROR
			  }); 
		   }
		 }else{
			 Ext.Msg.show({
				  title:"SPM: " + this.missingParameterTitle,
				  msg:  this.missingParameterMsg,
				  buttons: Ext.Msg.OK,
				  icon: Ext.MessageBox.ERROR
			});
		 }
			
	    return null;
    },
            
	addRun: function(infoRun){
		var inputs = infoRun.inputs;
		var today = new Date();
		var currentDate = today.toISOString();
		 
		var requestObj = {
		type: "raw",
		inputs:{
			/*octaveExecutablePath: [new OpenLayers.WPSProcess.LiteralData({
				value:spm.octaveExecutablePath
			}),new OpenLayers.WPSProcess.LiteralData({
			   value:spm.octaveExecutablePath
			})],
			octaveConfigFilePath: new OpenLayers.WPSProcess.LiteralData({
				value:spm.octaveConfigFilePath
			}),*/
			
			userId: new OpenLayers.WPSProcess.LiteralData({
				value:spm.userId
			}),
									
			outputUrl: new OpenLayers.WPSProcess.LiteralData({
				value:spm.outputUrl
			}),
			
			runBegin: new OpenLayers.WPSProcess.LiteralData({
				value:currentDate
			}),
			
			/*runEnd: new OpenLayers.WPSProcess.LiteralData({
				value:currentDate
			}),*/
			
			itemStatus: new OpenLayers.WPSProcess.LiteralData({
				value:spm.itemStatus
			}),
			
			itemStatusMessage: new OpenLayers.WPSProcess.LiteralData({
				value:spm.itemStatusMessage
			}),
			
			wsName: new OpenLayers.WPSProcess.LiteralData({
				value:spm.wsName
			}),
			
			styleName: new OpenLayers.WPSProcess.LiteralData({
				value:spm.styleName
			}),
				
			/*storeName: new OpenLayers.WPSProcess.LiteralData({
				value:spm.storeName
			}),
			layerName: new OpenLayers.WPSProcess.LiteralData({
				value:spm.layerName
			}),*/
			/*securityLevel: new OpenLayers.WPSProcess.LiteralData({
								 value: 'NATO_UNCLASSIFIED' //this.securityLevelCombo.getValue()
			}),*/
			/*srcPath: new OpenLayers.WPSProcess.LiteralData({
				value:spm.srcPath
			}),*/
			
			season: new OpenLayers.WPSProcess.LiteralData({
				value:inputs['season'].value.toLowerCase()
			})
		},
		outputs: [{
			identifier: "result",
			mimeType: "text/xml; subtype=wfs-collection/1.0"
			}]
		};

		if(inputs['sourceDepth'])
			requestObj.inputs.sourceDepth= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['sourceDepth'].value
		});
					
		if(inputs['soundVelocityProfile'])
			requestObj.inputs.soundVelocityProfile= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['soundVelocityProfile'].value
		});
		
		if(inputs['soundVelocityProfile_lat'] && inputs['soundVelocityProfile_lon'])
			requestObj.inputs.svpSourceUnit=new OpenLayers.WPSProcess.ComplexData({
				value: "POINT("+inputs['soundVelocityProfile_lon'].value+" "+inputs['soundVelocityProfile_lat'].value+")",
				mimeType: "application/wkt"
		});
					
		if(inputs['advParams'])
			requestObj.inputs.soundVelocityProfile= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['advParams'].value
		})
						
		if(inputs['sourcePressureLevel'])
			requestObj.inputs.sourcePressureLevel= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['sourcePressureLevel'].value
		});
						
		if(inputs["sourceFrequency"])
			requestObj.inputs.sourceFrequency= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['sourceFrequency'].value
		});

		if(inputs["tlmodel"])
			requestObj.inputs.tlModel= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['tlmodel'].value
		});
		
		if(inputs["bottomtype"])
			requestObj.inputs.bottomType= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['bottomtype'].value
		});
		
		if(inputs["quality"])
			requestObj.inputs.quality= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['quality'].value
		});
		
		if(inputs["maxrange"])
			requestObj.inputs.maxRange= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['maxrange'].value
		});
			
		if(inputs["modelName"])
			requestObj.inputs.modelName= new OpenLayers.WPSProcess.LiteralData({
				value:inputs['modelName'].value
		});

		if(inputs['soundSourcePoint_lat'] && inputs['soundSourcePoint_lon'])
			requestObj.inputs.soundSourceUnit=new OpenLayers.WPSProcess.ComplexData({
				value: "POINT("+inputs['soundSourcePoint_lon'].value+" "+inputs['soundSourcePoint_lat'].value+")",
				mimeType: "application/wkt"
		});
			
		this.runList.push(requestObj);  
		
		this.runStore.add(new this.runStore.recordType({
			name: inputs['modelName'].value
		}));
	},	
         
	removeRun: function (name){
		var recordIndex=this.runStore.find("name", name);
		
		// remove run from list
		for (var u = 0; u < this.runList.length; u++) {
			if(this.runList[u].inputs.modelName.value == name){
				this.runList.splice(u,1); 
				break;
			} 
		}
        if(this.runList.length <= 1)
            Ext.getCmp("executeSPM").setText(this.applyText);

		// remove name from GUI
		if(recordIndex !=  -1)
            this.runStore.remove(this.runStore.getAt( recordIndex ));  
	}
});

Ext.preg(gxp.plugins.IDASpm.prototype.ptype, gxp.plugins.IDASpm);