/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

// TODO note to other developers
// in this phase I kept FeatureDetails.js and PilotNotes.js separated
// since at the beginning it was not clear how much these functionalities could overlap
// in the future we need to refactor this code and abstract away common features


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

	oldX: null,
	oldY: null,
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
					frame:false,  
					border:false, 
					labelAlign:'top', 
			        title: "Custom Features", //self.pilotNotesMenuText,
					id: this.id,
					tbar: [],
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
												editable: false,
												allowBlank:true,
									            fieldLabel: 'Time',
												// TOFIX readOnly does not allow to select a time!
												// we need to find another way to disallow keyboard editing
												// readOnly: true,
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
		
		this.target.on("featureselected", function selectFeature(container, feature){
			self.disable();
			
			self.oldX = feature.geometry.x;
			self.oldY = feature.geometry.y;
			
			if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
				self.oldX = feature.geometry.x;
				self.oldY = feature.geometry.y;	
			}
			
			self.feature = feature;
			self.container = container;
			
			self.copyFromSelectedToForm( feature );
			
			container.modifyControl.selectFeature(feature);
			
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
			self.oldX = null;
			self.oldY = null;
			self.disable();
			self.resetForm();
		});
		this.target.on("featurechanged", function selectFeature(container, feature){
				if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
					Ext.getCmp("latitude-textfield").setValue(  feature.geometry.x );
					Ext.getCmp("longitude-textfield").setValue( feature.geometry.y );
				}
		});
		
		this.target.on("featurechanged", function selectFeature(container, feature){
				if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
					Ext.getCmp("latitude-textfield").setValue(  feature.geometry.x );
					Ext.getCmp("longitude-textfield").setValue( feature.geometry.y );
				}
		});
		
		this.target.on("featuremultiselected", 
			function selectFeatures(container, feature){
						self.feature = null;
						self.container = null;
						self.oldX = null;
						self.oldY = null;
						self.disable();
						self.resetForm();
		});
		
		this.target.on("featuresaved", function saveFeature(container, feature){

			self.disable();

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
						self.oldX = feature.geometry.x;
						self.oldY = feature.geometry.y;
						self.copyFromSelectedToForm( feature );
						
					 } else if (btn==='no'){ // no
						

						// we need to remove and add again feature to force redrawing in previous position
						container.layer.removeFeatures( [self.feature] );
						
						// reset the original position
						self.feature.geometry.x = self.oldX;
						self.feature.geometry.y = self.oldY;
						
						container.layer.addFeatures( [self.feature] );

						self.resetForm();
						self.feature = feature;
						self.container = container;
						
						self.oldX = feature.geometry.x;
						self.oldY = feature.geometry.y;
						
						self.copyFromSelectedToForm( feature );
					} else {
						// this code should never be reached!
						console.error('something went wrong: ' + btn + ' is not a valid option');
					}
					
					// allow dragging for the new feature
					container.modifyControl.selectFeature(feature);
				
				   },
		           icon: Ext.MessageBox.QUESTION
		       });				
			} else {

				
				self.resetForm();
				self.feature = feature;
				self.container = container;
				
				self.oldX = feature.geometry.x;
				self.oldY = feature.geometry.y;
				
				
				self.copyFromSelectedToForm( feature );
				container.modifyControl.selectFeature(feature);
			}
			
			self.enable();
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
	
	isEqual: function (first, second){
		var eq = false;
		
		if((first == undefined && second == '') || (second == undefined && first == '')){
			eq = true;
		}
		
		if(first == second){
			eq = true;
		}
		return  eq; //first === second || (first === undefined && second === '') || (second === undefined && first === '');
	},
	
	isChanged: function(){
		if (!this.feature.isNew){ 
			var data = this.feature.attributes;
			var name = Ext.getCmp("details-name-textfield").getValue();
			var description = Ext.getCmp("details-description-textfield").getValue();
			var date = Ext.getCmp("details-date-textfield").getRawValue();
			var time = Ext.getCmp("details-time-textfield").getValue();

			if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
				if ( this.oldX !== this.feature.geometry.x || this.oldY !== this.feature.geometry.y)
					return true; // has been moved
			}

			//if ( this.feature.isNew === false ){
				// return	(data.name !== name || data.description !== description || data.date !== date || data.time !== time );	
			
			if((data.name == "" && name == "") || (data.description == "" && description == "") || (data.date == "" && date == "") || (data.time == "" && time == "")){
				return false;
			}
			
				var eq = !this.isEqual(data.name, name) || !this.isEqual(data.description, description) || !this.isEqual(data.date, date) || !this.isEqual(data.time, time );
				return	eq;
			//} 
		}else {
			return false; //( name !== '' || description !== '' || date !== '' || time !== '');
		}

		
		//return true;
		
	},
	
	copyFromSelectedToForm: function(selected){
		if ( selected.attributes ){
			Ext.getCmp("details-name-textfield").setValue( selected.attributes.name );
			Ext.getCmp("details-description-textfield").setValue( selected.attributes.description );
			Ext.getCmp("details-date-textfield").setValue( Date.parseDate(selected.attributes.date, 'd/m/Y') );
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
		
		date = date.format ? date.format('d/m/Y') : date;
		
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
			Ext.Msg.show({
					title: 'Feature saved',
					msg: 'Your changes has been saved successfully.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.INFO
			});
			// this.container.saveFeature(this.feature);
			// this.disable();
		} else {
			// this code should never be reached
			Ext.Msg.show({
					title: 'Cannot save feature',
					msg: 'No feature exists.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
			});
		}
	},

	/** private: method[handleCancel]
     *  callback when Cancel Button is pressed
     */
	handleCancel: function(){

		var self = this;
		Ext.MessageBox.show({
		           title:'Cancel',
		           msg: 'Every changes you made will be lost. <br/>Are you sure?',
		           buttons: Ext.MessageBox.YESNO,
		           fn: function(btn){
						if ( btn === 'yes' ){
							self.disable();
							if (self.feature && self.container){
								self.container.discardUpdates(self.feature);
								self.resetForm();
							}	else {
								// this code should never be reached
								console.error('Something went wrong: no feature selected.');
							}					
						} 

				   },
		           icon: Ext.MessageBox.QUESTION
		       });		
		
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
