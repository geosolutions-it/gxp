/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = FeatureDetails
 */

/** api: (extends)
 *  plugins/FeatureDetails.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: FeatureDetails(config)
 *
 *    Open drawing tools (Feature Details).
 */
gxp.plugins.FeatureDetails = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_feature_details */
    ptype: "gxp_feature_details",
    
    /** api: config[pilotNotesMenuText]
     *  ``String``
     *  Text for pilot notes item (i18n).
     */
    pilotNotesMenuText: "Feature Notes",


    /** api: config[pilotNotesTooltip]
     *  ``String``
     *  Text for pilot notes tooltip (i18n).
     */
    pilotNotesTooltip: "Open drawing tools",

	saveButtonText:"Save",
	saveButtonTooltip:"Save",
	cancelButtonText:"Cancel",
	cancelButtonTooltip:"Discard changes",
	deleteButtonText:"Delete",
	deleteButtonTooltip:"Delete this feature",

    feature: null,
    container: null,
  
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.FeatureDetails.superclass.constructor.apply(this, arguments);
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function() {
	    var self = this;
	    this.saveBtn = new Ext.Button({
	        id: 'saveDetailsBtn',
			text: 'Save',
	        tooltip: this.saveButtonTooltip,
	        iconCls: 'save',
	        disabled: true,
	        handler : this.handleSave,
			scope: this
	    });
	    this.cancelBtn = new Ext.Button(
			 {
			    id: 'cancelDetailsBtn',
				text:'Cancel',
			    tooltip: this.cancelButtonTooltip,
			    iconCls: 'cancel',
			    disabled: true,
			    handler : this.handleCancel,
				scope: this
			  }		
		);
        var panel = gxp.plugins.FeatureDetails.superclass.addOutput.call(this, 
			
			new Ext.FormPanel({
					frame:false,  border:false, labelAlign:'top', 
			        // title:self.pilotNotesMenuText,
					items:[{
                      xtype: 'fieldset',
                      id: 'details-field-set',
                      border:false,
			          items:[
							{   xtype: 'textfield',
				                fieldLabel: 'Name',
								width: 200,
				                name:'loginUsername', 
				                allowBlank:true,
								disabled: true,
								anchor:'100%',
								id:'details-name-textfield'
				            },{  
								xtype: 'textarea',
								width: 200,
								height: 200,
								disabled: true,
				                fieldLabel:'Note', 
				                name:'loginPassword', 
				                allowBlank:true,
								anchor:'100% ',
								id: 'details-description-textfield'
				            },{   xtype: 'numberfield',
						          fieldLabel: 'Latitude',
								  width: 200,
								  decimalPrecision: 5,
								  maxValue:90,
								  minValue:-90,
						          allowBlank:false,
								  disabled: true,
								  hidden:true,
								  anchor:'100%',
								  id:'latitude-textfield'
						    },{   xtype: 'numberfield',
								  fieldLabel: 'Longitude',
								  width: 200,
								  decimalPrecision: 5,
								  maxValue:180,
								  minValue:-180,
								  allowBlank:false,
								  disabled: true,
								  hidden:true,
								  anchor:'100%',
								  id:'longitude-textfield'
							},{
									    xtype: 'compositefield',
									    width: 150,
										anchor:'100%',
									    items: [
									        {
												id:'details-date-textfield',
									            xtype     : 'datefield',
												allowBlank:true,
												editable: false,
												format:"d/m/Y",
									            fieldLabel: 'Day',
												width:100,
												anchor:'100%',
												disabled:true
									        },
									        {
												id:'details-time-textfield',
									            xtype     : 'timefield',
												allowBlank:true,
									            fieldLabel: 'Time',
												editable: true,
												format: 'H:i:s',
												width:80,
												//anchor:'100%',
												disabled:true
									        }
									    ]
									}
					
					   ]
					}] ,
			       buttons:[  this.saveBtn, this.cancelBtn ]
			    })
	
			);
		
		// register to listen "addgeometry"	event
		this.target.on("featureselected", function selectFeature(container, feature){
			
			self.feature = feature;
			self.container = container;
			
			self.copyFromSelectedToForm( feature );
			
			/*if ( feature.attributes ){
				Ext.getCmp("details-name-textfield").setValue( feature.attributes.name );
				Ext.getCmp("details-description-textfield").setValue( feature.attributes.description );
				Ext.getCmp("details-date-textfield").setValue( feature.attributes.date );
				Ext.getCmp("details-time-textfield").setValue( feature.attributes.time );
			}
			
			if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
				var point = self.feature.geometry.clone(); 
				Ext.getCmp("latitude-textfield").setVisible(true);
				Ext.getCmp("longitude-textfield").setVisible(true);
				Ext.getCmp("latitude-textfield").setValue(  point.x );
				Ext.getCmp("longitude-textfield").setValue( point.y );
			}*/
			
			// enable form
			self.enable();
		});
		this.target.on("featureunselected", function selectFeature(container){
			self.feature = null;
			self.container = null;
			self.disable();
			self.resetForm();
		});
		
		this.target.on("featuresaved", function saveFeature(container, feature){

			if ( self.isChanged()){
				Ext.MessageBox.show({
		           title:'Save Changes?',
		           msg: 'You are leaving a note that has unsaved changes. <br />Would you like to save your changes?',
		           buttons: Ext.MessageBox.YESNO,
		           fn: function(btn){
					 if (btn==='yes'){ // yes
						self.copyFromFormToSelected( self.feature, container );
						self.resetForm();
						self.feature = feature;
						self.container = container;
						self.copyFromSelectedToForm( feature );
					 } else if (btn==='no'){ // no
						self.resetForm();
						self.feature = feature;
						self.container = container;
						self.copyFromSelectedToForm( feature );
					} else {
						// this code should never be reached!
						console.error('something went wrong: ' + btn + ' is not a valid option');
					}
				   },
		           icon: Ext.MessageBox.QUESTION
		       });				
			} else {
				self.resetForm();
				self.feature = feature;
				self.container = container;
				self.copyFromSelectedToForm( feature );
			}

	
			
			/*self.copyFromFormToSelected( self.feature, container );
			
			self.resetForm();
			
			// set the current feature to the selected one
			self.feature = feature;
			self.container = container;
				
			// fill in form with new values
			self.copyFromSelectedToForm( feature );*/
		

		});
		

		
		return panel;
	},
	
	isChanged: function(){
		if (this.feature && this.feature.attributes){
			var name = Ext.getCmp("details-name-textfield").getValue();
			var description = Ext.getCmp("details-description-textfield").getValue();
			var date = Ext.getCmp("details-date-textfield").getValue();
			var time = Ext.getCmp("details-time-textfield").getValue();
			var data = this.feature.attributes;
			return data.name !== name || data.description !== description || data.date !== date || data.time !== time;
		}
		return true;
	},
	
	copyFromSelectedToForm: function(selected){
		if ( selected.attributes ){
			Ext.getCmp("details-name-textfield").setValue( selected.attributes.name );
			Ext.getCmp("details-description-textfield").setValue( selected.attributes.description );
			Ext.getCmp("details-date-textfield").setValue( selected.attributes.date );
			Ext.getCmp("details-time-textfield").setValue( selected.attributes.time );
		}
		
		if ( selected.geometry instanceof OpenLayers.Geometry.Point ){
			var point = selected.geometry.clone(); 
			Ext.getCmp("latitude-textfield").setVisible(true);
			Ext.getCmp("longitude-textfield").setVisible(true);
			Ext.getCmp("latitude-textfield").setValue(  point.x );
			Ext.getCmp("longitude-textfield").setValue( point.y );
		}		
	},
	
	copyFromFormToSelected: function(selected, container){
		var name = Ext.getCmp("details-name-textfield").getValue();
		var description = Ext.getCmp("details-description-textfield").getValue();
		var date = Ext.getCmp("details-date-textfield").getValue();
		var time = Ext.getCmp("details-time-textfield").getValue();
		selected.attributes = { name:name, description:description, date:date, time:time };
		if ( selected.geometry instanceof OpenLayers.Geometry.Point ){
				var latField = Ext.getCmp("latitude-textfield");
				var lngField = Ext.getCmp("longitude-textfield");
				
				
				if ( latField.isValid(false) && lngField.isValid(false) ){
					var point = new OpenLayers.Geometry.Point(latField.getValue(), lngField.getValue());
					// point = point.transform( new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
					selected.geometry.x = point.x;
					selected.geometry.y = point.y;	
					// this.disable();
					// container.saveFeature(selected);
					// this.resetForm();
				} else {
					Ext.Msg.show({
		                   title: 'Cannot save this geometry',
		                   msg: 'Invalid coordinates.',
		                   buttons: Ext.Msg.OK,
		                   icon: Ext.MessageBox.ERROR
		                });
				}
		}		
	},
	
	/** private: method[handleSave]
     *  callback when save button is pressed
     */
	handleSave: function(){
		
		if (this.feature && this.container){
			/*var name = Ext.getCmp("details-name-textfield").getValue();
			var description = Ext.getCmp("details-description-textfield").getValue();
			var date = Ext.getCmp("details-date-textfield").getValue();
			var time = Ext.getCmp("details-time-textfield").getValue();
			this.feature.attributes = { name:name, description:description, date:date, time:time };
			if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
				var latField = Ext.getCmp("latitude-textfield");
				var lngField = Ext.getCmp("longitude-textfield");
				
				
				if ( latField.isValid(false) && lngField.isValid(false) ){
					var point = new OpenLayers.Geometry.Point(latField.getValue(), lngField.getValue());
					// point = point.transform( new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
					this.feature.geometry.x = point.x;
					this.feature.geometry.y = point.y;	
					this.disable();
					this.container.saveFeature(this.feature);
					this.resetForm();
				} else {
					Ext.Msg.show({
		                   title: 'Cannot save this geometry',
		                   msg: 'Invalid coordinates.',
		                   buttons: Ext.Msg.OK,
		                   icon: Ext.MessageBox.ERROR
		                });
				}
					
				
				
			} else {
				this.disable();
				this.container.saveFeature(this.feature);
				this.resetForm();
			}*/
			
			this.copyFromFormToSelected( this.feature, this.container );
			this.container.saveFeature(this.feature);
			// disable form
			this.disable();
		}
	},

	/** private: method[handleCancel]
     *  callback when Cancel Button is pressed
     */
	handleCancel: function(){
		this.disable();
		if (this.feature && this.container){
			this.container.discardUpdates(this.feature);
			this.resetForm();
		}
	},
	
	/** private: method[disable]
     *  disable pilot notes inputs
     */
	disable: function(){
		this.saveBtn.disable();
		this.cancelBtn.disable();
		Ext.getCmp("details-name-textfield").disable();
		Ext.getCmp("details-description-textfield").disable();
		Ext.getCmp("details-date-textfield").disable();
		Ext.getCmp("details-time-textfield").disable();
		Ext.getCmp("latitude-textfield").disable();
		Ext.getCmp("longitude-textfield").disable();
		Ext.getCmp("latitude-textfield").setVisible(false);
		Ext.getCmp("longitude-textfield").setVisible(false);
	},
	
	/** private: method[enable]
     *  enable pilot notes inputs
     */
	enable: function(){
		this.saveBtn.enable();
		this.cancelBtn.enable();
		Ext.getCmp("details-name-textfield").enable();
		Ext.getCmp("details-description-textfield").enable();
		Ext.getCmp("details-date-textfield").enable();
		Ext.getCmp("details-time-textfield").enable();
		Ext.getCmp("latitude-textfield").enable();
		Ext.getCmp("longitude-textfield").enable();
	},
	
	resetForm: function(){
		Ext.getCmp("details-name-textfield").setValue( '' );
		Ext.getCmp("details-description-textfield").setValue( '' );
		Ext.getCmp("details-date-textfield").setValue( '' );
		Ext.getCmp("details-time-textfield").setValue( '' );
		Ext.getCmp("latitude-textfield").setValue( '' );
		Ext.getCmp("longitude-textfield").setValue( '' );
	}
	
	

});

Ext.preg(gxp.plugins.FeatureDetails.prototype.ptype, gxp.plugins.FeatureDetails);
