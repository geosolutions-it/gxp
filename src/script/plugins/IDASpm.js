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
	soundSourcePointText: 'Sound Source Point',
	sourcedepthLabel : "Source Depth (m)",
	sourcefrequencyLabel : 'Source Frequency (kHz)',
	sourcepressurelevelLabel : 'Source Pressure Level (dB)',
	modelnameLabel : 'Model Name',
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
	//settingColorTitle: 'Color',
	//end i18n
	
	wpsManager: null,
	
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
        
        runList: [],
        runStore: null,
        
        composerList: [],
	
	/*securityLevels: [
		'NATO_UNCLASSIFIED',
		'NATO_RESTRICTED',
		'NATO_CONFIDENTIAL',
		'NATO_SECRET',
		'NATO_TOP_SECRET'
	],*/
	
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
		
                var me=this;
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
			store:  [ this.springText,this.summerText,this.fallText,this.winterText, this.userInput],
			value:  this.springText,
                        listeners: {
                                select: function(combo, record, index){
                                   Ext.getCmp("svp_fieldSet").setVisible(combo.getValue() == me.userInput);
                                }
                        }
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
                            '<a onclick=\"Ext.getCmp(\'runListView\').removeRecord(\'{name}\')\">'+me.removeMsg+'<a>'
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
                                              if(me.runList.length > 1)
                                                Ext.getCmp("executeSPM").setText(me.applyMultiText);
                                              if(modelName){
                                                  //this.spmCreateForm.getForm().reset();
						  var layer = map.getLayersByName("spm_source")[0];	
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
                                                        var wfsGrid= this.target.tools[this.wfsGrid];
                                                        wfsGrid.resetFilter();
                                                        var wps = this.target.tools[this.wpsManager];
                                                        var spmExecIndex=0;
                                                        var spmExecNum=me.runList.length;
                                                        if(spmExecNum > 0){
                                                           var callbackSPM= function(response){
                                                                wfsGrid.setPage(1);
                                                                var recordIndex=me.runStore.find("name", me.runList[spmExecIndex].inputs.modelName.value);
                                                                if(recordIndex !=  -1)
                                                                    me.runStore.remove(me.runStore.getAt( recordIndex )); 
                                                                
                                                                spmExecIndex++;
                                                                var fc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
                                                                       var fid = fc.getElementsByTagName("gml:ftUUID")[0];  
                                                                       if(!fid){
                                                                          var wpsError=new OpenLayers.Format.WPSExecute().read(response);
                                                                               if(wpsError){
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
                                                                   me.composerList.push(fid);    
                                                                }
                                                                if(spmExecIndex< spmExecNum)
                                                                    wps.execute("gs:IDASoundPropagationModel",
                                                                        me.runList[spmExecIndex],callbackSPM);
                                                                        
                                                                else{
                                                                    me.runList= null;
                                                                    delete me.runList;
                                                                    me.runList= new Array();
                                                                }
                                                                    
                                                           };
                                                          wps.execute("gs:IDASoundPropagationModel",me.runList[spmExecIndex],callbackSPM);
                                                           me.activateSPMList(true);
                                                        }else{
                                                            if(!composer){
                                                               if(me.addFormRun()){
                                                                wps.execute("gs:IDASoundPropagationModel",me.runList[0],
                                                                    function(response){
                                                                            me.runList= null;
                                                                            delete me.runList;
                                                                            me.runList= new Array();   
                                                                            wfsGrid.setPage(1);
                                                                            var fc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
                                                                            var fid = fc.getElementsByTagName("gml:ftUUID")[0];  
                                                                            //me.composerList.push(fid);
                                                                            if(!fid){
                                                                            var wpsError=new OpenLayers.Format.WPSExecute().read(response);
                                                                                if(wpsError){
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
                                                                     
                                                                 });      
                                                                  me.activateSPMList(true);
                                                                }else
                                                                    return; 
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
                                                        Ext.getCmp("svp_fieldSet").setVisible(false);
							this.spmCreateForm.getForm().reset();
                                                        this.svpFile= null;
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
                                                        id: "modelName_Cmp",
							xtype: 'textfield',
							allowBlank:false
						}/*,
						this.securityLevelCombo*/
					]
				},{
                                    xtype: "fieldset",
                                    title: "Sound Velocity Profile",
                                    id: "svp_fieldSet",
                                    autoHeight: true,
                                    hidden: true,
                                    autoWidth:true,
                                    items: [
                                       this.target.tools[this.svpUploader].getPanel({submitButton: false})
                                    ]
                                },{
                                    xtype: "fieldset",
                                    title: "Advanced Mode",
                                    id: "advMod_fieldSet",
                                    autoHeight: true,
                                    hidden: false,
                                    autoWidth:true,
                                    collapsed: true,
                                    checkboxToggle: true,
                                    items: [{
					   fieldLabel: "Advanced Input 1",
					   name: 'adv_input_1',
                                           xtype: 'numberfield',
					   allowBlank:true
					}, {
					    fieldLabel: "Advanced Input 2",
					    name: 'adv_input_2',
					    xtype: 'numberfield',
					    allowBlank:true
					}
                                    ]
                                },{
                                    xtype: "fieldset",
                                    title: "Batch Mode",
                                    id: "batchMode_fieldSet",
                                    autoHeight: true,
                                    hidden: false,
                                    collapsed: true,
                                    autoWidth:true,
                                    checkboxToggle: true,
                                    items: [
                                        {
                                         fieldLabel: this.spmBatchComposerMsg,
					 name: 'batch_mode_composer',
                                         xtype: 'checkbox',
					 allowBlank:true  
                                        },
                                       this.target.tools[this.spmListUploader].getPanel({submitButton: true}),
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
                                       }
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
                me.showMsgTooltip(me.spmXMLImportMsg);
             });  
             
        this.target.tools[this.svpUploader].setSuccessCallback(
             function(response){
                this.svpFile=response.result.code;
                me.showMsgTooltip(me.svpImportMsg);
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
	
		var layer = map.getLayersByName("spm_source")[0];	
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
		
		layer = new OpenLayers.Layer.Vector("spm_source",{
			styleMap: style
		});
		
		var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);	
		var pointFeature = new OpenLayers.Feature.Vector(point);
		layer.addFeatures([pointFeature]);
		layer.displayInLayerSwitcher = true;
		map.addLayer(layer);
	},
        
        addFormRun: function(){
            if(this.spmCreateForm.getForm().isValid()){
              if((this.seasonCombo.getValue() == this.userInput && this.svpFile)
                    || this.seasonCombo.getValue() != this.userInput){
                    
                var infoRun= {};
                infoRun.inputs={};
                var formValues=this.spmCreateForm.getForm().getFieldValues(true);	
                var lat=this.latitudeField.getValue();
		var lon=this.longitudeField.getValue();
                var advValues="";
                   
                infoRun.inputs["soundVelocityProfile"]={};
                infoRun.inputs["soundVelocityProfile"].value = this.svpFile; 
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
               
                }else{
                  Ext.getCmp(this.target.tools[this.svpUploader].getInputFileCmpID(0)).markInvalid(this.svpFileMissingMsg); 
               } 
             }
                
         return null;
      },
            
         addRun: function(infoRun){
             var inputs= infoRun.inputs;
             var today = new Date();
             var currentDate = today.format("Y-m-d\\TH:i:s")+"Z";
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
             for (var u = 0; u < this.runList.length; u++) {
                     if(this.runList[u].inputs.modelName == name){
                         this.runList.splice(u,1); 
                         break;
                     } 
             }
             if(recordIndex !=  -1)
               this.runStore.remove(this.runStore.getAt( recordIndex ));  
            
              
         }
});

Ext.preg(gxp.plugins.IDASpm.prototype.ptype, gxp.plugins.IDASpm);