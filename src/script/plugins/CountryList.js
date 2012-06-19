/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = LayerTree
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: LayerTree(config)
 *
 *    Plugin for adding a tree of layers to a :class:`gxp.Viewer`. Also
 *    provides a context menu on layer nodes.
 */   
gxp.plugins.CountryList = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_layertree */
    ptype: "gxp_countrylist",
    
    /** api: config[defaultGroup]
     *  ``String`` The name of the default group, i.e. the group that will be
     *  used when none is specified. Defaults to ``default``.
     */
    countryText: "Country",

	/**
	*/
	store : null,
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.LayerTree.superclass.constructor.apply(this, arguments);
        if (!this.groups) {
            this.groups = {
                "default": this.overlayNodeText,
                "background": {
                    title: this.baseNodeText,
                    exclusive: true
                }
            };
        }
    },
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        var target = this.target, me = this;
        var addListeners = function(node, record) {
            if (record) {
                target.on("layerselectionchange", function(rec) {
                    if (!me.selectionChanging && rec === record) {
                        node.select();
                    }
                });
                        
                if (record === target.selectedLayer) {
                    node.on("rendernode", function() {
                        node.select();
                        
                        // ///////////////////////////////////////////////////////////////////////
                        // to check the group at startup (if the layer node should be checked) 
                        // or when a layer is added.
                        // ///////////////////////////////////////////////////////////////////////
                        if(node.isLeaf() && node.getUI().isChecked()){
                            node.parentNode.getUI().toggleCheck(true);
                        }
                    });
                }else{
                    node.on("rendernode", function() {
                        // ///////////////////////////////////////////////////////////////////////
                        // to check the group at startup (if the layer node should be checked) 
                        // or when a layer is added.
                        // ///////////////////////////////////////////////////////////////////////
                        if(node.isLeaf() && node.getUI().isChecked()){
                            node.parentNode.getUI().toggleCheck(true);
                        }
                    });
                }
            }
        };
        
		//item deleter definition
		Ext.ns('Extensive.grid');
		Extensive.grid.ItemDeleter = Ext.extend(Ext.grid.RowSelectionModel, {

			width: 30,
			
			sortable: false,
			dataIndex: 0, // this is needed, otherwise there will be an error
			
			menuDisabled: true,
			fixed: true,
			id: 'deleter',
			
			initEvents: function(){
				Extensive.grid.ItemDeleter.superclass.initEvents.call(this);
				this.grid.on('cellclick', function(grid, rowIndex, columnIndex, e){
					if(columnIndex==grid.getColumnModel().getIndexById('deleter')) {
						var record = grid.getStore().getAt(rowIndex);
						grid.getStore().remove(record);
						grid.getView().refresh();
					}
				});
			},
			
			renderer: function(v, p, record, rowIndex){
				return '<div class="extensive-remove" style="width: 15px; height: 16px;"></div>';
			}
		});
		var itemdeleter =new Extensive.grid.ItemDeleter();
		this.store = new Ext.data.Store({
			
			
		});
        config = Ext.apply({
            xtype: "grid",
			store: this.store, 
			id: 'countryListGrid',
            border: false,
			
			autoScroll:true,
			enableHdMenu:false,
			viewConfig: {
				
				forceFit: true
				//Return CSS class to apply to rows depending upon data values
				
			},
            listeners: {
               //TODO
            },
			colModel: new Ext.grid.ColumnModel({
					defaults: {
						sortable: true
					},
					columns: [
						{id: 'country', header: this.countryText,  sortable: true, dataIndex: 'ADM0NAME'},
						itemdeleter
						
					],
					fields: new gxp.data.FraDataEntry()
					
			}),
			
			sm: itemdeleter
				
        }, config || {});
         
        var countryList = gxp.plugins.CountryList.superclass.addOutput.call(this, config);
        
        return countryList;
    },
	feed : function(text){
		
	
	}
});

Ext.preg(gxp.plugins.CountryList.prototype.ptype, gxp.plugins.CountryList);
