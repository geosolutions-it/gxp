
/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDAHabitat
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDAHabitat(config)
 *
 */   
gxp.plugins.IDAHabitat = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_idahabitat */
    ptype: "gxp_idahabitat",

    title: "Habitat",
    
    buttonLinkIconPath: '../theme/app/img/silk/world_link.png',  
	
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDAHabitat.superclass.constructor.apply(this, arguments);
    },
    
    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.IDAHabitat.superclass.init.apply(this, arguments);
		this.layers = target.map.layers; 
	},    
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        this.habitatData = [];
        
        //set data from layer configuration showInTab and link
        var str = "";
        for (var i=0; i<this.layers.length; i++){
            if(this.layers[i].showInTab && this.layers[i].link){
                str += this.layers[i].visibility + ","  + this.layers[i].title + "," + this.layers[i].link;
                str += "|";
            }
        }
        
        var delLastChar = function (str){
            len = str.length;
            str = str.substring(0,len-1);
            return str;
        }
        
        var strFin = delLastChar(str);
        
        var tempArray = strFin.split('|');

        for (var i = 0; i < tempArray.length; i++) {
            this.habitatData[i] = tempArray[i].split(',');
        }
        
		var sightingsStrandingsDataReader = new Ext.data.ArrayReader({}, [
		       {name: 'selected', type: 'bool'},
			   {name: 'layer', type: 'string'},
               {name: 'link', type: 'string'}			   
		]);        
            
        this.sightingsStrandingsStore = new Ext.data.Store({
                reader: sightingsStrandingsDataReader,
                data: this.habitatData
            });            
            
        var xg = Ext.grid;

        this.habitatGrid = new xg.GridPanel({
            id: 'id_habitat_grid',
            flex:1,
            split: true,
            store: this.sightingsStrandingsStore,
            title:'Habitat, occupancy, abundance',            
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
                                var records = store.getRange(0, this.habitatData.length -1);

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
                                var title = record.get("layer");
                                this.target.viewIdaLink(link, title);
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
            id: 'id_habitat_panel',
            xtype: 'container',
            layout: 'vbox',
			autoScroll: true,
            title: this.title,
			items: [this.habitatGrid]
        });
		
        config = Ext.apply(cpanel, config || {});
        
        var habitatPanel = gxp.plugins.IDAHabitat.superclass.addOutput.call(this, config);

        for(var tool in this.target.tools){        
            if(this.target.tools[tool].ptype == "gxp_layertree"){  
                this.target.tools[tool].on("check", function(layer, checked){
                        var store = this.habitatGrid.getStore();
                        var records = store.getRange(0, this.habitatData.length -1);
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
        
        return habitatPanel;
    }
});

Ext.preg(gxp.plugins.IDAHabitat.prototype.ptype, gxp.plugins.IDAHabitat);
