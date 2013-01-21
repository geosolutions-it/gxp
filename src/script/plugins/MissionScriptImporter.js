/**
 *
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = MissionScriptImporter
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: MissionScriptImporter(config)
 *
 *    Allows to upload MissionScrit ZIP files.
 */
gxp.plugins.MissionScriptImporter = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_import_mission_script */
    ptype: "gxp_import_mission_script",
    
    /** api: config[importMissionScriptMenuText]
     *  ``String``
     *  Text for import MissionScript item (i18n).
     */
    importMissionScriptMenuText: "Mission Script Import",


    /** api: config[importMissionScriptTooltip]
     *  ``String``
     *  Text for import MissionScript tooltip (i18n).
     */
    importMissionScriptTooltip: "Mission Script Import",
  
    /** api: config[uploadWindowTitle]
     *  ``String``
     *  Title of the window (i18n).
     */
    uploadWindowTitle: 'Upload MissionScript Zip file',

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.MissionScriptImporter.superclass.constructor.apply(this, arguments);
    },

	addOutput: function(config){
			var self = this;
			var map = this.target.mapPanel.map;
						
			//
		    // Check the domain for the proxy usage
			//
            var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
            var mHost=pattern.exec(this.target.xmlJsonTranslateService);
            var mUrl = this.target.xmlJsonTranslateService;			
			
			var xmlJsonTranslateService = mHost[2] == location.host ? mUrl : this.target.proxy + mUrl;
			
			// open an upload file window
	        var actions = [{
	            menuText: this.importMissionScriptMenuText,
	            iconCls: "gxp-icon-import-missionscript",
	            tooltip: this.importMissionScriptTooltip,
	            handler: function() {
		            var self = this;
					
					// create an upload file form
					var form = new gxp.MissionScriptFileUploadPanel( {
						xmlJsonTranslateService: xmlJsonTranslateService,
						encodeURIComp: mHost[2] == location.host ? false : true,
						vehicleData: this.target.vehicleSelector.data
					} );
					
					// open a modal window
					var win = new Ext.Window({
						   closable:true,
						   title: this.uploadWindowTitle,
						   iconCls: "gxp-icon-import-missionscript",
						   border:false,
						   modal: true, 
						   bodyBorder: false,
						   resizable: false,
						   width: 500,
						   items: [ form ]
					});		
					
					form.on("uploadcomplete", function callback(caller, response){
						// the code to access the uploaded file
						var code = response.code;
						
						Ext.Msg.show({
							title: "Mission Script KML Ouptut Path",
							msg: code,
							icon: Ext.MessageBox.INFO
						}); 

						// destroy the window
						win.destroy();
					});
					// show window
					win.show(); 

	            },
	            scope: this
	        }];
	        return gxp.plugins.MissionScriptImporter.superclass.addActions.apply(this, [actions]);		
		
	},

    /** api: method[addActions]
     */
    addActions: function() {
		this.target.on('ready', function(){
				this.addOutput();
		}, this);	
    }
});

Ext.preg(gxp.plugins.MissionScriptImporter.prototype.ptype, gxp.plugins.MissionScriptImporter);
