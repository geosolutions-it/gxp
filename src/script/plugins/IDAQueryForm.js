/**
 * @requires plugins/Tool.js
 * @include widgets/FilterBuilder.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = IDAQueryForm
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IDAQueryForm(config)
 *
 *    Plugin for performing queries on feature layers
 *    TODO Replace this tool with something that is less like GeoEditor and
 *    more like filtering.
 */
gxp.plugins.IDAQueryForm = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_queryform */
    ptype: "gxp_idaqueryform",

    /** api: config[featureManager]
     *  ``String`` The id of the :class:`gxp.plugins.FeatureManager` to use
     *  with this tool.
     */
    featureManager: null,
    
    /** api: config[autoHide]
     *  ``Boolean`` Set to true if the output of this tool goes into an
     *  ``Ext.Window`` that should be hidden when the query result is
     *  available. Default is false.
     */
    autoHide: false,

    /** private: property[schema]
     *  ``GeoExt.data.AttributeStore``
     */
    schema: null,
    
    /** api: config[queryActionText]
     *  ``String``
     *  Text for query action (i18n).
     */
    queryActionText: "Query",
    
    /** api: config[cancelButtonText]
     *  ``String``
     *  Text for cancel button (i18n).
     */
    cancelButtonText: "Cancel",

    /** api: config[queryMenuText]
     *  ``String``
     *  Text for query menu item (i18n).
     */
    queryMenuText: "Query layer",

    /** api: config[queryActionTip]
     *  ``String``
     *  Text for query action tooltip (i18n).
     */
    queryActionTip: "Query the selected layer",

    /** api: config[queryByLocationText]
     *  ``String``
     *  Text for query by location (i18n).
     */
    queryByLocationText: "Region Of Interest",

    /** api: config[currentTextText]
     *  ``String``
     *  Text for query by current extent (i18n).
     */
    currentTextText: "Current extent",

    /** api: config[queryByAttributesText]
     *  ``String``
     *  Text for query by attributes (i18n).
     */
    queryByAttributesText: "Query by attributes",
    
    /** api: config[queryMsg]
     *  ``String``
     *  Text for query load mask (i18n).
     */
    queryMsg: "Querying...",
    
    /** api: config[noFeaturesTitle]
     *  ``String``
     *  Text for no features alert title (i18n)
     */
    noFeaturesTitle: "No Match",

    /** api: config[noFeaturesMsg]
     *  ``String``
     *  Text for no features alert message (i18n)
     */
    noFeaturesMessage: "Your query did not return any results.",

    /** api: config[actions]
     *  ``Object`` By default, this tool creates a "Query" action to trigger
     *  the output of this tool's form. Set to null if you want to include
     *  the form permanently in your layout.
     */
    
    /** api: config[outputAction]
     *  ``Number`` By default, the "Query" action will trigger this tool's
     *  form output. There is no need to change this unless you configure
     *  custom ``actions``.
     */
    outputAction: 0,
    
    /** api: config[disableAdvSearch]
     *  ``Boolean`` default true. Disable the fields for advanced search.
     */
    disableAdvSearch: false,
    
    
    wfsGrid: "wfsGridPanel",
    
    // Begin i18n.
    northLabel:"North",
    westLabel:"West",
    eastLabel:"East",
    southLabel:"South",
    setAoiText: "SetROI",
    setAoiTooltip: "Enable the SetBox control to draw a ROI (BBOX) on the map",
    attributeEnablement: "Query by Attribute",
    attributeEnablementMsg: "Invalid search Type! To use this you have to select 'Feature' type and to select a vector layer before.",
    searchType: "Base Settings",
    typeLabel: "Type",
    featureLabel: "Max Features",
    spatialLabelText: "Without setting a ROI you query the entire set of data in the current Map extent.",
    featureLabelText: "With an high number of features the server can take a long time to respond. Limit your search!",
    spmText:"SPM",
    sourcedepthLabel : "Source Depth (m)",
    sourcefrequencyLabel : 'Source Frequency (kHz)',
    sourcepressurelevelLabel : 'Source Pressure Level (dB)',
    modelnameLabel : 'Model Name',
    seasonLabelText: 'Season',
    securityLevelLabelText : 'Security Level',
    allText: 'All',
    springText : "Spring",
    winterText : "Winter",
    fallText : "Fall",
    summerText : "Summer",
    modelRunDateText:'Model Run Date',
    modelEndDateText:'Model End Date',
    
    qualityLabel: "Quality",
    bottomTypeLabel: "Bottom Type",
    tlModelLabel: "TL Model",
    // End i18n.
    
    /**
     * Property: selectStyle
     * {Object} Configuration of OpenLayer.Style. 
     *    used to highlight the BBOX
     *     
     */
    selectStyle:{
        fillColor: "#FF0000",
        strokeColor: "#FF0000",
        fillOpacity:0,
        strokeWidth:2,
        strokeOpacity:1
    },
    
    spatialFilterOptions: {
            lonMax: 90,
            lonMin: -90,
            latMax: 180,
            latMin: -180
    },
    
    securityLevels: [
        this.allText,
        'NATO UNCLASSIFIED',
        'NATO RESTRICTED',
        'NATO CONFIDENTIAL',
        'NATO SECRET',
        'NATO TOP SECRET',
    ],
    
    maxFeatures: 20,
        
    constructor: function(config) {
        gxp.plugins.IDAQueryForm.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addOutput]
     */
    addOutput: function(config) {
        var featureManager = this.target.tools[this.featureManager];
        featureManager.maxFeatures = 20;
        
        var map = this.target.mapPanel.map;
        map.enebaleMapEvent = true;
        
        config = Ext.apply({
            title: this.title,
            border: false,
            bodyStyle: "padding: 5px",
            layout: "form",
            xtype: "form",
            autoScroll: true,
            items: [{
                xtype: "fieldset",
                ref: "typeFieldSet",
                title: this.searchType,
                items: [{
                    xtype: "combo",
                    store: [
                            "SPM",
                            "Feature"
                    ],
                    value:  "SPM",
                    ref: "../type",
                    width:210,
                    fieldLabel: this.typeLabel,
                    name: this.typeLabel,
                    allowBlank: false,
                    emptyText: "Basic",
                    editable: false,
                    triggerAction: "all",
                    resizable: false,
                    listeners: {
                        select: function(combo, record, index){
                            var schema = featureManager.schema;
                            if(combo.getValue() == 'Feature' && schema){
                                queryForm.attributeFieldset.setDisabled(false);
                                queryForm.attributeFieldset.expand(true);
                            }else{
                                queryForm.attributeFieldset.setDisabled(true);
                                queryForm.attributeFieldset.collapse(true);
                            }
                            // panel visiblity
                            var featureSelected=(combo.getValue() == 'Feature');
                            queryForm.attributeFieldset.setVisible(featureSelected);
                            queryForm.spmFieldSet.setVisible(!featureSelected);
                        }
                    }
                }, {
                    xtype: "numberfield",
                    ref: "../maxfeature",
                    width:210,
                    fieldLabel: this.featureLabel,
                    value: this.maxFeatures,
                    allowBlank: false,
                    minValue: 5,
                    maxValue: 100,
                    allowDecimals: false
                }, {
                    xtype: "label",
                    style:"color:red; font-size:10px",
                    ref: "../baseLabel",
                    text: ""
                }]
            },{
                xtype: "fieldset",
                ref: "spatialFieldset",
                title: this.queryByLocationText,
                autoHeight: true,
                checkboxToggle: true,
                items: [
                    {
                        xtype: "label",
                        style:"color:orange; font-size:10px",
                        ref: "../spatialLabel",
                        id: "spatialLabel",
                        text: this.spatialLabelText
                    }, {
                        xtype: "panel",
                        border: false,
                        header: false,
                        ref: "../aoiFieldset",
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
                        checkboxToggle: true,
                        items: [
                            this.populateSpatialForm(map)
                        ]
                    }
                ]
            }, {
                xtype: "fieldset",
                ref: "attributeFieldset",
                disabled: true,
                hidden: true,
                title: this.queryByAttributesText,
                collapsed: true,
                checkboxToggle: true
            },{
                xtype: "fieldset",
                ref: "spmFieldSet",
                hidden:false,
                layout:'form',
                title:this.spmText,
                collapsed: false,
                
                items: [
                    new Ext.form.ComboBox({
                        width:210,
                        allowBlank: false,
                        forceSelection: true,
                        editable: false,
                        name:"season",
                        triggerAction: 'all',
                        lazyRender:true,
                        fieldLabel:this.seasonLabelText,
                        mode: 'local',
                        store: [
                                this.allText,
                                this.springText,
                                this.summerText,
                                this.fallText,
                                this.winterText
                        ],
                        valueField: 'myId',
                        displayField: 'displayText',
                        value:  this.allText
                    })/*,
                    new Ext.form.ComboBox({
                        width:210,
                        allowBlank: false,
                        forceSelection: true,
                        editable: false,
                                                id:"securityLevel",
                        triggerAction: 'all',
                        lazyRender:true,
                                                disabled: this.disableAdvSearch,
                        fieldLabel: this.securityLevelLabelText,
                        mode: 'local',
                        store:  this.securityLevels,
                        valueField: 'myId',
                        value: this.allText,
                        displayField: 'displayText'
                    })*/,
                    {
                        fieldLabel: this.sourcedepthLabel,
                        name: 'sourcedepth',
                        disabled: this.disableAdvSearch,
                        xtype: 'numberfield',
                        width:210

                    },{
                        fieldLabel: this.sourcefrequencyLabel,
                        name: 'sourcefrequency',
                        xtype: 'numberfield',
                        width:210

                    },{
                        fieldLabel: this.sourcepressurelevelLabel,
                        name: 'sourcepressurelevel',
                        xtype: 'numberfield',
                        width:210

                    }, {
                        fieldLabel: this.tlModelLabel,
                        name: 'tlmodel',
                        xtype: 'textfield',
                        width:210
                    }, {
                        fieldLabel: this.bottomTypeLabel,
                        name: 'bottomtype',
                        xtype: 'textfield',
                        width:210
                    }, {
                        fieldLabel: this.qualityLabel,
                        name: 'quality',
                        xtype: 'textfield',
                        width:210
                    }, {
                        fieldLabel: this.modelnameLabel,
                        name: 'modelname',
                        xtype: 'textfield',
                        width:210
                    }, {
                        xtype: 'compositefield',
                        fieldLabel: this.modelRunDateText,
                        defaults:{
                            
                        },
                        items:[
                            {
                                name: 'modelrundate',
                                xtype: 'datefield',
                                id:'runDate',
                                width:110
                            },{
                                name:'modelrunhour',
                                xtype: "timefield",
                                editable:false,
                                forceSelection:true,
                                triggerAction: "all",
                                minValue: '00',  
                                maxValue: '23',  
                                increment: 1,  
                                format:'i',
                                width:40,
                                value: '00'
                            },{
                                xtype: 'displayfield',
                                value: ':'
                            },{
                                name:'modelrunmin',
                                xtype: "timefield",
                                editable:false,
                                forceSelection:true,
                                triggerAction: "all",
                                minValue: '00',  
                                maxValue: '59',  
                                increment: 1,  
                                format:'i',
                                width:40,
                                value: '00'
                            },{
                                xtype:'button',
                                iconCls:'icon-attribute-reset',
                                handler:function(){
                                    queryForm.getForm().findField("modelrundate").setValue("");
                                    queryForm.getForm().findField("modelrunhour").setValue("");
                                    queryForm.getForm().findField("modelrunmin").setValue("");
                                }
                            }
                        ]
                    },
                    {
                        fieldLabel: this.modelEndDateText,
                        xtype: 'compositefield',
                        items:[
                            {
                                name: 'modelenddate',
                                xtype: 'datefield',
                                width:110
                            },{
                                name:'modelendhour',
                                xtype: "timefield",
                                editable:false,
                                forceSelection:true,
                                triggerAction: "all",
                                minValue: '00',  
                                maxValue: '23',  
                                increment: 1,  
                                format:'i',
                                width:40,
                                value: '00'
                            },{
                                xtype: 'displayfield',
                                value: ':'
                            },{
                                name:'modelendmin',
                                xtype: "timefield",
                                editable:false,
                                forceSelection:true,
                                triggerAction: "all",
                                minValue: '00',  
                                maxValue: '59',  
                                increment: 1,  
                                format:'i',
                                width:40,
                                value: '00'
                            },{
                                xtype:'button',
                                iconCls:'icon-attribute-reset',
                                handler:function(){
                                    queryForm.getForm().findField("modelenddate").setValue("");
                                    queryForm.getForm().findField("modelendhour").setValue("");
                                    queryForm.getForm().findField("modelendmin").setValue("");
                                }
                            }
                        ]
                    }

                ]
            }
                
            ],
            bbar: ["->", {
                text: this.cancelButtonText,
                ref: "cancel",
                iconCls: "cancel",
                scope: this,
                handler: function() {
                    var ownerCt = this.outputTarget ? queryForm.ownerCt :
                        queryForm.ownerCt.ownerCt;
                    if (ownerCt && ownerCt instanceof Ext.Window) {
                        ownerCt.hide();
                    } else {
                        //
                        // Cleaning the attribute form
                        //
                        addFilterBuilder(
                            featureManager, 
                            featureManager.layerRecord,
                            featureManager.schema
                        );
                    }
                    
                    //
                    // Reset the Query form
                    //
                    queryForm.type.reset();
                    queryForm.maxfeature.reset();
                    queryForm.baseLabel.setText("");
                    queryForm.spatialLabel.setText("");

                    //
                    // Removing the ROI 
                    //
                    this.aoiButton.toggle(false);
                    
                    //
                    // Cleaning the Feature grid
                    //
                    if(featureManager && featureManager.featureStore){
                        featureManager.featureStore.removeAll();
                    }
                    if(queryForm.type.getValue() != 'Feature' || !featureManager.schema){
                        queryForm.attributeFieldset.setDisabled(true);
                        queryForm.attributeFieldset.collapse(true);
                    }
                    queryForm.getForm().reset();
                    // panel visiblity
                    var featureSelected=(queryForm.type.getValue() == 'Feature');
                    queryForm.attributeFieldset.setVisible(featureSelected);
                    queryForm.spmFieldSet.setVisible(!featureSelected);
                    
                    if(queryForm.type.getValue() != 'Feature'){
                       var wfsGrid=this.target.tools[this.wfsGrid];
                       wfsGrid.resetFilter();
                    }
                    
                }
            }, {
                text: this.queryActionText,
                ref: "../query",
                iconCls: "gxp-icon-find",
                disabled: false,
                scope: this,
                handler: function() {                
                    if(queryForm.type.getValue() == 'Feature'){
                        if(featureManager.schema){
                            var filters = [];
                            
                            if (queryForm.spatialFieldset.collapsed !== true) {
                                 var roi = new OpenLayers.Bounds(
                                    this.westField.getValue(), 
                                    this.southField.getValue(), 
                                    this.eastField.getValue(), 
                                    this.northField.getValue()
                                 );
                                 
                                 var bbox = roi;
                                 if(!bbox)
                                    bbox = this.target.mapPanel.map.getExtent();
                                    
                                 filters.push(new OpenLayers.Filter.Spatial({
                                    type: OpenLayers.Filter.Spatial.BBOX,
                                    property: featureManager.featureStore.geometryName,
                                    value: bbox
                                 }));
                            }
                            
                            if (queryForm.attributeFieldset.collapsed !== true) {
                                var attributeFilter = queryForm.filterBuilder.getFilter();
                                attributeFilter && filters.push(attributeFilter);
                            }
                            
                            var mf = null;
                            if(queryForm.maxfeature.isValid()){
                                var south = Ext.getCmp('south'); 
                                
                                if(south.collapsed){
                                    south.expand();
                                    south.syncSize();
                                }
                                 
                                mf = queryForm.maxfeature.getValue();
                                
                                if(mf > 50)
                                    queryForm.baseLabel.setText(this.featureLabelText);
                                else
                                    queryForm.baseLabel.setText("");
                                
                                featureManager.loadFeatures(mf, filters.length > 1 ?
                                    new OpenLayers.Filter.Logical({
                                        type: OpenLayers.Filter.Logical.AND,
                                        filters: filters
                                    }) :
                                    filters[0]
                                );
                            }else{
                                Ext.Msg.show({
                                    title: "Max Features",
                                    msg: "MaxFeature value is null or incorrect !",
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.Msg.INFO
                                });
                            }
                        }else{
                            Ext.Msg.show({
                                title: "Features Search",
                                msg: "Feature schema is null !",
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO
                            });
                        }
                         Ext.getCmp('south').expand(false);
                         Ext.getCmp('idalaylist').setActiveTab(Ext.getCmp('featuregrid'));
                    }else{
                        var formValues=queryForm.getForm().getFieldValues(true);
                        
                        var SPMFilter = new OpenLayers.Filter.Logical({
                            type: OpenLayers.Filter.Logical.AND,
                            filters: []
                        });
                        
                        if(formValues.NorthBBOX && formValues.WestBBOX
                           && formValues.EastBBOX && formValues.SouthBBOX)
                            SPMFilter.filters.push(new OpenLayers.Filter.Spatial({
                                type: OpenLayers.Filter.Spatial.BBOX,
                                value: new OpenLayers.Bounds(formValues.WestBBOX, 
                                formValues.SouthBBOX,
                                formValues.EastBBOX, 
                                formValues.NorthBBOX),
                                projection: "EPSG:4326"
                            }));
                        
                        if(formValues.modelname){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.LIKE,
                                    property: "modelName",
                                    matchCase: false,
                                    value: "*"+formValues.modelname+"*"
                                })
                            );
                        }
                        
                        if(formValues.sourcefrequency){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                    property: "sourceFrequency",
                                    value: formValues.sourcefrequency
                                })
                            );
                        }
                        
                        if(formValues.sourcepressurelevel){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                    property: "sourcePressureLevel",
                                    value: formValues.sourcepressurelevel
                                })
                            );
                        }
                        
                        if(formValues.tlmodel){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.LIKE,
                                    property: "tlModel",
                                    matchCase: false,
                                    value: "*"+formValues.tlmodel+"*"
                                })
                            );
                        }
                        
                        if(formValues.bottomtype){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.LIKE,
                                    property: "bottomType",
                                    matchCase: false,
                                    value: "*"+formValues.bottomtype+"*"
                                })
                            );
                        }
                        
                        if(formValues.quality){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.LIKE,
                                    property: "quality",
                                    matchCase: false,
                                    value: "*"+formValues.quality+"*"
                                })
                            );
                        }
                        
                        if(formValues.season){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                    property: "season",
                                    value: formValues.season.toLowerCase()
                                })
                            );
                        }
                        
                        if(formValues.securityLevel){
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                    property: "securityLevel",
                                    value: formValues.securityLevel
                                })
                            );
                        }
                        
                        
                        var endDate=queryForm.getForm().findField("modelenddate").getValue();
                        var endDateHour=queryForm.getForm().findField("modelendhour").getValue();
                        var endDateMin=queryForm.getForm().findField("modelendmin").getValue();
                        
                        if(endDate){
                            if(endDateHour){
                                endDate.setHours(endDateHour);
                            }
                            if(endDateMin){
                                endDate.setMinutes(endDateMin); 
                            }
                            
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                                    property: "runEnd",
                                    value: endDate.format("Y-m-d H:i")+":00"
                                })
                            );
                        }
                        
                        
                        var runDate=queryForm.getForm().findField("modelrundate").getValue();
                        var runDateHour=queryForm.getForm().findField("modelrunhour").getValue();
                        var runDateMin=queryForm.getForm().findField("modelrunmin").getValue();
                        
                        if(runDate){
                            if(runDateHour)
                                runDate.setHours(runDateHour); 
                            if(runDateMin)
                                runDate.setMinutes(runDateMin); 
                            
                            SPMFilter.filters.push(
                                new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                                    property: "runBegin",
                                    value: runDate.format("Y-m-d H:i")+":00"
                                })
                            );
                        }
                       var wfsGrid=this.target.tools[this.wfsGrid];
                       var wfsgridComp = Ext.getCmp(wfsGrid.id);
                       Ext.getCmp('south').expand(false);
                       Ext.getCmp('idalaylist').setActiveTab(wfsgridComp);
                       wfsGrid.setFilter(SPMFilter);
                      
                    }
                }
            }]
        }, config || {});
        
        var queryForm = gxp.plugins.QueryForm.superclass.addOutput.call(this, config);
        
        if (queryForm) {
            this.target.tools[this.featureManager].on("layerchange", function(mgr, rec, schema) {
                if(queryForm.type.getValue() == 'Feature' && schema){
                    queryForm.attributeFieldset.setDisabled(!schema);
                }else{
                    queryForm.attributeFieldset.setDisabled(true);
                }
            }, this);
        }
        
        var addFilterBuilder = function(mgr, rec, schema) {
            queryForm.attributeFieldset.removeAll();
            if (schema) {
                queryForm.attributeFieldset.add({
                    xtype: "gxp_filterbuilder",
                    ref: "../filterBuilder",
                    attributes: schema,
                    allowBlank: true,
                    allowGroups: false
                });
                queryForm.spatialFieldset.expand();
                queryForm.attributeFieldset.expand();
            } else {
                queryForm.attributeFieldset.rendered && queryForm.attributeFieldset.collapse();
                queryForm.spatialFieldset.rendered && queryForm.spatialFieldset.collapse();
            }
            queryForm.attributeFieldset.doLayout();
        };
        
        featureManager.on("layerchange", addFilterBuilder);
        addFilterBuilder(featureManager,
            featureManager.layerRecord, featureManager.schema
        );
        
        this.target.mapPanel.map.events.register("moveend", this, function() {
            var spatialField = queryForm.spatialFieldset;
            
            if(spatialField && ! this.aoiButton.pressed){
                var extentArray = this.target.mapPanel.map.getExtent().toArray();
                
                this.westField.setValue(extentArray[0]);
                this.southField.setValue(extentArray[1]);
                this.eastField.setValue(extentArray[2]);
                this.northField.setValue(extentArray[3]); 
            }
        });

        featureManager.on({
            "beforequery": function() {
                new Ext.LoadMask(queryForm.getEl(), {
                    store: featureManager.featureStore,
                    msg: this.queryMsg
                }).show();
            },
            "query": function(tool, store) {
                if (store) {
                    store.getCount() || Ext.Msg.show({
                        title: this.noFeaturesTitle,
                        msg: this.noFeaturesMessage,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                    if (this.autoHide) {
                        var ownerCt = this.outputTarget ? queryForm.ownerCt :
                            queryForm.ownerCt.ownerCt;
                        ownerCt instanceof Ext.Window && ownerCt.hide();
                    }
                }
            },
            scope: this
        });
        
       if(this.outputTarget)
            Ext.getCmp(this.outputTarget).setActiveTab(queryForm);
            
        return queryForm;
    },
    
    /** private: method[populateSpatialForm]
     *  :arg map: ``Object``
     */
    populateSpatialForm: function(map){
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
            aoiStyle: new OpenLayers.StyleMap(this.selectStyle),
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
                     //
                     // Reset the previous control
                     //
                     var aoiLayer = map.getLayersByName("AOI")[0];
                    
                     if(aoiLayer)
                         map.removeLayer(aoiLayer);
                     
                     if(pressed){
                          Ext.getCmp("spatialLabel").setText("");
                          
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
                          Ext.getCmp("spatialLabel").setText(this.spatialLabelText);
                          selectAOI.deactivate();

                          var extentArray = this.target.mapPanel.map.getExtent().toArray();
                          
                          this.westField.setValue(extentArray[0]);
                          this.southField.setValue(extentArray[1]);
                          this.eastField.setValue(extentArray[2]);
                          this.northField.setValue(extentArray[3]); 
                      }
                  }
              }
        });
              
        var items = [
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
        
        return items;
    }        
});

Ext.preg(gxp.plugins.IDAQueryForm.prototype.ptype, gxp.plugins.IDAQueryForm);
