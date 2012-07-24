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


    onFinish: null,
  
    
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
	        tooltip: 'Save',
	        iconCls: 'save',
	        disabled: true,
	        handler : this.handleSave,
			scope: this
	    });
	    this.cancelBtn = new Ext.Button(
			 {
			    id: 'cancelBtn',
			    tooltip: 'Cancel',
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
								readOnly: true,
				                name:'loginUsername', 
				                allowBlank:true,
				            },{  
								xtype: 'textarea',
								width: 200,
								height: 150,
								readOnly: true,
				                fieldLabel:'Note', 
				                name:'loginPassword', 
				                allowBlank:true
				            }
					
					   ]
					}],
			        tbar:[  this.saveBtn, this.cancelBtn ]
			    })
	
			);
		
		// register to listen "addgeometry"	event
		this.target.on("addgeometry", function addGeometry(caller, callback){
			self.onFinish = callback;
			self.enable();
		});
		return panel;
	},
	
	/** private: method[handleSave]
     *  callback when save button is pressed
     */
	handleSave: function(){
		this.disable();
		if (this.onFinish){
			this.onFinish(this);
		}
	},

	/** private: method[handleCancel]
     *  callback when Cancel Button is pressed
     */
	handleCancel: function(){
		this.disable();
		if (this.onFinish){
			this.onFinish(this);
		}
	},
	
	/** private: method[disable]
     *  disable pilot notes inputs
     */
	disable: function(){
		this.saveBtn.disable();
		this.cancelBtn.disable();
	},
	
	/** private: method[enable]
     *  enable pilot notes inputs
     */
	enable: function(){
		this.saveBtn.enable();
		this.cancelBtn.enable();
	}
	

});

Ext.preg(gxp.plugins.PilotNotes.prototype.ptype, gxp.plugins.PilotNotes);
