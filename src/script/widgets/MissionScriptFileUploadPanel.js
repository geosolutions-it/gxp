/**
 * 
 */

/** api: (define)
 *  module = gxp
 *  class = MissionScriptFileUploadPanel
 *  base_link = `Ext.FormPanel <http://extjs.com/deploy/dev/docs/?class=Ext.FormPanel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: MissionScriptFileUploadPanel(config)
 *   
 *      A panel for uploading a new MissionScript file.
 */
gxp.MissionScriptFileUploadPanel = Ext.extend(Ext.FormPanel, {
    
	ptype: "gxp_missionscriptfileuploadpanel",
	
    /** i18n */
    fileLabel: "Mission script file",
    fieldEmptyText: "Browse for Mission Script files...",
    uploadText: "Upload",
    waitMsgText: "Uploading your data...",
    invalidFileExtensionText: "File extension must be one of: ",
    resetText: "Reset",
    failedUploadingTitle: "Cannot upload file",
    /** end i18n */

    
    /** private: property[fileUpload]
     *  ``Boolean``
     */
    fileUpload: true,

	width: 500,
	frame: true,
    autoHeight: true,
	bodyStyle: 'padding: 10px 10px 0 10px;',
	labelWidth: 50,
	defaults: {
	     anchor: '95%',
	     allowBlank: false,
	     msgTarget: 'side'
	},

    
    /** api: config[validFileExtensions]
     *  ``Array``
     *  List of valid file extensions.  These will be used in validating the 
     *  file input value.  Default is ``[".zip"]``.
     */
    validFileExtensions: [".zip"],
    
    /** api: config[url]
     *  ``String``
     *  encodeURIComp for upload service.
     */
	 encodeURIComp: false,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
		this.xmlJsonTranslateService = config.xmlJsonTranslateService;
        gxp.MissionScriptFileUploadPanel.superclass.constructor.call(this, config);
    },
    
    /** private: method[initComponent]
     */
    initComponent: function() {
        var self = this;
        this.items = [{
            xtype: "fileuploadfield",
            id: "file",
            emptyText: this.fieldEmptyText,
            fieldLabel: this.fileLabel,
			//width: 200,
			//labelStyle: 'font-weight:bold; width:150px;',
            name: "file",
            buttonText: "",
            buttonCfg: {
                iconCls: "gxp-icon-filebrowse"
            },
            listeners: {
                "fileselected": function(cmp, value) {
                    // remove the path from the filename - avoids C:/fakepath etc.
                    cmp.setValue(value.split(/[/\\]/).pop());
					self.filename = cmp.getValue();
					self.buttons[0].enable();
                }
            },
            validator: this.fileNameValidator.createDelegate(this)
        }
        ];
        
        this.buttons = [{
            text: this.uploadText,
			disabled:true,
            handler: function() {
	
				this.url = this.xmlJsonTranslateService;
				
				var ext = this.filename.slice(-4).toLowerCase();
				switch( ext ){
					case '.zip':
					  this.url += this.encodeURIComp ? encodeURIComponent('FileUploader?moveFile=true&zipName=elettra') : 'FileUploader?moveFile=true&zipName=elettra';
					  //this.url = encodeURIComponent(this.url);
					  break;
					default:
					  // this code should not be executed
					  console.log('unknown extention: cannot upload file.');
					  return;
				}
			
				var map = this.map;
                var form = this.getForm();
                if (form.isValid()) {
                    form.submit({
                        url: this.url, 
                        submitEmptyText: false,
                        waitMsg: this.waitMsgText,
                        waitMsgTarget: true,
                        reset: true,
                        scope: this,
						failure: function(form, action){
							//console.error(action);
							Ext.Msg.show({
                               title: this.failedUploadingTitle,
                               msg: action.responseText || "Service Failure, see server logs for details.",
                               buttons: Ext.Msg.OK,
                               icon: Ext.MessageBox.ERROR
                            });
						},
						success:this.handleUploadSuccess
                    });
                }
            },
            scope: this
        },{
			text: this.resetText,
			scope: this,
			handler: function(){
				this.getForm().reset();
			}
		  }
	    ];
        
        this.addEvents(

            /**
             * Event: uploadcomplete
             * Fires upon successful upload.
             *
             * Listener arguments:
             * panel - {<gxp.LayerUploadPanel} This form panel.
             * details - {Object} An object with "name" and "href" properties
             *     corresponding to the uploaded layer name and resource href.
             */
            "uploadcomplete"
        ); 

        gxp.MissionScriptFileUploadPanel.superclass.initComponent.call(this);
    },
    
    /** private: method[fileNameValidator]
     *  :arg name: ``String`` The chosen filename.
     *  :returns: ``Boolean | String``  True if valid, message otherwise.
     */
    fileNameValidator: function(name) {
        var valid = false;
        var ext, len = name.length;
		
        for (var i=0, ii=this.validFileExtensions.length; i<ii; ++i) {
            ext = this.validFileExtensions[i];
            if (name.slice(-ext.length).toLowerCase() === ext) {
                valid = true;
                break;
            }
        }
		
        return valid || this.invalidFileExtensionText + '<br/>' + this.validFileExtensions.join(", ");
    },

    /** private: method[getUploadUrl]
     */
    /*getUploadUrl: function() {
        return this.url + "/upload";
    },*/
     
    /** private: method[handleUploadSuccess]
     */
    handleUploadSuccess: function(form, action) {
        var obj = Ext.decode( action.response.responseText );
		var filename = this.filename;
		var response = new Object;
		
		response.filename = filename;
		response.code = obj.result.code;
		response.url = this.url;
		
        this.fireEvent("uploadcomplete", this, response);
    }

});

/** api: xtype = gxp_missionscriptfileuploadpanel */
Ext.reg(gxp.MissionScriptFileUploadPanel.prototype.ptype, gxp.MissionScriptFileUploadPanel);
