/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDASearch
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDASearch(config)
 *
 */   
gxp.plugins.IDASearch = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_layertree */
    ptype: "gxp_idasearch",

    // Begin i18n.
    title: "Search",
    northLabel:"North",
    westLabel:"West",
    eastLabel:"East",
    southLabel:"South",
    aioFieldSetTitle: "Region Of Interest",
    setAoiText: "SetROI",
    setAoiTooltip: 'Enable the SetBox control to draw a ROI (BBOX) on the map',
    // End i18n.
    
    spatialFilterOptions: {
            lonMax: 20037508.34,   //90,
            lonMin: -20037508.34,  //-90,
            latMax: 20037508.34,   //180,
            latMin: -20037508.34  //-180
    },
    
    toggleGroup: null,
    
    containerEl: null,
    
    /** private: method[constructor]
     *  :arg config: ``Object``
     */
    constructor: function(config) {
        gxp.plugins.IDASearch.superclass.constructor.apply(this, arguments);
    },
    
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var map = this.target.mapPanel.map;
        map.enebaleMapEvent = true;
        
        var spatialSearch = this.makeSearchForm(map);
        
        config = Ext.apply(spatialSearch, config || {});
        
        var controlPanel = gxp.plugins.IDASearch.superclass.addOutput.call(this, config);

        if(this.containerEl)
            Ext.getCmp(this.containerEl).setActiveTab(controlPanel);
        
        return controlPanel;
    },
    
    /** private: method[makeSearchForm]
     *  :arg map: ``Object``
     */
    makeSearchForm: function(map){
        this.northField = new Ext.form.NumberField({
              fieldLabel: this.northLabel,
              id: "NorthBBOX",
              width: 100,
              minValue: this.spatialFilterOptions.lonMin,
              maxValue: this.spatialFilterOptions.lonMax,
              decimalPrecision: 5,
              allowDecimals: true,
              hideLabel : false                    
        });
        
        this.westField = new Ext.form.NumberField({
              fieldLabel: this.westLabel,
              id: "WestBBOX",
              width: 100,
              minValue: this.spatialFilterOptions.latMin,
              maxValue: this.spatialFilterOptions.latMax,
              decimalPrecision: 5,
              allowDecimals: true,
              hideLabel : false                    
        });
        
        this.eastField = new Ext.form.NumberField({
              fieldLabel: this.eastLabel,
              id: "EastBBOX",
              width: 100,
              minValue: this.spatialFilterOptions.latMin,
              maxValue: this.spatialFilterOptions.latMax,
              decimalPrecision: 5,
              allowDecimals: true,
              hideLabel : false                    
        });
              
        this.southField = new Ext.form.NumberField({
              fieldLabel: this.southLabel,
              id: "SouthBBOX",
              width: 100,
              minValue: this.spatialFilterOptions.lonMin,
              maxValue: this.spatialFilterOptions.lonMax,
              decimalPrecision: 5,
              allowDecimals: true,
              hideLabel : false                    
        });
                  
        //
        // Geographical Filter Field Set
        //        
        var selectAOI = new OpenLayers.Control.SetBox({      
            map: map,    
            onChangeAOI: function(){
                var aoiArray = this.currentAOI.split(',');
                
                document.getElementById('WestBBOX').value = aoiArray[0];
                document.getElementById('SouthBBOX').value = aoiArray[1];
                document.getElementById('EastBBOX').value = aoiArray[2];
                document.getElementById('NorthBBOX').value = aoiArray[3];
            } 
        }); 
        
        map.addControl(selectAOI);
        
        this.aoiButton = new Ext.Button({
              text: this.setAoiText,
              tooltip: this.setAoiTooltip,
              enableToggle: true,
              toggleGroup: this.toggleGroup,
              iconCls: 'aoi-button',
              height: 50,
              width: 50,
              listeners: {
                  scope: this, 
                  toggle: function(button, pressed) {
                     if(pressed){
                     
                          //
                          // Reset the previous control
                          //
                          var aoiLayer = map.getLayersByName("AOI")[0];
                          
                          if(aoiLayer)
                              map.removeLayer(aoiLayer);
                          
                          if(this.northField.isDirty() && this.southField.isDirty() && 
                              this.eastField.isDirty() && this.westField.isDirty()){
                              this.northField.reset();
                              this.southField.reset();
                              this.eastField.reset();
                              this.westField.reset();
                          }

                          //
                          // Activating the new control
                          //                          
                          selectAOI.activate();
                      }else{
                          selectAOI.deactivate();
                      }
                  }
              }
        });
              
        this.spatialFieldSet = new Ext.form.FieldSet({
            title: this.aioFieldSetTitle,
            id: 'bboxAOI-set',
            autoHeight: true,
            layout: 'table',
            layoutConfig: {
                columns: 3
            },
            defaults: {
                // applied to each contained panel
                bodyStyle:'padding:5px;'
            },
            bodyCssClass: 'aoi-fields',
            items: [
                {
                    layout: "form",
                    cellCls: 'spatial-cell',
                    labelAlign: "top",
                    border: false,
                    colspan: 3,
                    items: [
                        this.northField
                    ]
                },{
                    layout: "form",
                    cellCls: 'spatial-cell',
                    labelAlign: "top",
                    border: false,
                    items: [
                        this.westField
                    ]
                },{
                    layout: "form",
                    cellCls: 'spatial-cell',
                    border: false,
                    items: [
                        this.aoiButton
                    ]                
                },{
                    layout: "form",
                    cellCls: 'spatial-cell',
                    labelAlign: "top",
                    border: false,
                    items: [
                       this.eastField
                    ]
                },{
                    layout: "form",
                    cellCls: 'spatial-cell',
                    labelAlign: "top",
                    border: false,
                    colspan: 3,
                    items: [
                        this.southField
                    ]
                }
            ]
        });
        
        var spanel = new Ext.Panel({
            border: false,
            layout: "fit",
            title: this.title,
            items:[
                this.spatialFieldSet
            ]
        });
        
        return spanel;
    }
});

Ext.preg(gxp.plugins.IDASearch.prototype.ptype, gxp.plugins.IDASearch);
