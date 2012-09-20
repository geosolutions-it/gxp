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
 *  class = PilotNotes
 */

/** api: (extends)
 *  plugins/PilotNotes.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: PilotNotes(config)
 *
 *    Open drawing tools (Pilot Notes).
 */
gxp.plugins.PilotNotes = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_pilot_notes */
    ptype: "gxp_pilot_notes",
    
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
        gxp.plugins.PilotNotes.superclass.constructor.apply(this, arguments);
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function() {
	    var self = this;
	    this.saveBtn = new Ext.Button({
	        id: 'saveBtn',
			text: 'Save',
	        tooltip: this.saveButtonTooltip,
	        iconCls: 'save',
	        disabled: true,
	        handler : this.handleSave,
			scope: this
	    });
	    this.cancelBtn = new Ext.Button(
			 {
			    id: 'cancelBtn',
				text: 'Cancel',
			    tooltip: this.cancelButtonTooltip,
			    iconCls: 'cancel',
			    disabled: true,
			    handler : this.handleCancel,
				scope: this
			  }		
		);
        var panel = gxp.plugins.PilotNotes.superclass.addOutput.call(this, 
			// TODO crea un widget
			new Ext.FormPanel({
					frame:false,  border:false, labelAlign:'top', 
			        // title:self.pilotNotesMenuText,
					items:[{
                      xtype: 'fieldset',
                      id: 'field-set',
                      border:false,
			          items:[
							{   xtype: 'textfield',
				                fieldLabel: 'Name',
								width: 200,
				                name:'loginUsername', 
				                allowBlank:false,
								disabled: true,
								anchor:'100%',
								id:'name-textfield'
				            },{  
								xtype: 'textarea',
								width: 200,
								height: 200,
								disabled: true,
				                fieldLabel:'Note', 
				                name:'loginPassword', 
				                allowBlank:false,
								anchor:'100%',
								id: 'description-textfield'
				            },	{   xtype: 'numberfield',
							          fieldLabel: 'Latitude',
									  width: 200,
									  decimalPrecision: 5,
									  maxValue:90,
									  minValue:-90,
							          allowBlank:false,
									  disabled: true,
									  hidden:true,
									  anchor:'100%',
									  id:'pn-latitude-textfield'
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
									  id:'pn-longitude-textfield'
								},
							{
							    xtype: 'compositefield',
							    width: 150,
								anchor:'100%',
							    items: [
							        {
										id:'date-textfield',
							            xtype     : 'datefield',
										allowBlank:false,
										editable: false,
										format:"d/m/Y",
							            fieldLabel: 'Day',
										width:100,
										anchor:'100%',
										disabled:true
							        },
							        {
										id:'time-textfield',
							            xtype     : 'timefield',
										allowBlank:false,
							            fieldLabel: 'Time',
										editable: true,
										format: 'H:i:s',
										width:80,
										//anchor:'100%',
										disabled:true
							        }
							    ]
							},{   xtype: 'textfield',
						                fieldLabel: 'Vehicle',
										allowBlank:false,
										width: 200,
						                allowBlank:true,
										id:'vehicle-textfield',
										anchor:'100%',
										disabled:true
						     }
					
					   ]
					}],
			       buttons:[  this.saveBtn, this.cancelBtn ]
			    })
	
			);
		
		this.target.on("notefeatureselected", function selectFeature(container, feature){
			
			self.feature = feature;
			self.container = container;
			
			self.copyFromSelectedToForm( feature );
			
			/*self.feature = feature;
			self.container = container;
			if ( feature.attributes ){
				Ext.getCmp("name-textfield").setValue( feature.attributes.name );
				Ext.getCmp("description-textfield").setValue( feature.attributes.description );
				Ext.getCmp("date-textfield").setValue( feature.attributes.date );
				Ext.getCmp("time-textfield").setValue( feature.attributes.time );
				Ext.getCmp("vehicle-textfield").setValue( feature.attributes.vehicle );
			}
			
			if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
				var point = self.feature.geometry.clone(); 
				Ext.getCmp("pn-latitude-textfield").setVisible(true);
				Ext.getCmp("pn-longitude-textfield").setVisible(true);
				Ext.getCmp("pn-latitude-textfield").setValue(  point.x );
				Ext.getCmp("pn-longitude-textfield").setValue( point.y );
			}*/
			
			
			self.enable();
		});
		this.target.on("notefeatureunselected", function selectFeature(container){
			self.feature = null;
			self.container = null;
			self.disable();
			self.resetForm();
		});
		
		this.target.on("notefeaturesaved", function saveFeature(container, feature){

			// se il form non è valido, annulla la selezione
			// container.undoSelection(feature, self.feature);
		
			
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

			});		
		
		return panel;
	},
	
	isChanged: function(){
		if (this.feature && this.feature.attributes){
			var name = Ext.getCmp("name-textfield").getValue();
			var description = Ext.getCmp("description-textfield").getValue();
			var date = Ext.getCmp("date-textfield").getValue();
			var time = Ext.getCmp("time-textfield").getValue();
			var vehicle  = Ext.getCmp("vehicle-textfield").getValue();
			var lat = Ext.getCmp("pn-latitude-textfield").getValue();
			var lng = Ext.getCmp("pn-longitude-textfield").getValue();
			var data = this.feature.attributes;
			return data.name !== name || data.description !== description 
					|| data.date !== date || data.time !== time
					|| data.vehicle !== vechicle || lat !== data.latitude || lng !== data.longitude;
		}
		return true;
	},
	
	copyFromSelectedToForm: function(selected){
		if ( selected.attributes ){
			Ext.getCmp("name-textfield").setValue( selected.attributes.name );
			Ext.getCmp("description-textfield").setValue( selected.attributes.description );
			Ext.getCmp("date-textfield").setValue( selected.attributes.date );
			Ext.getCmp("time-textfield").setValue( selected.attributes.time );
			Ext.getCmp("vehicle-textfield").setValue( selected.attributes.vehicle );
		}
		
		if ( selected.geometry instanceof OpenLayers.Geometry.Point ){
			var point = selected.geometry.clone(); 
			Ext.getCmp("pn-latitude-textfield").setVisible(true);
			Ext.getCmp("pn-longitude-textfield").setVisible(true);
			Ext.getCmp("pn-latitude-textfield").setValue(  point.x );
			Ext.getCmp("pn-longitude-textfield").setValue( point.y );
		}		
	},
	
	copyFromFormToSelected: function(selected, container){
		var name = Ext.getCmp("name-textfield").getValue();
		var description = Ext.getCmp("description-textfield").getValue();
		var date = Ext.getCmp("date-textfield").getValue();
		var time = Ext.getCmp("time-textfield").getValue();
		var vehicle  = Ext.getCmp("vehicle-textfield").getValue();
		selected.attributes = { name:name, description:description, date:date, time:time, vehicle:vehicle };
		if ( selected.geometry instanceof OpenLayers.Geometry.Point ){
				var latField = Ext.getCmp("pn-latitude-textfield");
				var lngField = Ext.getCmp("pn-longitude-textfield");
				
				
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
			var nameField = Ext.getCmp("name-textfield");
			var descField = Ext.getCmp("description-textfield");
			var vehicleField = Ext.getCmp("vehicle-textfield");
			var dateField = Ext.getCmp("date-textfield");
			var timeField = Ext.getCmp("time-textfield");
			 if ( nameField.isValid(false) &&
			           descField.isValid(false) &&
			              vehicleField.isValid(false ) &&
			                dateField.isValid(false) &&
			                   timeField.isValid(false )){
				
				/*var name = nameField.getValue();
				var description = descField.getValue();
				var vehicle = vehicleField.getValue();
				var date = dateField.getValue();
				var time = timeField.getValue();
				this.feature.attributes = { name:name, description:description, vehicle:vehicle, date:date, time:time };
				
					if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
						var latField = Ext.getCmp("pn-latitude-textfield");
						var lngField = Ext.getCmp("pn-longitude-textfield");


						if ( latField.isValid(false) && lngField.isValid(false) ){
							var point = new OpenLayers.Geometry.Point(latField.getValue(), lngField.getValue());
							
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
					}			*/	
				
					this.copyFromFormToSelected( this.feature, this.container );
					this.container.saveFeature(this.feature);
					this.disable();
			
			} else {
				  Ext.Msg.show({
                   title: 'Cannot save this attributes',
                   msg: 'Fields cannot be blank',
                   buttons: Ext.Msg.OK,
                   icon: Ext.MessageBox.ERROR
                });
			}
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
		Ext.getCmp("name-textfield").disable();
		Ext.getCmp("description-textfield").disable();
		Ext.getCmp("vehicle-textfield").disable();
		Ext.getCmp("date-textfield").disable();
		Ext.getCmp("time-textfield").disable();
		Ext.getCmp("pn-latitude-textfield").setVisible(false);
		Ext.getCmp("pn-longitude-textfield").setVisible(false);
		Ext.getCmp("pn-latitude-textfield").disable();
		Ext.getCmp("pn-longitude-textfield").disable();
	},
	
	/** private: method[enable]
     *  enable pilot notes inputs
     */
	enable: function(){
		this.saveBtn.enable();
		this.cancelBtn.enable();
		Ext.getCmp("name-textfield").enable();
		Ext.getCmp("description-textfield").enable();
		Ext.getCmp("vehicle-textfield").enable();
		Ext.getCmp("date-textfield").enable();
		Ext.getCmp("time-textfield").enable();
		Ext.getCmp("pn-latitude-textfield").enable();
		Ext.getCmp("pn-longitude-textfield").enable();
	},
	
	resetForm: function(){
		Ext.getCmp("name-textfield").setValue( '' );
		Ext.getCmp("description-textfield").setValue( '' );
		Ext.getCmp("vehicle-textfield").setValue( '' );
		Ext.getCmp("date-textfield").setValue( '' );
		Ext.getCmp("time-textfield").setValue( '' );
		Ext.getCmp("pn-latitude-textfield").setValue( '' );
		Ext.getCmp("pn-longitude-textfield").setValue( '' );
	}
	

});

Ext.preg(gxp.plugins.PilotNotes.prototype.ptype, gxp.plugins.PilotNotes);
