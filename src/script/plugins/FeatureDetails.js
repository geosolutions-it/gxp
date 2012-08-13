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
								anchor:'100% -47',
								id: 'details-description-textfield'
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
			if ( feature.attributes ){
				Ext.getCmp("details-name-textfield").setValue( feature.attributes.name );
				Ext.getCmp("details-description-textfield").setValue( feature.attributes.description );
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
			var name = Ext.getCmp("details-name-textfield").getValue();
			var description = Ext.getCmp("details-description-textfield").getValue();
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
	
	/** private: method[disable]
     *  disable pilot notes inputs
     */
	disable: function(){
		this.saveBtn.disable();
		this.cancelBtn.disable();
		Ext.getCmp("details-name-textfield").disable();
		Ext.getCmp("details-description-textfield").disable();
	},
	
	/** private: method[enable]
     *  enable pilot notes inputs
     */
	enable: function(){
		this.saveBtn.enable();
		this.cancelBtn.enable();
		Ext.getCmp("details-name-textfield").enable();
		Ext.getCmp("details-description-textfield").enable();
	},
	
	resetForm: function(){
		Ext.getCmp("details-name-textfield").setValue( '' );
		Ext.getCmp("details-description-textfield").setValue( '' );
	}
	

});

Ext.preg(gxp.plugins.FeatureDetails.prototype.ptype, gxp.plugins.FeatureDetails);