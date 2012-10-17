
/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDAMmDatabase
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDAMmDatabase(config)
 *
 */   
gxp.plugins.IDAMmDatabase = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_idammdatabase */
    ptype: "gxp_idammdatabase",

    title: "Marine mammal DB",
    
    buttonLinkIconPath: '../theme/app/img/silk/world_link.png',  
	
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDAMmDatabase.superclass.constructor.apply(this, arguments);        
    },
    
    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.IDAMmDatabase.superclass.init.apply(this, arguments);
		this.layers = target.mapPanel.layers.data.items;
   
	},    
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var self = this;   
        this.speciesInformationData = this.target.mammalData.speciesInformationData;
        this.sightingsStrandingsData = this.target.mammalData.sightingsStrandingsData;
        
		var speciesInformationDataReader = new Ext.data.ArrayReader({}, [
			   {name: 'faoNames', type: 'string'},
               {name: 'species', type: 'string'},
               {name: 'family', type: 'string'},
               {name: 'link', type: 'string'}			   
		]);
        
		var sightingsStrandingsDataReader = new Ext.data.ArrayReader({}, [
		       {name: 'selected', type: 'bool'},
			   {name: 'layer', type: 'string'},
               {name: 'link', type: 'string'}			   
		]);        
        
        this.speciesInformationStore = new Ext.data.Store({
                reader: speciesInformationDataReader,
                data: this.speciesInformationData
            });
            
        this.sightingsStrandingsStore = new Ext.data.Store({
                reader: sightingsStrandingsDataReader,
                data: this.sightingsStrandingsData
            });            
            
        var xg = Ext.grid;
        
        this.speciesGrid = new xg.GridPanel({
            id: 'id_speciesInformation',
            flex:1,
            split: true,
            store: this.speciesInformationStore,
            title:'Species Information',            
			cm: new xg.ColumnModel({
                columns: [
                      {
                        header: 'Fao Names',
                        width : 120,
                        sortable : true,
                        dataIndex: 'faoNames'
                      },{
                        header: 'Species',
                        width : 120,
                        sortable : true,
                        dataIndex: 'species'
                      },{
                        header: 'Family',
                        width : 120,
                        sortable : true,
                        dataIndex: 'family'
                      },{
                        xtype: 'actioncolumn',
                        width: 50,
                        header: 'LINK',                        
						listeners: {
							scope: this,
							click: function(column, grd, row, e){
								grd.getSelectionModel().selectRow(row);
							}
						},
						items: [{
                            tooltip: 'Link',
                            icon: this.buttonLinkIconPath,
                            scope: this,
                            handler: function(gpanel, rowIndex, colIndex) {
                                    var store = gpanel.getStore();		
                                    var record = store.getAt(rowIndex);
                                    var link = record.get("link");
                                    window.open(link,"_blank");
                                }
                            }]
                      }
                  ]                
            }),
            viewConfig: {
                forceFit: true
            }            
        });

        this.sightingsGrid = new xg.GridPanel({
            id: 'id_sightingsAndStrandings',
            flex:1,
            split: true,
            store: this.sightingsStrandingsStore,
            title:'Sightings and Strandings',            
			cm: new xg.ColumnModel({
                columns: [
                      { 
                        xtype: 'checkcolumn',
                        id: 'selected',
                        header : '',
                        dataIndex: 'selected',
                        width: 20,
						listeners:{
						    scope: this,
							'checkchange': function(col, gpanel, rowIndex, evt){                                    
                                var map = this.target.mapPanel.map;
                                var store = gpanel.getStore();
                                var records = store.getRange(0, this.sightingsStrandingsData.length -1);

                                for (var i=0; i<records.length; i++){
                                    var selected = records[i].get("selected");
                                    var record = store.getAt(i);
                                    var layerName = record.get("layer");
                                    var layer = map.getLayersByName(layerName)[0];  
                                    if (layer){
                                        layer.setVisibility(selected);
                                    }                                    
                                }
							}                            
						}
                      },{
                        header: 'layer',
                        width : 75,
                        sortable : true,
                        dataIndex: 'layer'
                      },{
                        xtype: 'actioncolumn',
                        header: 'LINK',
                        width: 50,
						listeners: {
							scope: this,
							click: function(column, grd, row, e){
								grd.getSelectionModel().selectRow(row);
							}
						},
						items: [{
							tooltip: 'Link',
                            icon: this.buttonLinkIconPath,
                            scope: this,
                            handler: function(gpanel, rowIndex, colIndex) {
							    var store = gpanel.getStore();		
								var record = store.getAt(rowIndex);
                                var link = record.get("link");
                                window.open(link,"_blank");
                            }
                        }
                            ]
                      }
                  ]                
            }),
            viewConfig: {
                forceFit: true
            }                 
        });
        
        var cpanel = new Ext.Panel({
            id: 'id_mmDatabasePanel',
            xtype: 'container',
            layout: 'vbox',
			autoScroll: true,
            title: this.title,
			items: [this.speciesGrid,this.sightingsGrid]
        });
		
        config = Ext.apply(cpanel, config || {});
        
        var mmPanel = gxp.plugins.IDAMmDatabase.superclass.addOutput.call(this, config);
        
        for(var tool in this.target.tools){        
            if(this.target.tools[tool].ptype == "gxp_layertree"){  
                this.target.tools[tool].on("check", function(layer, checked){
                        var store = this.sightingsGrid.getStore();
                        var records = store.getRange(0, this.sightingsStrandingsData.length -1);
                        for (var i=0; i<records.length; i++){
                            var record = store.getAt(i);
                            var layerName = record.get("layer");
                            if (layerName == layer){
                                this.sightingsStrandingsStore.data.items[i].data.selected = checked;
                                this.sightingsStrandingsStore.fireEvent("datachanged");                                
                            }
                        }     
                },this);
            }
        }
        
        return mmPanel;
    }
});

Ext.preg(gxp.plugins.IDAMmDatabase.prototype.ptype, gxp.plugins.IDAMmDatabase);
