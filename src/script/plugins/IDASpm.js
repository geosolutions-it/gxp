
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
	securityLevelLabelText : 'Security Level',
	applyText: 'Apply',
	resetText: 'Reset',
	
	//end i18n
	
	spatialFilterOptions: {
            lonMax: 90,
            lonMin: -90,
            latMax: 180,
            latMin: -180
    },
	securityLevels: [
		'NATO UNCLASSIFIED',
		'NATO RESTRICTED','NATO RESTRICTED',
		'NATO CONFIDENTIAL','NATO CONFIDENTIAL',
		'NATO SECRET','NATO SECRET',
		'NATO TOP SECRET','NATO TOP SECRET'
	],
	
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
					items: [this.latitudeField]
				},
				this.pointSelectionButton,
				{				
					layout: 'form',
					bodyStyle:'float:right;',
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
			map:map
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

		this.securityLevelCombo=  new Ext.form.ComboBox({
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
		});
		
		
		
		//
		// whole form
		//
		this.spmCreateForm = new Ext.form.FormPanel({
			region:'center',
			layout:'form',
			//autoWidth:true,
			frame: true,
			autoScroll:true,
			defaultType: 'numberfield',
			
			defaults:{
				labelStyle: 'width:170px',
				width: 150
				
			 },
			 bbar: new Ext.Toolbar({
				items:['->',
					{
						xtype: 'button',
						iconCls:'icon-attribute-apply',
						text: this.applyText,
						handler: function(){
							//TODO
							alert("Yet to be implemented");
						}
					},
					{
						xtype: 'button',
						iconCls:'icon-attribute-reset',
						text: this.resetText,
						handler: function(){
							this.spmCreateForm.getForm().reset();
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
				this.seasonCombo,
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
				},
				this.securityLevelCombo
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

		
	}
});

Ext.preg(gxp.plugins.IDASpm.prototype.ptype, gxp.plugins.IDASpm);
