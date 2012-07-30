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
    pilotNotesMenuText: "Pilot Notes",


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
	        tooltip: this.saveButtonTooltip,
	        iconCls: 'save',
	        disabled: true,
	        handler : this.handleSave,
			scope: this
	    });
	    this.cancelBtn = new Ext.Button(
			 {
			    id: 'cancelBtn',
			    tooltip: this.cancelButtonTooltip,
			    iconCls: 'cancel',
			    disabled: true,
			    handler : this.handleCancel,
				scope: this
			  }		
		);
	    this.deleteBtn = new Ext.Button(
			 {
			    id: 'deleteBtn',
			    tooltip: this.deleteButtonTooltip,
			    iconCls: 'delete',
			    disabled: true,
			    handler : this.handleDelete,
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
				                allowBlank:true,
								disabled: true,
								id:'name-textfield'
				            },{  
								xtype: 'textarea',
								width: 200,
								height: 150,
								disabled: true,
				                fieldLabel:'Note', 
				                name:'loginPassword', 
				                allowBlank:true,
								id: 'description-textfield'
				            }
					
					   ]
					}],
			        tbar:[  this.saveBtn, this.cancelBtn, '->', this.deleteBtn ]
			    })
	
			);
		
		// register to listen "addgeometry"	event
		this.target.on("featureselected", function selectFeature(container, feature){
			self.feature = feature;
			self.container = container;
			if ( feature.attributes ){
				Ext.getCmp("name-textfield").setValue( feature.attributes.name );
				Ext.getCmp("description-textfield").setValue( feature.attributes.description );
			}
			self.enable();
		});
		this.target.on("featureunselected", function selectFeature(container){
			self.feature = null;
			self.container = null;
			self.disable();
			self.resetForm();
		});
		return panel;
	},
	
	/** private: method[handleSave]
     *  callback when save button is pressed
     */
	handleSave: function(){
		this.disable();
		if (this.feature && this.container){
			var name = Ext.getCmp("name-textfield").getValue();
			var description = Ext.getCmp("description-textfield").getValue();
			this.feature.attributes = { name:name, description:description };
			this.container.saveFeature(this.feature);
			this.resetForm();
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
	
	/** private: method[handleDelete]
     *  callback when Delete Button is pressed
     */
	handleDelete: function(){
		this.disable();
		if (this.feature && this.container){
			this.container.removeFeature(this.feature);
			this.resetForm();
		}
	},
	
	/** private: method[disable]
     *  disable pilot notes inputs
     */
	disable: function(){
		this.saveBtn.disable();
		this.cancelBtn.disable();
		this.deleteBtn.disable();
		Ext.getCmp("name-textfield").disable();
		Ext.getCmp("description-textfield").disable();
	},
	
	/** private: method[enable]
     *  enable pilot notes inputs
     */
	enable: function(){
		this.saveBtn.enable();
		this.cancelBtn.enable();
		this.deleteBtn.enable();
		Ext.getCmp("name-textfield").enable();
		Ext.getCmp("description-textfield").enable();
	},
	
	resetForm: function(){
		Ext.getCmp("name-textfield").setValue( '' );
		Ext.getCmp("description-textfield").setValue( '' );
	}
	

});

Ext.preg(gxp.plugins.PilotNotes.prototype.ptype, gxp.plugins.PilotNotes);
