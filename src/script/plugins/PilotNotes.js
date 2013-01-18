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


AccessControlManager = Ext.extend(Ext.util.Observable, {
	
	permissions: [
		{
			name:'Add to logbook',
			condition: function( feature, isChanged ){
				return ! Application.user.isGuest() && feature.attributes.logbookId === -1;
			},
			action: function(bus){
				bus.fireEvent("grant_add_to_logbook", bus);
			},
			otherwise: function(bus){
				bus.fireEvent("revoke_add_to_logbook", bus);
			}
		},
		{
			name:'Delete from logbook',
			condition: function( feature, isChanged  ){
				return ! Application.user.isGuest() && feature.attributes.logbookId !== -1 
								/* && feature.attributes.owner === Application.user.username */;
			},
			action: function(bus){
				bus.fireEvent("grant_delete_from_logbook", bus);
			},
			otherwise: function(bus){
				bus.fireEvent("revoke_delete_from_logbook", bus);
			}
		},
		{
			name:'Update logbook',
			condition: function( feature, isChanged ){
				return ! Application.user.isGuest() && feature.attributes.logbookId !== -1
				 			&& /* feature.attributes.owner === Application.user.username && */ isChanged==true;
			},
			action: function(bus){
				bus.fireEvent("grant_update_logbook", bus);
			},
			otherwise: function( bus ){
				bus.fireEvent("revoke_update_logbook", bus);
			}
		}
	],
	
	constructor: function(config){
		this.note = config.note;
        this.addEvents({
			"grant_add_to_logbook": true,
            "grant_delete_from_logbook" : true,
            "grant_update_logbook" : true,
			"revoke_add_to_logbook": true,
            "revoke_delete_from_logbook" : true,
            "revoke_update_logbook" : true
        });
        AccessControlManager.superclass.constructor.apply(this, config);
    },

	change: function(feature){
		for (var i=0; i<this.permissions.length; i++){
			var permission = this.permissions[i];
			if ( feature ){
					if ( permission.condition( feature, this.note.isChanged ) ){
						// console.log('grant ' + permission.name);
						permission.action( this );
					} else {
						// console.log('revoke ' + permission.name);
						permission.otherwise( this );
					}	
			}
		
		}
	}

	
});

/**
 *   represents the note currently loaded within the plugin
 */
Note = Ext.extend(Ext.util.Observable, {
	isChanged: false,
    constructor: function(config){
        this.addEvents({
			"map_select": true,
            "logbook_select" : true,
            "change" : true,
			"rewind": true,
			"persist": true,
			"deactivate": true,
			"reload": true
        });
        this.listeners = config.listeners;
        Note.superclass.constructor.apply(this, config);
    },
	isEmpty: function(){
		return (this.feature === null || this.feature === undefined);
	},
	reload: function( oldFeature, newFeature ){
		this.old = this.clone( newFeature  );
		this.isChanged = false;
		this.feature = newFeature ;
		this.fireEvent('reload', newFeature, oldFeature );
	},
	cancel: function(feature){
		this.old = null;
		this.feature = null;
		this.isChanged = false;
		this.fireEvent('unselect', feature);
	},
	remove: function(feature){
		/*if ( this.isChanged ){
			// it is changed without saving
			
			Ext.MessageBox.show({
		           title:'Save Changes?',
		           msg: 'You are leaving a note that has unsaved changes. <br />Would you like to save your changes?',
		           buttons: Ext.MessageBox.YESNO,
		           fn: function(btn){
					 if (btn==='yes'){ 
							var canceled = feature;
							canceled.attributes = this.feature.attributes;
							if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
								canceled.geometry.x = this.feature.geometry.x;
								canceled.geometry.y = this.feature.geometry.y;
							}
						this.feature = null;
						this.isChanged = false;
						this.old = null;	
							
						// this.save( feature );
						this.fireEvent('deactivate');
					 } else if (btn==='no'){ // no
						this.isChanged = false;
						this.fireEvent('deactivate');
					 } else {
						// this code should never be reached!
						console.error('something went wrong: ' + btn + ' is not a valid option');
					}

				   },
		           icon: Ext.MessageBox.QUESTION,
				   scope:this
		       });
			} else {*/
				this.old = null;
				this.feature = null;
				this.isChanged = false;
				this.fireEvent('deactivate', feature);		
			// }		
	},
	// TODO try to use only on select
	// TODO pull out message boxes
	selectFromLogbook: function( feature ){
		
		if (!feature.attributes.logbookId){
			feature.attributes.logbookId = -1;
		}
		
		/*if ( this.isChanged ){
			// it is changed without saving
			Ext.MessageBox.show({
	           title:'Save Changes?',
	           msg: 'You are leaving a note that has unsaved changes. <br />Would you like to save your changes?',
	           buttons: Ext.MessageBox.YESNO,
	           fn: function(btn){
				 if (btn==='yes'){ 
					this.old = this.clone( feature );
					this.feature = feature;
					this.isChanged = false;
					this.fireEvent('logbook_select', feature);
				 } else if (btn==='no'){ // no
					this.fireEvent('rewind', this.old, this.feature);
					this.isChanged = false;
					this.old = this.clone( feature );
					this.feature = feature;
					this.fireEvent('logbook_select', feature);
				 } else {
					// this code should never be reached!
					console.error('something went wrong: ' + btn + ' is not a valid option');
				}

			   },
	           icon: Ext.MessageBox.QUESTION,
			   scope:this
	       });
		} else {*/
			this.old = this.clone( feature );
			this.feature = feature;
			this.isChanged = false;
			this.fireEvent('logbook_select', feature);		
		//}

	},
	selectFromMap: function( feature ){
		
		if (!feature.attributes.logbookId){
			feature.attributes.logbookId = -1;
		}
		
		/*if ( this.isChanged ){
			// it is changed without saving
			Ext.MessageBox.show({
	           title:'Save Changes?',
	           msg: 'S: You are leaving a note that has unsaved changes. <br />Would you like to save your changes?',
	           buttons: Ext.MessageBox.YESNO,
	           fn: function(btn){
				 if (btn==='yes'){ 
					this.old = this.clone( feature );
					this.feature = feature;
					this.isChanged = false;
					this.fireEvent('map_select', this.feature);
				 } else if (btn==='no'){ // no
					this.fireEvent('rewind', this.old, this.feature);
					this.isChanged = false;
					this.old = this.clone( feature );
					this.feature = feature;
					this.fireEvent('map_select', feature);
				 } else {
					// this code should never be reached!
					console.error('something went wrong: ' + btn + ' is not a valid option');
				}

			   },
	           icon: Ext.MessageBox.QUESTION,
			   scope:this
	       });*/
	/*	} else {  */
			this.isChanged = false;
			this.old = this.clone( feature );
			this.feature = feature;
			this.fireEvent('map_select', feature);		
	//	}
	},
	// end todo
	save: function( feature ){
		this.old = this.clone( feature );
		this.feature = feature;
		this.isChanged = false;
		this.fireEvent('save', feature);
	},
	remove: function(feature){
		this.old = null;
		this.feature = null;
		this.isChanged = false;
		this.fireEvent('remove', feature);		
	},
	persist: function(feature){
		
		this.old = this.clone( feature );
		this.feature = feature;
		this.isChanged = false;
		this.fireEvent('persist', feature);
	},
	refresh: function(feature){
		if ( ! Application.user.isGuest() && feature){	
			feature.attributes.owner = Application.user.username;
		}
		
		this.fireEvent('change', feature);
	},
	change: function( feature, silent ){
		this.isChanged = true;
		this.feature.attributes = feature.attributes;
		if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
			this.feature.geometry.x = feature.geometry.x;
			this.feature.geometry.y = feature.geometry.y;
		}
		this.fireEvent('change', feature);
		
		/*this.isChanged = true;
		// this.feature = feature;
		this.feature.attributes = feature.attributes;
		if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
			this.feature.geometry.x = feature.geometry.x;
			this.feature.geometry.y = feature.geometry.y;
		}		
		if (! silent ){
			this.fireEvent('change', feature);
		}*/
	},
	// TODO pull out message box
	unselect: function(){
		
	

		/*if ( this.isChanged ){
			// it is changed without saving
			Ext.MessageBox.show({
	           title:'Are you sure?',
	           msg: 'You are leaving a note that has unsaved changes. <br />Would you like to leave anyway?',
	           buttons: Ext.MessageBox.YESNO,
	           fn: function(btn){
				 if (btn==='yes'){ 
					var copy = this.feature.clone();
					this.old = null;
					this.feature = null;
					this.isChanged = false;
					this.fireEvent('unselect', copy);
				 } else if (btn==='no'){ // no
					// do nothing
					// this.isChanged = false;
				 } else {
					// this code should never be reached!
					console.error('something went wrong: ' + btn + ' is not a valid option');
				}

			   },
	           icon: Ext.MessageBox.QUESTION,
			   scope:this
	       });
		} else {*/
			this.old = null;
			this.feature = null;
			this.isChanged = false;
			this.fireEvent('unselect', this.feature);	
		// }
		
	},
	update: function( feature ){
		this.isChanged = true;
		this.feature.attributes = feature.attributes;
		if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
			this.feature.geometry.x = feature.geometry.x;
			this.feature.geometry.y = feature.geometry.y;
		}		
		// if (! silent ){
			this.fireEvent('update', feature);
		// }
	},
	deactivate: function(){

		if ( this.isChanged ){
			// it is changed without saving
			Ext.MessageBox.show({
	           title:'Are you sure?',
	           msg: 'You are leaving a note that has unsaved changes. <br />Would you like to leave anyway?',
	           buttons: Ext.MessageBox.YESNO,
	           fn: function(btn){
				 if (btn==='yes'){ 
					this.old = null;
					this.feature = null;
					this.isChanged = false;
					this.fireEvent('deactivate');
				 } else if (btn==='no'){ // no
					// do nothing
					this.isChanged = false;
				 } else {
					// this code should never be reached!
					console.error('something went wrong: ' + btn + ' is not a valid option');
				}

			   },
	           icon: Ext.MessageBox.QUESTION,
			   scope:this
	       });
		} else {
			this.old = null;
			this.feature = null;
			this.isChanged = false;
			this.fireEvent('deactivate');
		}		
		
	
	},
	clone: function( feature ){
		return feature.clone();
	}
});

NotePanel = Ext.extend( Ext.FormPanel, {
		// frame:false,  
		border:false, 
		autoScroll:true,
		autoHeight:true,
		// margins:{ right:50},
		width:'200',
		labelAlign:'top', 
	    title: "Pilot Notes",
		tbar:[],
		buttonAlign:'left',
	

		initComponent: function( ){
			
			
			
			var vehicleStore = new Ext.data.Store({
				reader: new Ext.data.ArrayReader({}, [
				       {name: 'selected', type: 'bool'},
					   {name: 'vehicle', type: 'string'},
					   {name: 'style', type: 'string'},
		               {name: 'availability', type: 'bool'}			   
				]),
				data: this.vehicles
			});
			
				this.saveBtn = new Ext.Button({
					text: 'Save',
			        tooltip: 'Save locally',
			        iconCls: 'save',
			        disabled: true,
			        handler : this.handleSave,
					scope: this
			    });
			    this.cancelBtn = new Ext.Button({
						text: 'Cancel',
					    tooltip: 'Cancel',
					    iconCls: 'cancel',
					    disabled: true,
					    handler : this.handleCancel,
						scope: this
					  }		
				);
				this.removeFromLogbookBtn = new Ext.Button({
						text: 'Delete from logbook',
					    tooltip: 'Remove the current note from logbook',
					    iconCls: 'delete',
					    disabled: true,
					    handler : this.handleRemoveFromLogbook,
						scope: this
					  }		
				);
				this.addToLogbookBtn = new Ext.Button({
						text: 'Add to logbook',
					    tooltip: 'Add the current note to logbook',
					    iconCls: 'save',
					    disabled: true,
					    handler : this.handleAddToLogbook,
						scope: this
					  });	
				this.updateLogbookBtn = new Ext.Button({
							text: 'Update logbook',
						    tooltip: 'Add the current note to logbook',
						    iconCls: 'save',
						    disabled: true,
							hidden: true,
						    handler : this.handleAddToLogbook,
							scope: this
						  });		
			
				Ext.apply(this, {
					items:[{
			              xtype: 'fieldset',
			              id: 'field-set',
			              border:false,
				          items:[
								{   xtype: 'textfield',
					                fieldLabel: 'Title',
									width: 150,
									allowBlank: false,
									disabled: true,
									anchor:'90%',
									ref:'../name'
					            },{  
									xtype: 'textarea',
									width: 150,
									disabled: true,
									allowBlank: false,
					                fieldLabel:'Note', 
									anchor:'90%',
									ref: '../description'
					            },{   
									xtype: 'numberfield',
								    fieldLabel: 'Latitude',
									readOnly:true,
									// allowBlank: false,
									width: 150,
									decimalPrecision: 5,
									maxValue:90,
									minValue:-90,
									disabled: true,
									hidden:true,
									anchor:'90%',
									ref:'../latitude'
								},{   
									xtype: 'numberfield',
									fieldLabel: 'Longitude',
									readOnly:true,
									// allowBlank: false,
									width: 150,
									decimalPrecision: 5,
									maxValue:180,
									minValue:-180,
									disabled: true,
									hidden:true,
									anchor:'90%',
									ref:'../longitude'
								},{
								    xtype: 'compositefield',
								    width: 150,
									anchor:'100%',
								    items: [
								        {
											ref:'../../date',
								            xtype     : 'datefield',
											allowBlank: false,
											editable: false,
											format:"d/m/Y",
								            fieldLabel: 'Day',
											width:100,
											anchor:'100%',
											disabled:true
								        },{
											ref:'../../time',
								            xtype     : 'timefield',
											allowBlank: false,
								            fieldLabel: 'Time',
											// TOFIX readOnly does not allow to select a time!
											// we need to find another way to disallow keyboard editing
											// readOnly: true,
											format: 'H:i:s',
											width:80,
											disabled:true
								        }
								    ]
								},
								{
									
										xtype: "combo",
										fieldLabel: 'Vehicle',
										allowBlank: false,
										invalidText: 'A vehicle must be specified',
										emptyText: 'Select a vehicle...',
										store: vehicleStore,
										mode: 'local',
										displayField:'vehicle',
										valueField:'vehicle',
										editable: false,
										forceSelection: true,
										disabled: true,
										triggerAction: 'all',
										ref:'../vehicle',
										width: 150
										
								},
								
								/*{ 
									xtype: 'textfield',
							        fieldLabel: 'Vehicle',
									width: 200,
									ref:'../vehicle',
									anchor:'100%',
									disabled:true
							   },*/{   
									xtype: 'textfield',
							        fieldLabel: 'Operator',
									readOnly:true,
									width: 150,
									ref:'../operator',
									anchor:'90%',
									disabled:true
							   }

						   ]
						}],
						buttons:[  this.updateLogbookBtn, this.addToLogbookBtn, this.removeFromLogbookBtn /*, this.saveBtn, this.cancelBtn */ ]
				});

			  
			 
			  NotePanel.superclass.initComponent.call(this, arguments);
			
			  // notify changes when form is modified
			  this.name.addListener('change', this.handleChange, this);
			  this.description.addListener('change', this.handleChange, this);
			  this.date.addListener('change', this.handleChange, this);
			  this.time.addListener('change', this.handleChange, this);
			  this.vehicle.addListener('change', this.handleChange, this);
		   },
		   handleChange: function(){

				if (!this.feature){
					// this code should never be executed
					console.error('no feature to be saved');
					return;
				}
				
			
				var values = new Object;
				values.name = this.name.getValue();
				values.description = this.description.getValue();
				values.date = this.date.getValue();
				values.time = this.time.getValue();
				values.vehicle = this.vehicle.getValue();
				values.operator = this.operator.getValue();
				values.date = values.date.format ? values.date.format('d/m/Y') : values.date;
				values.logbookId = this.feature.attributes.logbookId;
				
				var feature = this.feature.clone();
				
				if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
					feature.geometry.x = this.latitude.getValue();
					feature.geometry.y = this.longitude.getValue();
				}
				feature.attributes = values;			
			
				this.getForm().clearInvalid();
			
				this.note.change(feature, true);
		   },
		   update: function( feature ){
			
		   },
		   refresh: function(){
				this.note.refresh(this.feature);
			/*	if ( Application.user.isGuest() ){
					this.addToLogbookBtn.disable();
					this.removeFromLogbookBtn.disable();
				} else {
					if ( this.feature && this.feature.attributes ){
						if ( ! this.feature.attributes.owner  ){
							this.feature.attributes.owner = Application.user.username;
						}
						if (  this.feature.attributes.owner === Application.user.username ){
							
							this.addToLogbookBtn.enable();
							if ( this.feature.attributes.logbookId && this.feature.attributes.logbookId !== -1){
								this.removeFromLogbookBtn.enable();
								
							}
							
						}					
					}

				} */
				this.getForm().clearInvalid();
		   },
		   reset: function(){
				this.name.reset();
				this.description.reset();
				this.latitude.reset();
				this.longitude.reset();
				this.date.reset();
				this.time.reset();
				this.vehicle.reset();
				this.operator.reset();
				
				this.latitude.setVisible(false);
				this.longitude.setVisible(false);
				
				this.getForm().clearInvalid();
		   },
		
		   load: function(feature){
			
				this.reset();
				if (! feature.attributes ){
					// this code should never be reached
					console.error('cannot load feature: no property attributes found');
					return;
				}
				
				this.feature = feature;
				
				this.name.setValue( feature.attributes.name );
				this.description.setValue( feature.attributes.description );
				if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
					var point = feature.geometry.clone(); 
					this.latitude.setVisible(true);
					this.latitude.setValue( point.x );
					this.longitude.setVisible(true);
					this.longitude.setValue( point.y );
				}
				this.date.setValue( Date.parseDate(feature.attributes.date, 'd/m/Y') );
				this.time.setValue( feature.attributes.time );
				this.vehicle.setValue( feature.attributes.vehicle );
				this.operator.setValue( feature.attributes.owner ? feature.attributes.owner : 'guest' );	
				
				
				
				this.enable();
				
				// this.addToLogbookBtn.setText( feature.attributes.logbookId === -1 ? 'Add to Logbook' : 'Update Logbook');
				/*if ( Application.user.isGuest() || ( Application.user.username !== feature.attributes.owner )){
					this.addToLogbookBtn.disable();
					this.removeFromLogbookBtn.disable();
				}
				if ( feature.attributes.logbookId === -1){
					this.removeFromLogbookBtn.disable();
				} else {
					this.addToLogbookBtn.disable();
				}*/
				
				this.getForm().clearInvalid();
				this.date.clearInvalid();
				this.time.clearInvalid();
				
				this.note.refresh(this.feature);
		   },
		
		   unload: function(feature){
				this.disable();
				this.reset();
				this.getForm().clearInvalid();
		   },
		
		   disable: function(){
				this.name.disable();
				this.description.disable();
				this.latitude.disable();
				this.longitude.disable();
				this.date.disable();
				this.time.disable();
				this.vehicle.disable();
				this.operator.disable();
				
				this.addToLogbookBtn.disable();
				this.updateLogbookBtn.disable();
				this.removeFromLogbookBtn.disable();
				this.saveBtn.disable();
				this.cancelBtn.disable();
				this.getForm().clearInvalid();
				
			
		   },
		
		   enable: function(){
				this.name.enable();
				this.description.enable();
				this.latitude.enable();
				this.longitude.enable();
				this.date.enable();
				this.time.enable();
				this.vehicle.enable();
				this.operator.enable();
				
				/* this.addToLogbookBtn.enable();
				this.removeFromLogbookBtn.enable();
				this.saveBtn.enable();
				this.cancelBtn.enable(); */
		   },
		
		   // deprecated
		   handleSave: function(){
			
				if (!this.feature){
					// this code should never be executed
					console.error('no feature to be saved');
					return;
				}
			
				var values = new Object;
				values.name = this.name.getValue();
				values.description = this.description.getValue();
				values.date = this.date.getValue();
				values.time = this.time.getValue();
				values.vehicle = this.vehicle.getValue();
				values.operator = this.operator.getValue();
				values.date = values.date.format ? values.date.format('d/m/Y') : values.date;
				values.logbookId = this.feature.attributes.logbookId;
				
				// non sarebbe necessario
				// costruisci una copia della feature, ma fa che sia l'evento a causare il cambiamento
				
				if ( this.feature.geometry instanceof OpenLayers.Geometry.Point ){
					// values.latitude = this.latitude.getValue();
					// values.longitude = this.longitude.getValue();
					this.feature.geometry.x = this.latitude.getValue();
					this.feature.geometry.y = this.longitude.getValue();
				}
				this.feature.attributes = values;
				
				///
				this.getForm().clearInvalid();
				this.date.clearInvalid();
				this.time.clearInvalid();
				
				this.note.save( this.feature );
		   },
		   handleCancel: function(){
				this.note.unselect();
		   },
		   handleRemoveFromLogbook: function(){
				if (!this.feature && ! this.feature.attributes.logbookId){
					console.error('no feature to be removed from logbook');
					return;
				}
				this.note.remove( this.feature );
			
		   },
		   handleAddToLogbook: function(){
			
				if ( !this.getForm().isValid() ){
					Ext.Msg.show({
						title: 'Cannot save note to Logbook',
						msg: 'Some fields are invalid',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});
					return;
				}

				if (!this.feature){
					// this code should never be executed
					console.error('no feature to be made persistent');
					return;
				}
			
				var values = new Object;
				values.name = this.name.getValue();
				values.description = this.description.getValue();
				values.date = this.date.getValue();
				values.time = this.time.getValue();
				values.vehicle = this.vehicle.getValue();
				values.operator = this.operator.getValue();
				values.date = values.date.format ? values.date.format('d/m/Y') : values.date;
				values.logbookId = this.feature.attributes.logbookId;
				
				var feature = this.feature.clone();
				
				if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
					feature.geometry.x = this.latitude.getValue();
					feature.geometry.y = this.longitude.getValue();
				}
				feature.attributes = values;		
			
				this.note.persist( feature );
		   }
	    });

LogbookPanel = Ext.extend(
		Ext.grid.GridPanel,
	 	{
			renderTo:'logbook-panel',
			autoScroll:true,
			frame:false,  
			// autoHeight:true,
			width:'350',
			title:'Log Book',
			
			hideTooltip: 'Hide from map',
			showTooltip: 'Show on map',
			hideIcon: '../theme/app/img/silk/map_delete.png',
			showIcon: '../theme/app/img/silk/map_add.png',
			
			sm: new Ext.grid.RowSelectionModel({
		            singleSelect: true
		    }),
			
				initComponent: function( ){
					
					var visibility = new Object;
					this.visibility = visibility;
					
					this.store.on('load',
						function(grid){
							var records = this.getStore().getRange();
							for (var i=0; i<records.length; i++){
								var record = records[i];
								if ( visibility[ record.id ] === undefined ){
									visibility[ record.id ] = false; 
								}
								
							}
							// console.log( visibility );
						},
						this);
						
					
					
					this.colModel = new Ext.grid.ColumnModel({
				            defaults: {
				                width : 50
				            },
				            columns: [ 	
							{
				                xtype: 'actioncolumn',
								width: 55,
								fixed: true,
								align: 'center',
								items:[{
	
									getClass: function (value, metadata, record) {
										
										// console.log( 'get class');
									
								        if ( visibility[ record.id ] ) {
								           	this.items[0].tooltip = 'Hide from map';
							                return 'hide';
								        } else {
								           	this.items[0].tooltip = 'Show on map';
							                return 'view';
								        }
										
								    },
								  handler: function(grid, rowIndex, colIndex, column, event){
									
									var record = grid.getStore().getAt( rowIndex );
									 
									 visibility[ record.id ] = !  visibility[ record.id ];
							 		 
									 if ( visibility[ record.id ] ){
										grid.fireEvent('show_on_map', grid, rowIndex, event);
									 } else {
										grid.fireEvent('hide_from_map', grid, rowIndex, event);
									 }
									
								     grid.store.reload();
									
						             return false;
								  }								
								
								}
								
								]

				            },
							{
				                id: 'id_resource',
				                header: 'Id',
				                dataIndex: 'id',
				                sortable: true,
				                align: 'left',
				                hidden: true
				            },
							{
				                id: 'id_name',
				                header: 'Name',
				                dataIndex: 'name',
				                sortable: true,
				                align: 'left'
				            },{
				                id: 'id_owner',
				                header: 'Owner',
				                dataIndex: 'owner',
				                sortable: true,
				                align: 'left'
				            },{
				                id: 'id_description',
				                header: 'Description',
				                dataIndex: 'description',
				                sortable: true,
				                align: 'left'
				            },{
				                id: 'creation',
				                header: 'Creation',
				                dataIndex: 'creation',
				                sortable: true,
				                renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
				                align: 'left'
				            },{
				                id: 'lastUpdate',
				                header: 'Last update',
				                dataIndex: 'lastUpdate',
				                sortable: true,
				                renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
				                align: 'left'
				            }]
				        });
					
					this.bbar = new Ext.PagingToolbar({
			            pageSize : 20,
			            store : this.store,
			            displayInfo: true
			        });
			
					LogbookPanel.superclass.initComponent.call(this, arguments);
				},
				select: function(feature){
					if ( feature.attributes.logbookId !== -1 ){
						var store = this.getStore();
						var record = store.getById( feature.attributes.logbookId );
						var pos = store.indexOf(record);
						this.getSelectionModel().selectRow(pos, false);
					} else {
						this.getSelectionModel().clearSelections();
					}
				},
				deactivate: function( feature ){
					if ( feature && feature.attributes.logbookId )
						this.visibility[ feature.attributes.logbookId ] = false;
					
					
					this.getSelectionModel().clearSelections();
					this.getStore().reload();
				},
				unselect: function(feature){
					this.getSelectionModel().clearSelections();
					this.getStore().reload();
				},
				reload: function(feature){
					
					if ( feature &&  feature.attributes.logbookId ){
						this.visibility[ feature.attributes.logbookId ] = true;
					}
					
					var store = this.getStore();
					var handler = function(){
						this.select(feature);
						store.un( 'load', handler, this);
					};
					store.on( 'load', handler, this);
					store.reload();
				},
				isReady: function(){
					return ( this.getStore() != null && this.getStore() != undefined );
				},
				setShowOnMap: function( logbookId ){
					var record = this.getStore().getById( logbookId );
					this.visibility[ record.id ] = true;
					grid.store.reload();
					
				}

	});
	
FeatureLayer = Ext.extend(Ext.util.Observable, {

	
	constructor: function(config){
		this.layerName = config.layerName;
    	this.map = config.map;
		this.alternativeStyle = config.alternativeStyle;
		this.note = config.note;
		this.bus = config.bus;
	
        FeatureLayer.superclass.constructor.apply(this, config);	
    },

	
	findFeature: function(newFeature){
		var layer = this.getLayer();
		for (var i=0; i<layer.features.length; i++){
			var feature = layer.features[i];
			if ( feature.attributes.logbookId && feature.attributes.logbookId == newFeature.attributes.logbookId){
				return feature;
			}
		}
		return null;
	},
	
	hasFeature: function( logbookId ){
		var layer = this.getLayer();
		for (var i=0; i<layer.features.length; i++){
			var feature = layer.features[i];
			if ( feature.attributes.logbookId && feature.attributes.logbookId == logbookId){
				return true;
			}
		}
		return false;
	},
	
	addToMap: function( feature ){
		this.note.suspendEvents(false);
		var selector = this.getSelector();
		var modifier = this.getModifier();


		var layerFeature = this.findFeature( feature );

		if ( layerFeature){
			// do nothing		
		} else {
			var layer = this.getLayer();
			layer.addFeatures( [feature] );
		}		
		this.note.resumeEvents();
	},
	
	select: function(feature){	
		// suspend listening because control.select triggers other selects
		this.note.suspendEvents(false);
		
		
		var selector = this.getSelector();
		var modifier = this.getModifier();
		
		selector.unselectAll();
		modifier.deactivate();
		
		var layerFeature = this.findFeature( feature );
		
		if ( layerFeature){
			modifier.selectFeature( layerFeature );
			selector.select( layerFeature );		
		} else {
			var layer = this.getLayer();
			layer.addFeatures( [feature] );
			modifier.selectFeature(feature);
			selector.select(feature);
		}
		
		this.note.resumeEvents();
	},
	
	unselect: function( feature ){
		// ! sono già deselezionati alla fonte
		/*var selector = this.getSelector();
		var modifier = this.getModifier();
		selector.unselectAll();
		modifier.deactivate();*/
	},
	unselectAll: function(){
		this.bus.suspendEvents(false);
		var selector = this.getSelector();
		var modifier = this.getModifier();
		selector.unselectAll();
		modifier.deactivate();		
		this.bus.resumeEvents();
	},
	update: function(feature){
		var modifier = this.getModifier();
		modifier.deactivate();
		modifier.selectFeature(feature);
	},
	rewind: function( oldFeature, newFeature){
		this.note.suspendEvents(false);
		this.bus.suspendEvents(false);
		
		var layer = this.getLayer();
		var selector = this.getSelector();
		var modifier = this.getModifier();
		// we need to remove and add again feature to force redrawing in previous position
		layer.removeFeatures( [newFeature] );
		layer.addFeatures( [oldFeature] );
		
		// modifier.deactivate();
		// selector.unselectAll();
		// selector.select(oldFeature);
		// modifier.selectFeature(oldFeature);
		
		this.bus.resumeEvents();
		
		this.note.resumeEvents();
	},
	reload: function( newFeature, oldFeature){
		
		var layer = this.getLayer();
		var modifier = this.getModifier();
		var selector = this.getSelector();
		
		// Hack: it is better to search for the actual old feature
		layer.removeFeatures( layer.selectedFeatures ); 
		layer.addFeatures( [newFeature] );
		selector.select(newFeature);
		modifier.selectFeature(newFeature);
		
	},
	save: function( feature ){
		var layer = this.getLayer();
		var features = layer.selectedFeatures;
		if (features.length == 0){
			console.error('Cannot save feature: no feature found.');
			return;
		} else if ( features.length > 1){
			console.error('Cannot save feature: too many features selected.');
			return;
		}
		features[0].attributes = feature.attributes;
		if ( feature.geometry instanceof OpenLayers.Geometry.Point ){
			features[0].geometry.x = feature.geometry.x;
			features[0].geometry.y = feature.geometry.y;
		}
		
	},
	remove: function(feature){
		this.bus.suspendEvents(false);
		var layer = this.getLayer();
		var features = layer.selectedFeatures;
		if (features.length == 0){
			this.bus.resumeEvents();
			// console.error('Cannot remove feature: no feature found.');
			return;
		} else if ( features.length > 1){
			// console.error('Cannot remove feature: too many features selected.');
			// return;
		}		
		layer.removeFeatures( layer.selectedFeatures );
		this.bus.resumeEvents();
	},
	removeByLogbookId: function( logbookId){
		this.bus.suspendEvents(false);
		var layer = this.getLayer();
		var features = layer.features;
		for (var i=0; i<features.length; i++){
			var feature = features[i];
			if ( feature.attributes.logbookId && feature.attributes.logbookId == logbookId ){
				layer.removeFeatures( [ feature ] );
				this.bus.resumeEvents();
				return;
			}
		}
		console.error('feature not found');
		this.bus.resumeEvents();
	},
	getSelector: function(){
		
		var controls = this.map.getControlsBy('name', 'PilotNotes:SelectFeature');
		if ( controls.length == 1 ){
			return controls[0];
		} else if ( controls.length > 1 ){
			console.error('More Pilot Notes selectors: taken the first');
			return controls[0];
		} else {
			console.error('No select feature control found');
			return null;
		}
		
					
	},
	
	getModifier: function(){
		
		var controls = this.map.getControlsBy('name', 'PilotNotes:ModifyFeature');
		if ( controls.length == 1 ){
			return controls[0];
		} else if ( controls.length > 1 ){
			console.error('More Pilot Notes modifiers: taken the first');
			return controls[0];
		} else {
			console.error('No modify feature control found');
			return null;
		}		
	
					
	},
	
  	/**
     *  create a custom layer or it returns an existing one
     */
    getLayer: function( ){
	
		var layers = this.map.getLayersByName( this.layerName );
		if ( layers.length > 0 ){
			return layers[0]; // return the first layer with the given name
		} else {
			var layer;
			if ( this.alternativeStyle ){
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs), 
					styleMap: new OpenLayers.StyleMap({
						"default": new OpenLayers.Style({
							strokeColor: "red",
							strokeOpacity: .7,
							strokeWidth: 2,
							fillColor: "red",
							fillOpacity: 0,
							cursor: "pointer"
						}),
						"temporary": new OpenLayers.Style({
							strokeColor: "#ffff33",
							strokeOpacity: .9,
							strokeWidth: 2,
							fillColor: "#ffff33",
							fillOpacity: .3,
							cursor: "pointer"
						}),
						"select": new OpenLayers.Style({
							strokeColor: "#0033ff",
							strokeOpacity: .7,
							strokeWidth: 3,
							fillColor: "#0033ff",
							fillOpacity: 0,
							graphicZIndex: 2,
							cursor: "pointer"
						})
					})
				});				
			} else {
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs)
				});	
			}

			this.map.addLayer( layer );
			return layer;
		}
	}
});
	


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


    
    /** private: method[constructor]
     */
    constructor: function(config) {
		// create an empty note
        this.note = new Note({});
		this.note.addListener('save', this.handleSave, this);
		// this.note.addListener('remove', this.handleRemoveFromLogbook, this);
		this.note.addListener('change', function(){
				Ext.getCmp('east').on('resize', function(){
					var height = Ext.getCmp('east').findParentByType('panel').getHeight() - this.notePanel.getHeight();
					if ( this.logbookPanel ){
						this.logbookPanel.setHeight( height > 200 ? height : 200 );
					}
					
				}, this);		
		}, this);
		
		this.manager = new AccessControlManager({
			note: this.note
		});
		
		gxp.plugins.PilotNotes.superclass.constructor.apply(this, arguments);
    },

    buildUI: function(){
	
		var layer = new FeatureLayer({
				map:this.target.mapPanel.map,
				layerName: this.layerName,
				alternativeStyle: this.alternativeStyle,
				note: this.note,
				bus: this.target
		});
		// this.note.addListener('logbook_select', layer.select, layer);
		this.note.addListener('unselect', layer.unselect, layer);
		this.note.addListener('rewind', layer.rewind, layer);
		this.note.addListener('map_select', layer.update, layer);
		this.note.addListener('reload', layer.reload, layer);
		this.note.addListener('remove', layer.remove, layer);
		// this.note.addListener('save', layer.save, layer);
		this.layer = layer;
	
		var self = this;
		this.notePanel = new NotePanel({
			id: this.id,
			note:this.note,
			vehicles: this.target.vehicleSelector.data
		});
		this.note.addListener('logbook_select', this.notePanel.load, this.notePanel);
		this.note.addListener('map_select', this.notePanel.load, this.notePanel);
		// this.note.addListener('change', this.notePanel.load, this.notePanel); //
		this.note.addListener('update', this.notePanel.load, this.notePanel); 
		this.note.addListener('rewind', this.notePanel.load, this.notePanel);
		this.note.addListener('unselect', this.notePanel.unload, this.notePanel);
		this.note.addListener('remove', this.notePanel.unload, this.notePanel);
		this.note.addListener('deactivate', this.notePanel.unload, this.notePanel);
		this.note.addListener('reload', this.notePanel.load, this.notePanel);
		
		this.note.addListener('change', this.manager.change, this.manager);
		
		// set up actions associated to permissions
		this.manager.addListener('grant_add_to_logbook', function(){
			self.notePanel.addToLogbookBtn.enable();
			self.notePanel.updateLogbookBtn.disable();
			self.notePanel.addToLogbookBtn.setVisible(true);
			self.notePanel.updateLogbookBtn.setVisible(false);
		});
		this.manager.addListener('grant_delete_from_logbook', function(){
			self.notePanel.removeFromLogbookBtn.enable();
		});
		this.manager.addListener('grant_update_logbook', function(){
			self.notePanel.updateLogbookBtn.enable();
			self.notePanel.addToLogbookBtn.disable();
			self.notePanel.updateLogbookBtn.setVisible(true);
			self.notePanel.addToLogbookBtn.setVisible(false);
		});
		this.manager.addListener('revoke_add_to_logbook', function(){
			self.notePanel.addToLogbookBtn.disable();
		});
		this.manager.addListener('revoke_delete_from_logbook', function(){
			self.notePanel.removeFromLogbookBtn.disable();
		});
		this.manager.addListener('revoke_update_logbook', function(){
			self.notePanel.updateLogbookBtn.disable();
		});
			
		var pn = new Ext.Panel({
			layout: "fit",
			items:[
				this.notePanel,
				{
					id:'logbook-panel',
					xtype:'panel'
				}
			]
		});				
					
		this.panel = gxp.plugins.PilotNotes.superclass.addOutput.call(this, pn );
		

			
		
		
		this.target.on("notefeatureselected", 
			function selectFeature(container, feature){
					if ( !feature.attributes.owner && ! Application.user.isGuest() ){
						feature.attributes.owner = Application.user.username;
					}
					self.note.selectFromMap( feature );
					container.modifyControl.selectFeature(feature);
		});
		this.target.on("notefeaturemultiselected", 
			function selectFeatures(container, feature){
					self.note.deactivate(  );
		});
		this.target.on("notefeatureunselected", 
			function unselectFeature(container, feature){
					// self.note.unselect();
					self.note.cancel(feature);
		});
		
		this.target.on("notefeatureremoved", 
			function unselectFeature(container, feature){
					self.note.remove(feature);
		});
		
		this.target.on("notefeaturechanged", 
			function changeFeature(container, feature){
				// self.note.change( feature );
				// self.note.selectFromMap( feature );
				self.note.update( feature );
		});

		this.target.on("notefeaturesaved", function saveFeature(container, feature){
				if ( !feature.attributes.owner && ! Application.user.isGuest() ){
					feature.attributes.owner = Application.user.username;
				}
				self.note.selectFromMap( feature );
				container.modifyControl.selectFeature(feature);
		});	

		return this.panel;


	},
	
	buildLogbookUI: function(){

		this.logbookPanel = new LogbookPanel({
			store: this.store,
			note: this.note,
			height:Ext.getCmp('east').findParentByType('panel').getHeight() - this.notePanel.getHeight() 
		});
		
		// hack: fill the empty space
		/*Ext.EventManager.onWindowResize(function () {
		    this.logbookPanel.setHeight( 
				Ext.getCmp('east').findParentByType('panel').getHeight() - this.notePanel.getHeight() );
		}, this, {delay:1000});*/
		
		Ext.getCmp('east').on('resize', function(){
			var height = Ext.getCmp('east').findParentByType('panel').getHeight() - this.notePanel.getHeight();
			this.logbookPanel.setHeight( height > 200 ? height : 200 );
		}, this);
		
		this.note.addListener('map_select', this.logbookPanel.select, this.logbookPanel);
		this.note.addListener('reload', this.logbookPanel.reload, this.logbookPanel);
		this.note.addListener('unselect', this.logbookPanel.unselect, this.logbookPanel);
		this.note.addListener('deactivate', this.logbookPanel.deactivate, this.logbookPanel);
		this.note.addListener('persist', this.handleAddToLogbook, this);
		this.note.addListener('remove', this.logbookPanel.deactivate, this.logbookPanel);
		this.logbookPanel.on('cellclick', function(grid, rowIndex, columnIndex, e) {
								if ( columnIndex > 0 ){ // select only if one does not click on action column
									var record = grid.getSelectionModel().getSelected();
									var root = this;
									this.logbook
										.findById( record.id )
										.success( function(data){ 
											// convert KML blob to feature
											var format = new OpenLayers.Format.KML({
													    	extractStyles: true, 
															extractAttributes: true,
															maxDepth: 2 
													    });
											var features = format.read( data.blob );
											var feature = features[0];
											feature.attributes.logbookId = record.id;
											feature.attributes.owner = data.owner;
											var attributes = feature.attributes;
											for (var attributeName in attributes ){
												if (typeof attributes[attributeName] == "object") {
													if (attributes[attributeName].value) {
														attributes[attributeName] = attributes[attributeName].value;
													}
												}
											}
											root.note.selectFromLogbook( feature );
											
											root.layer.unselectAll();
											
											if ( root.logbookPanel.visibility[ record.id] ){
												if ( root.layer.hasFeature( record.id )  ){
													root.layer.select( feature );
												} else {
													root.layer.addToMap( feature );
												}
											}
											
											
										}).execute();		
									return true;						
								}

				            }, this); 
	   // hack: I need to intercept this event when mouse clicks on a line between cells
	   /* this.logbookPanel.on('rowclick', function(grid, rowIndex, e){
			this.logbookPanel.fireEvent('cellclick', grid, rowIndex, 1, e);
		}, this);*/
		this.logbookPanel.on('show_on_map', function show(grid, rowIndex, e){
			var record = grid.getStore().getAt( rowIndex );
			var root = this;
			this.logbook
				.findById( record.id )
				.success( function(data){ 
					// convert KML blob to feature
					var format = new OpenLayers.Format.KML({
							    	extractStyles: true, 
									extractAttributes: true,
									maxDepth: 2 
							    });
					var features = format.read( data.blob );
					var feature = features[0];
					feature.attributes.logbookId = record.id;
					feature.attributes.owner = data.owner;
					var attributes = feature.attributes;
					for (var attributeName in attributes ){
						if (typeof attributes[attributeName] == "object") {
							if (attributes[attributeName].value) {
								attributes[attributeName] = attributes[attributeName].value;
							}
						}
					}
					if ( ! root.layer.hasFeature( record.id )  ){
						root.layer.addToMap( feature );
					}
					var selected = grid.getSelectionModel().getSelected();
					if (selected){
						if ( selected.id == record.id ){
							root.layer.select( feature );			
						}
					}
				
				
					
				}).execute();		
			return true;		
		}, this);
		this.logbookPanel.on('hide_from_map', function show(grid, rowIndex, e){
			var record = grid.getStore().getAt( rowIndex );
			if ( this.layer.hasFeature( record.id )  ){
				this.layer.removeByLogbookId( record.id);
			}
			
		}, this);
	
	},

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function() {
	
		var self = this;
		var category = this.target.cruiseName + '-logbook';
		
		// connect to geostore and load the logbook
		var conn = GeoStore.connect({
						url: geoStoreBaseURL, 
						proxy: this.target.proxy, 
						token: Application.user.token
					});
		this.logbook = conn.getResource(category);
		var cursor = this.logbook.find('*');
		cursor.success( function(store){
			self.store = store;
			self.store.load({
		            params:{
		                start: 0,
		                limit: 10
		            }
		        });
			self.buildLogbookUI();
			
		});
		cursor.failure( function(response){
			Ext.Msg.show({
				title: 'Pilot notes error',
				msg: 'Logbook cannot be initialized properly: ' + response,
				buttons: Ext.Msg.OK,
				icon: Ext.MessageBox.ERROR
			});
		});
		cursor.getStoreAsync();
		
		// listen to authentication events
		// TODO sposta nel giusto costruttore
		Application.user.on( 'login',  function loginHandler(context){
			if ( context.role === 'ADMIN'){
				Ext.Msg.show({
						title: 'Login successeful',
						msg: 'You are logged in.',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
				});
				Application.user.getLoginButton().setText('Logout');
				self.logbook.setToken( context.token );
				
				
				if (  ! self.logbookPanel || ! self.logbookPanel.isReady() ){
					var cursor = self.logbook.find('*');
					cursor.success( function(store){
						self.store = store;
						self.store.load({
					            params:{
					                start: 0,
					                limit: 20
					            }
					        });
						self.buildLogbookUI();

					});
					cursor.failure( function(response){
						Ext.Msg.show({
							title: 'Pilot notes error',
							msg: 'Logbook cannot be initialized properly: ' + response,
							buttons: Ext.Msg.OK,
							icon: Ext.MessageBox.ERROR
						});
					});
					cursor.getStoreAsync();
				}
				
				self.notePanel.refresh();
				self.notePanel.operator.setValue( Application.user.username );
				
			} else {
				Ext.Msg.show({
						title: 'Login failed',
						msg: 'You are not an admin user.',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
				});		
				Application.user.logout();
				
			}
			

		} );
		Application.user.on( 'logout',  function logoutHandler( context ){
			Application.user.getLoginButton().setText('Login');
			self.notePanel.refresh();
			/*self.notePanel.addToLogbookBtn.disable(); 
			self.notePanel.operator.setValue( 'Guest' );*/
			self.logbook.invalidateToken( );
		} );
		Application.user.on( 'failed',  function loginFailedHandler( context ){
			Ext.Msg.show({
					title: 'Login failed',
					msg: 'Wrong username or password.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
			});
			self.logbook.invalidateToken( );
		} );
		
	
    
		return this.buildUI();
	},

	handleRemoveFromLogbook: function( feature ){
		
		var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, deleting..."});
		appMask.show();
		
		
		if ( feature.attributes.logbookId ){
			var self = this;
			this.logbook
				.deleteByPk( feature.attributes.logbookId )
				.failure( function(response){
					appMask.hide();
					Ext.Msg.show({
						title: 'Cannot delete this note from logbook',
						msg: response,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});				
				})
				.success( function(logbookId){
					appMask.hide();
					
				   // update and disable		
				   self.note.unselect();
				}).execute();			
		} else {
			// this code should never be reached
			console.error('feature does not have a logbook id');
		}
	},
	
	
	handleAddToLogbook: function( feature ){
		
	
		var data = new Object;
		data.name = feature.attributes.name;
		data.description = feature.attributes.description;
		data.owner = Application.user.username; 
		
		// generate the KML corresponding to this feature
		var format = new OpenLayers.Format.KML({
			        'maxDepth':10,
			        'extractStyles':true
			    });
		var kmlContent = format.write( feature );
		
		var self = this;
		data.blob = kmlContent;
		
		var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, saving..."});
		appMask.show();
		
		if ( !feature.attributes.logbookId || feature.attributes.logbookId === -1 ){
			this.logbook
				.create( data )
				.failure( function(response){
					appMask.hide();
					Ext.Msg.show({
						title: 'Cannot save this note on logbook',
						msg: response,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});				
				})
				.success( function(logbookId){
					/* Ext.Msg.show({
						title: 'Note saved',
						msg: 'Note saved on logbook successfully',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
					});	*/	
					
					self.reload( feature, logbookId );
					
					appMask.hide();
					
					// set show on map = true
					// self.logbookPanel.setShowOnMap( logbookId );
							
				}).execute();			
		} else {
			this.logbook
				.update( feature.attributes.logbookId, data)
				.failure( function(response){
					appMask.hide();
					Ext.Msg.show({
						title: 'Cannot update this note on logbook',
						msg: response,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});				
				})
				.success( function(logbookId){
					/*Ext.Msg.show({
						title: 'Note updated',
						msg: 'Note updated on logbook successfully',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
					});		*/
					
					self.reload( feature, feature.attributes.logbookId );
					appMask.hide();
					
				}).execute();
		}
		

	},
	
	handleSave: function(feature){
			
			Ext.Msg.show({
				title: 'Feature saved',
				msg: 'Your changes has been saved successfully.',
				buttons: Ext.Msg.OK,
				icon: Ext.MessageBox.INFO
			});
	},
	
	reload: function(oldFeature, logbookId){
		var self = this;
		this.logbook
			.findById( logbookId )
			.success( function(data){ 
				// convert KML blob to feature
				var format = new OpenLayers.Format.KML({
						    	extractStyles: true, 
								extractAttributes: true,
								maxDepth: 2 
						    });
				var features = format.read( data.blob );
				var feature = features[0];
				feature.attributes.logbookId = logbookId;
				feature.attributes.owner = data.owner;
				var attributes = feature.attributes;
				for (var attributeName in attributes ){
					if (typeof attributes[attributeName] == "object") {
						if (attributes[attributeName].value) {
							attributes[attributeName] = attributes[attributeName].value;
						}
					}
				}
				self.note.reload( oldFeature, feature );
			}).execute();
	}
  
	

});

Ext.preg(gxp.plugins.PilotNotes.prototype.ptype, gxp.plugins.PilotNotes);
