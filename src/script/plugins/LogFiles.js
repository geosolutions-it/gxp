Ext.namespace("gxp.plugins");

var GeostoreReader = Ext.extend(Ext.data.DataReader, {
	constructor: function(meta) {
		meta = meta || {};
		if (!meta.format) {
			meta.format = new OpenLayers.Format.XML();
		}
		
		GeostoreReader.superclass.constructor.call(this, meta);
	},
	read : function(request) {
		var data = request.responseXML;		
		if (!data || !data.documentElement) {
			data = request.responseText;
		}
		return this.readRecords(data);
	},
	readRecords : function(data) {
		
			if ( data === "" ){
						return {
				            totalRecords: 0,
				            success: true,
				            records: []
				        };	
			}
		
			if (typeof data === "string") {
				data = this.meta.format.read(data);		
			}

			if ( data.getElementsByTagName("ExtResourceList").length === 0 ){
				return {
		            totalRecords: 0,
		            success: true,
		            records: []
		        };
			}

			var resources = data.getElementsByTagName("ExtResourceList")[0].childNodes;

			
			var records = [];

			for(var i=0; i<resources.length; i++){
				
				var values = {};
				
			    var resource = resources[i];
				
				if ( resource.nodeName == 'ResourceCount'){
					continue;
				}
			
				var attributes = resource.getElementsByTagName("Attributes")[0].childNodes;
				for (var j=0; j<attributes.length; j++){
					var attribute = attributes[j];
					var property = attribute.getElementsByTagName('name')[0].childNodes[0].data;
					var value = attribute.getElementsByTagName('value')[0].childNodes[0].data;
					values[ property ] = value;
				}
		
				var children = resource.childNodes;
				for (var j=0; j<children.length; j++){
					var child = children[j];
					switch( child.nodeName ){
						case 'name':
							values['name'] = child.childNodes[0].data;
							break;
						case 'id':
							values['id'] = child.childNodes[0].data;
							break;
						default:
							break;
					}
				}
				values['category_name'] = resource.getElementsByTagName("category")[0].getElementsByTagName('name')[0].childNodes[0].data;
			

			    var record = new Ext.data.Record({
					cruiseName: values['cruise_name'],
					logfilePath: values['logfile_path'],
					missionName: values['mission_name'],
					missionNumber: values['mission_number'],
					startTime: values['time_begin'],
					endTime: values['time_end'],
					vehicleName: values['vehicle_name'],
					categoryName: values['category_name'],
					id: values['id'],
					name: values['name']
				});

				records.push(record);
			}
			
			var count = data.getElementsByTagName("ResourceCount")[0].childNodes[0].data;
		

		    return {
	            totalRecords: count,
	            success: true,
	            records: records
	        };
		}
	
});


gxp.plugins.LogFiles = Ext.extend(gxp.plugins.Tool, {

	ptype: "gxp_log_files",


	constructor: function(config) {
		gxp.plugins.LogFiles.superclass.constructor.apply(this, arguments);
	},
	


	createLogfilePanel: function( title, categoryName ) {

		// http://84.33.199.62/xmlJsonTranslate-gliders/
		var xmlJsonTranslate = this.target.xmlJsonTranslateService;
		
	
		var availableVehicleStore = new Ext.data.Store({
			reader: new Ext.data.ArrayReader({}, [{
				name: 'selected',
				type: 'bool'
			}, {
				name: 'vehicle',
				type: 'string'
			}, {
				name: 'style',
				type: 'string'
			}, {
				name: 'availability',
				type: 'bool'
			}]),
			data: this.target.vehicleSelector.data
		});
		
		var keywords = new Ext.data.Store({
			reader: new Ext.data.ArrayReader({}, [{
				name: 'keyword',
				type: 'string'
			}
			]),
			data: [
				['any'], ['^C'], ['^R'], ['^F'], ['GliderDos A'], ['GliderDos N'], ['GliderDos I'],
				['run'], ['sequence'], ['initial.mi'], ['lastgasp.mi'],
				['!type'], ['callback'], ['GPS fix is getting stale:'], ['type'],
				['DRIVER_ODDITY'], ['DRIVER_WARNING'], ['DRIVER_ERROR'],
				['ABORT'], ['ERROR']
			]
		});

		// create the data store
		var vehicleStore = new Ext.data.JsonStore({
			fields: [{
				name: 'name'
			}, {
				name: 'startTime',
				type: 'date',
				dateFormat: 'n/j h:ia'
			}, {
				name: 'endTime',
				type: 'date',
				dateFormat: 'n/j h:ia'
			}, {
				name: 'vehicle',
				type: 'string'
			}, {
				name: 'mission_number',
				type: 'string'
			}, {
				name: 'mission_name',
				type: 'string'
			}]
		});

		var sm = new Ext.grid.CheckboxSelectionModel;
		
		var uri = new Uri({'url':this.baseUrl_});
		uri.setProxy( this.proxy_);
		uri.appendPath( 'extjs/search/list' );
		uri.appendPath( 'category'  );
		uri.appendPath( categoryName  );
		
		
		var logfileStore = new Ext.data.Store({
			
				reader: new GeostoreReader,
	            autoDestroy: true,
				scope: this,
	            root: 'results',
	            totalProperty: 'totalCount',
	            successProperty: 'success',
	            idProperty: 'id',
	            remoteSort: false,
	            fields: [
						{
	                        name: "id",
	                        type: "int"
	                    },{
	                        name: "name",
	                        type: "string"
	                    },{
	                        name: "categoryName",
	                        type: "string"
	                    },
						{
	                        name: "cruiseName",
	                        type: "string"
	                    },
						{
	                        name: "missionName",
	                        type: "string"
	                    },
						{
	                        name: "missionNumber",
	                        type: "string"
	                    },
						{
	                        name: "vehicleName",
	                        type: "string"
	                    },{
	                        name: "startTime",
	                        type: "date",
	                        dateFormat: 'c'
	                    },{
	                        name: "endTime",
	                        type: "date",
	                        dateFormat: 'c'
	                    },{
		                    name: "cruiseName",
		                    type: "string"
		                },{
			                name: "logfilePath",
			                type: "string"
			            }
	
	
	            ],
	            proxy: new Ext.data.HttpProxy({
					// url: uri.toString(),
					headers: {
						'Accept': 'text/xml',
						'Content-Type': 'text/xml'
					},
	                restful: true,
	                api:{
						load: {url: uri.toString(), method: 'POST'}
					},
	                disableCaching: true,
	                failure: function (result) {
	                   console.error(result);
	                }
	            }),
				listeners:{
					 // hack: when we use a proxy, we need to set params for geostore by hand
					 // in order to avoid the issue described here 
					 // https://github.com/geosolutions-it/mapstore/issues/31
				     beforeload:function(store, options){
						var params = options.params;
						
						// resources/search/list?page=0&entries=10&includeAttributes=true&includeData=true'
						var uri = new Uri({'url':this.baseUrl_});
						uri.setProxy( this.proxy_);
						uri.appendPath( 'extjs/search/list' );
						uri.addParam('start', params.start );
						uri.addParam('limit', params.limit );
						uri.addParam('includeAttributes', true );
						// uri.addParam('includeData', true );
						
						
						/*if (! options.params.xmlData ){
							options.params.xmlData = '<CategoryFilter><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CategoryFilter>';	
						}*/
						
						options.params.xmlData = logfileStore.filter;
						
						
						// console.log( options.params );
						// console.log( logfileStore.lastOptions.params );
						
						store.proxy.setApi( Ext.data.Api.actions.read, {url: uri.toString(), method: 'POST'} );
				     },
				     scope: this
				}
	        });		

		
		// create the Grid
		var grid = new Ext.grid.GridPanel({
			tbar: [{
				text:'Download',
				scope:this,
				tooltip: 'Download logfiles',
				iconCls: 'gxp-icon-export-logfile',
				handler: function(){
					var records = grid.getSelectionModel().getSelections();
					// TODO externalize
					var uri = new Uri({'url': xmlJsonTranslate + 'ZipDownloader'});
					uri.setProxy( this.proxy_);
					
					var request = {
						files:[ ]
					};
					
					for (var i=0; i<records.length; i++){
						var record = records[i];
						request.files.push({
							filename: record.get('name'),
							path: record.get('logfilePath')+'/'+record.get('name')
						});
					}
					
					var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, downloading files..."});
					appMask.show();
					
					var Request = Ext.Ajax.request({
					       url: uri.toString(),
					       method: 'POST',
					       headers:{
					          'Content-Type' : 'application/json'
					       },
					       params: Ext.encode( request ),
					       scope: this,
					       success: function(response, opts){
								appMask.hide();
								var obj = Ext.decode( response.responseText );
								var code = obj.result.code;
								// force browser download
								location.href = xmlJsonTranslate + 'ZipDownloader' + '?code=' + code +'&filename=bundle.zip';
								
					       },
					       failure:  function(response, opts){
								appMask.hide();
					       		console.error(response);
								Ext.Msg.show({
									title: 'Cannot download zip file',
									msg: response.responseText,
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.ERROR
								});
					       }
					});
				}
			}],
			region: 'center',
			store: logfileStore,
			sm: sm,
			columns: [
			sm,
			{
				id: 'name',
				header: 'Name',
				width: 150,
				// sortable: true,
				dataIndex: 'name'
			},
			{
				id: 'cruiseName',
				header: 'Cruise',
				width: 70,
				// sortable: true,
				dataIndex: 'cruiseName'
			},
			{
				id: 'missionName',
				header: 'Mission Name',
				width: 50,
				// sortable: true,
				dataIndex: 'missionName'
			},		
			{
				id: 'missionNumber',
				header: 'Mission Number',
				width: 50,
				// sortable: true,
				dataIndex: 'missionNumber'
			},				
			{
				header: 'Start Time',
				width: 150,
				// sortable: true,
				dataIndex: 'startTime'
			}, {
				header: 'End Time',
				width: 150,
				// sortable: true,
				dataIndex: 'endTime'
			}, {
				header: 'Vehicle',
				width: 70,
				// sortable: true,
				dataIndex: 'vehicleName'
			}, {
				header: 'Logfile',
				width: 70,
				// sortable: true,
				dataIndex: 'categoryName'
			}, {
				header: 'Logfile Path',
				width: 150,
				// sortable: true,
				dataIndex: 'logfilePath'
			}],
			   
			
			
			stripeRows: true,
			autoExpandColumn: 'name',
			height: 350,
			width: 600,
			title: 'Log Files',
			// config options for stateful behavior
			stateful: true,
			stateId: 'grid',
			header: false,
			frame: false,
			scope:this,
			border: false,
			bbar: new Ext.PagingToolbar({
				pageSize: 20,
				store: logfileStore,
				displayInfo: true
			})
		});

		var searchBtn = new Ext.Button({
			text: 'Search',
			iconCls:'gxp-icon-geonetworksearch'
		});
		
		var resetBtn = new Ext.Button({
			text: 'Reset',
			iconCls:'gxp-icon-refresh'
		});

		var search = new Ext.FormPanel({
			padding: 10,
			frame: false,
			border:false,
			region: 'west',
			labelAlign: 'top',
			width: 300,
			hideCollapseTool: true,
			collapsible: true,
			collapsed: false,
			// title:'Log files',
			collapseMode: 'mini',
			split: true,
			autoScroll:true,
			
			items: [{
				xtype: 'compositefield',
				width: 150,
				anchor: '100%',
				items: [{
					ref: '../startDate',
					xtype: 'datefield',
					allowBlank: false,
					editable: false,
					format: "d/m/Y",
					fieldLabel: 'Start date',
					width: 100,
					anchor: '100%'
				}, {
					ref: '../startTime',
					xtype: 'timefield',
					allowBlank: false,
					fieldLabel: 'Start time',
					format: 'H:i:s',
					width: 80
				}

				]
			}, {
				xtype: 'compositefield',
				width: 150,
				anchor: '100%',
				items: [{
					ref: '../endDate',
					xtype: 'datefield',
					allowBlank: false,
					editable: false,
					format: "d/m/Y",
					fieldLabel: 'End date',
					width: 100,
					anchor: '100%'
				}, {
					ref: '../endTime',
					xtype: 'timefield',
					allowBlank: false,
					fieldLabel: 'End time',
					format: 'H:i:s',
					width: 80
				}]
			}, {

				xtype: "combo",
				fieldLabel: 'Vehicle',
				allowBlank: false,
				invalidText: 'A vehicle must be specified',
				emptyText: 'Select a vehicle...',
				store: availableVehicleStore,
				mode: 'local',
				displayField: 'vehicle',
				valueField: 'vehicle',
				editable: false,
				forceSelection: true,
				triggerAction: 'all',
				ref: 'vehicle',
				width: 200

			}, 	{

					xtype: "combo",
					fieldLabel: 'Search by keyword',
					// allowBlank: false,
					invalidText: 'A keyword must be specified',
					emptyText: 'Select a keyword...',
					store: keywords,
					mode: 'local',
					displayField: 'keyword',
					valueField: 'keyword',
					editable: false,
					forceSelection: true,
					triggerAction: 'all',
					ref: 'keyword',
					width: 200

				}
			
			],
			buttons: [searchBtn, resetBtn]
		});
		
		searchBtn.on('click', this.loadHandler(search, logfileStore, categoryName), this);
		
		resetBtn.on('click', 
		 function(){
			var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, reloading..."});
			appMask.show();
			var handler = function (){
				logfileStore.un('load', handler, this);
				appMask.hide();
			};
			logfileStore.filter = '<CategoryFilter><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CategoryFilter>';
			logfileStore.on('load', handler, this);
			logfileStore.reload({
				params:{
					start:0,
					limit:20,
					xmlData:'<CategoryFilter><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CategoryFilter>'	
				}
			});
			
			search.startDate.reset();	
			search.startTime.reset();	
			search.endDate.reset();	
			search.endTime.reset();	
			search.vehicle.reset();	
			search.keyword.reset();				
		}, this);
		
		logfileStore.filter = '<CategoryFilter><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CategoryFilter>';
		logfileStore.reload({
			params:{
				start:0,
				limit:20,
				xmlData:'<CategoryFilter><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CategoryFilter>'	
			}
		});
	
		
		return {
			title: title,
			xtype: 'panel',
			layout: 'border',
			frame: false,
			border: false,
			header: false,
			items: [search, grid]
		};
	},
	

	
	loadHandler: function( form, store, categoryName ){
		var buildFilter = function( startTime, endTime, vehicle, keyword ){	
			var filter =	
				'<AND>'+
					'<AND>'+
					 '<ATTRIBUTE>'+
						'<name>time_begin</name>'+
						'<operator>GREATER_THAN_OR_EQUAL_TO</operator>'+
						'<type>DATE</type>'+
						'<value>'+ startTime +'</value>'+
					 '</ATTRIBUTE>'+
					 '<ATTRIBUTE>'+
						'<name>time_end</name>'+
						'<operator>LESS_THAN_OR_EQUAL_TO</operator>'+
						'<type>DATE</type>'+
						'<value>'+ endTime +'</value>'+
					 '</ATTRIBUTE>'+
					 '<ATTRIBUTE>'+
						'<name>vehicle_name</name>'+
						'<operator>EQUAL_TO</operator>'+
						'<type>STRING</type>'+
						'<value>' + vehicle +'</value>'+
					 '</ATTRIBUTE>'+
				  '</AND>';
				if ( keyword ){
				  filter +=  
					'<FIELD>'+
					 '<field>METADATA</field>'+
					 '<operator>LIKE</operator>'+
					 '<value>%'+ keyword+'%</value>'+
				  '</FIELD>';				
				}

				filter += '<CATEGORY><name>'+ categoryName +'</name><operator>EQUAL_TO</operator></CATEGORY>'	+
			  				'</AND>';
			return filter;
		};
		
		return function(){
			
			
			
			if ( form.getForm().isValid()){
				
				var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, searching..."});
				appMask.show();
				
				// var startTime = form.startDate.getValue().format("Y-m-d H:i:s.000");
				// var endTime  = form.endDate.getValue().format("Y-m-d H:i:s.000");
				// var startTime = (new Date( form.startDate.getValue().format("Y-m-d")+ ' ' +  form.startTime.getValue())).format("Y-m-d H:i:s.000");
				// var endTime = (new Date( form.endDate.getValue().format("Y-m-d")+ ' ' +  form.endTime.getValue())).format("Y-m-d H:i:s.000");

				var startTime = Date.parseDate( form.startDate.getValue().format("Y-m-d")+ ' ' +  form.startTime.getValue(), 'Y-m-d H:i:s' ).format("Y-m-d H:i:s.000");
				var endTime = Date.parseDate( form.endDate.getValue().format("Y-m-d")+ ' ' +  form.endTime.getValue(), 'Y-m-d H:i:s' ).format("Y-m-d H:i:s.000");
				
				var vehicle = form.vehicle.getValue();
				var keyword = form.keyword.getValue();
				
				if ( keyword == 'any' ){
					keyword = null;
				}
				
				var filter = buildFilter(startTime, endTime, vehicle, keyword);
				
				store.filter = filter;
				
				var handler = function (){
					store.un('load', handler, this);
					store.un('exception', handler, this);
					appMask.hide();
				};
				store.on('load', handler, this);
				store.on('exception', handler, this);
				
				store.reload({
			            params:{
			                start: 0,
			                limit: 20,
							xmlData: filter
			    }});				
			} else {
				Ext.Msg.show({
					title: 'Invalid search criteria',
					msg: 'Some fields are invalid.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
			
			
		};
	},

	addOutput: function() {

		this.baseUrl_ = geoStoreBaseURL;
		this.proxy_ = this.target.proxy;


		var tab = new Ext.TabPanel({
			activeTab: 0,

			border: false,
			frame: false,
			header: false,
			items: [
			this.createLogfilePanel('Log File', 'LOGFILE'), 
			this.createLogfilePanel('Mission Log', 'MISSION-LOGFILE')]
		});
		return gxp.plugins.LogFiles.superclass.addOutput.call(this, tab);
	}


});

Ext.preg(gxp.plugins.LogFiles.prototype.ptype, gxp.plugins.LogFiles);
