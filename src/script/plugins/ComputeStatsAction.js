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
 *  class = ComputeStatsAction
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: ComputeStatAction(config)
 *
 *    Plugin for adding a new group on layer tree.
 */
gxp.plugins.ComputeStatsAction = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_computestats */
    ptype: "gxp_computestats",
	
	computeStatisticsActionText: "Compute Statistics",
    computeStatsActionDialogTitle: "Statistics",
	computeStatsNoDataWarnText : "There are not enough data for the selected countries to generate charts.",
	computeStatsNoDataWarnTitle : "Not enough data.",
    /** 
     * api: method[addActions]
     */
    addActions: function() {
        this.apptarget = this.target;
		//get needed plugins (attribute list, countrylist)
        for(var tool in this.target.tools){
            if(this.target.tools[tool].ptype == "gxp_countrylist"){
                this.countryList=this.target.tools[tool];
				
            }
        }
		this.lastTabNumber= 1;
		this.attributeList =Ext.getCmp("attributeList");
		
        var actions = gxp.plugins.ComputeStatsAction.superclass.addActions.apply(this, [{
            menuText: this.computeStatsActionActionTipMenuText,
            iconCls: "gxp-icon-computestats",
			text: this.computeStatisticsActionText,
			id: 'computeStatisticsButton',
            disabled: false,
            tooltip: this.computeStatsActionActionTip,
            handler: this.actionHandler,
            scope: this
        }]);
		var computeStatAction=actions[0];
		computeStatAction.setDisabled(true);
        this.countryList.store.on({
			add:function(store){
				var disabled = store.getCount()<=0 || this.attributeList.getSelectionModel().getCount() <=0;
				computeStatAction.setDisabled(disabled);
			},
			remove:function(store){
				var disabled = store.getCount()<=0 || this.attributeList.getSelectionModel().getCount() <=0;
				computeStatAction.setDisabled(disabled);
			},
			clear:function(store){
				var disabled = store.getCount()<=0 || this.attributeList.getSelectionModel().getCount() <=0;
				computeStatAction.setDisabled(disabled);
			},
			scope:this
		});
		this.attributeList.getSelectionModel().on({
			selectionchange : function( selectionModel){
				var disabled = this.countryList.store.getCount()<=0 ||selectionModel.getCount() <=0;
				computeStatAction.setDisabled(disabled);
			},
			scope:this
		
		});
        return actions;
    },
	/**
	 * actionHandler: handler of the button
	 *
	 */
	actionHandler: function() {

		if(this.win){
			this.win.destroy();
		}
		var options =this.getOptions();
		var statElements= this.generateDataEntries(options.selectedCountries,options.selectedAttributes);
		if(statElements==null || statElements.length  <=0){
			Ext.Msg.show({
					title:this.computeStatsNoDataWarnTitle
,
					msg: this.computeStatsNoDataWarnText,
					buttons:  Ext.Msg.OK,
					icon: Ext.MessageBox.WARNING,
					
					scope:this
				   
				});
			
			return;
		
		
		};
		var groupProperty =options.groupProperty;
		var tabPanel = Ext.getCmp(this.apptarget.renderToTab);
		var tab = new Ext.Panel({
			closable:true,
			title: this.computeStatsActionDialogTitle +" "+this.lastTabNumber,
			//constrainHeader: true,
			
			autoScroll:true,		
			iconCls:'chart-icon',
			layout:'border',
			items: [
				new Ext.Panel({
					region:'center',
					autoScroll: true,
					layout:'table',
					border:false,
					
					layoutConfig: {
						// The total column count must be specified here
						columns: 2
					},
					items: this.generateAllPanels(statElements,options)
					
					
				})
			]
		});
		
		tabPanel.add(tab);
		tabPanel.setActiveTab(tab);
		this.lastTabNumber++;
		//this.win.show();
	},
	/**
	 * getOptions: returns options for countries and attributes
	 * returns 
	 * ret.selectedCountries
	 * ret.selectedAttributes
	 */
	getOptions: function(){
		//selected Countrires
		var selectedCountries= new Array();
		this.countryList.store.each(function(record){
			this.push(record);
			
		},selectedCountries );
		//selected Attributes
		var selectedAttributes = this.attributeList.getSelectionModel().getSelections();

		//Options
		var optmenu = Ext.getCmp('chartOptionMenu');
		
		var stackCountries = optmenu.get('stackCountriesOption').checked;
		var groupAttribute =  optmenu.get('groupByAttributeOption').checked;
		var groupyear =  optmenu.get('groupByYearOption').checked;
		
		var groupProperty = groupyear==true ? 'year' : 'attributeLabel';
		var xField = groupyear==false ? 'year' : 'attributeLabel';
		
		return {
			selectedCountries:	selectedCountries,
			selectedAttributes: selectedAttributes,
			groupProperty:		groupProperty, 
			stackCountries:		stackCountries,
			xField:				xField 
		}
	},
	
	
	/**
	 * generateDataEntries:
	 * Generates the data entries for chart generation.
	 * returns data to generate charts 
	 *
	 */
    generateDataEntries: function(selectedCountries,selectedAttributes){
		//get selected attributes
		
		//check min selectedCountries
		if (selectedCountries.length==0){
			Ext.Msg.alert('', "select at least one country");
			return null;
		}
		//get selected attributes
		
		//check min attributes
		if(selectedAttributes.length==0){
			Ext.Msg.alert('', "select at least one attribute");
			return null;

		}
		var statElements =new Array();
		//
		// generate entries
		//
		for(var attributeIndex=0;attributeIndex<selectedAttributes.length;attributeIndex++){
				var attributeMap ={};
				var attributeLabel = selectedAttributes[attributeIndex].get("label");
				var attributeName = selectedAttributes[attributeIndex].get("name");
				for(var countryIndex =0;countryIndex<selectedCountries.length; countryIndex++){
					var country = selectedCountries[countryIndex];
					var data = country.get("data");
					for (var yearEntry=0;yearEntry<data.length;yearEntry++){
						if(data[yearEntry].year!=undefined && !attributeMap[ data[yearEntry].year ]){
							attributeMap[ data[yearEntry].year+'']={};
							attributeMap[ data[yearEntry].year+'' ]={
								year: data[yearEntry].year,
								attributeName: attributeName,
								attributeLabel: attributeLabel
							}
						}
						//add entry for the entry for this country/attribute
						
						attributeMap[ data[yearEntry].year+''][country.get("ADM0NAME")] = data[yearEntry][attributeName];
					}
				}
				
				//create the array from the map
				for(var statElement in attributeMap){
					statElements.push(attributeMap[statElement]);
				}
			}
			return statElements;
	},
	
	generateChartPanel : function(statElements,options,title){
		//create series
		var series =new Array();
		for(var index=0; index<options.selectedCountries.length;index++){
			series.push({
				 yField: options.selectedCountries[index].get("ADM0NAME"),
				 displayName: options.selectedCountries[index].get("ADM0NAME")
			});
		
		}
		//create fields
		var fields = this.createFields(statElements);
		
		
		var store = new Ext.data.JsonStore({
			fields: fields,
			data: statElements
		});
		
		return new Ext.Panel({
			closable:true,
			height:550,
			width:650,
			title: title,
			
			listeners: {
				afterrender: function() {
				  this.getEl().unmask();
				},
				render: function(){
					this.getEl().mask();
				}
			},
			items: {
				xtype: 'stackedcolumnchart',
				store: store,
				xField: options.xField,
				yAxis: new Ext.chart.NumericAxis({
					stackingEnabled: options.stackCountries
					
					
				}),
				xAxis:  new Ext.chart.CategoryAxis({}),
				series: series,
				 extraStyle: {
				   xAxis: {
						labelRotation: -45
					}
				},
				chartStyle: {
					padding: 10,
					animationEnabled: true,
					font: {
						name: 'Tahoma',
						color: 0x444444,
						size: 11
					},
					dataTip: {
						padding: 5,
						border: {
							color: 0x99bbe8,
							size:1
						},
						background: {
							color: 0xDAE7F6,
							alpha: .8
						},
						font: {
							name: 'Tahoma',
							color: 0x15428B,
							size: 10,
							bold: true
						}
					}
				}
				
				
			}
		});
	},
	/**
	 * returns the array of Fields needed to the chart store
	 */
	createFields: function(statElements){
		var fields= new Array();
		for(var index =0; index<statElements.length;index++){
			for(var name in statElements[index]){
				var present =false;
				for(var i=0;i< fields.length;i++){
					if(fields[i]==name){
						present=true;
					}
				}
				if(!present){
					fields.push(name);
				}
			}
		}
		return fields;
	
	},
	/**
	 * returns the array of all chart panels
	 */
	generateAllPanels: function (statElements,options){
		var panels= new Array();
		var prop = options.groupProperty;
		//dispatch statElements
		var tmp = {};
		for (var i = 0 ; i<statElements.length ; i++){
			var value = statElements[i][prop];
			if(!tmp[value]){
				tmp[value]= new Array();
			}
			tmp[value].push(statElements[i]);
		}
		for(var elements in tmp){
			panels.push(this.generateChartPanel(tmp[elements],options,elements));
		}
		//group statElements by groupProperty 
		//panels.push(this.generateChartPanel(statElements,options,title));
		return panels;
	}
	
	
	
});
Ext.preg(gxp.plugins.ComputeStatsAction.prototype.ptype, gxp.plugins.ComputeStatsAction);