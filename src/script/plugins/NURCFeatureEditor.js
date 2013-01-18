/**
 * Author: Tobia Di Pisa at tobia.dipisa@geo-solutions.it
 * 
 * @requires plugins/ClickableFeatures.js
 * @requires widgets/FeatureEditPopup.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = FeatureEditor
 */

/** api: (extends)
 *  plugins/ClickableFeatures.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: NURCFeatureEditor(config)
 *
 *    Plugin for feature editing. Requires a
 *    :class:`gxp.plugins.FeatureManager`.
 */   
gxp.plugins.NURCFeatureEditor = Ext.extend(gxp.plugins.FeatureEditor, {
    
    /** api: ptype = gxp_featureeditor */
    ptype: "gxp_nurcfeatureeditor",
	
	gliderPropertyName: null,
	
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.NURCFeatureEditor.superclass.constructor.apply(this, arguments);       
    },
	
	/** api: method[addActions]
     */
    addActions: function() {
        var popup;
        var featureManager = this.getFeatureManager();
        var featureLayer = featureManager.featureLayer;
        
        var intercepting = false;
        // intercept calls to methods that change the feature store - allows us
        // to persist unsaved changes before calling the original function
        function intercept(mgr, fn) {
            var fnArgs = Array.prototype.slice.call(arguments);
            // remove mgr and fn, which will leave us with the original
            // arguments of the intercepted loadFeatures or setLayer function
            fnArgs.splice(0, 2);
            if (!intercepting && popup && !popup.isDestroyed) {
                if (popup.editing) {
                    function doIt() {
                        intercepting = true;
                        unregisterDoIt.call(this);
                        if (fn === "setLayer") {
                            this.target.selectLayer(fnArgs[0]);
                        } else if (fn === "clearFeatures") {
                            // nothing asynchronous involved here, so let's
                            // finish the caller first before we do anything.
                            window.setTimeout(function() {mgr[fn].call(mgr);});
                        } else {
                            mgr[fn].apply(mgr, fnArgs);
                        }
                    }
                    function unregisterDoIt() {
                        featureManager.featureStore.un("write", doIt, this);
                        popup.un("canceledit", doIt, this);
                        popup.un("cancelclose", unregisterDoIt, this);
                    }
                    featureManager.featureStore.on("write", doIt, this);
                    popup.on({
                        canceledit: doIt,
                        cancelclose: unregisterDoIt,
                        scope: this
                    });
                    popup.close();
                }
                return !popup.editing;
            }
            intercepting = false;
        }
        featureManager.on({
            // TODO: determine where these events should be unregistered
            "beforequery": intercept.createDelegate(this, "loadFeatures", 1),
            "beforelayerchange": intercept.createDelegate(this, "setLayer", 1),
            "beforesetpage": intercept.createDelegate(this, "setPage", 1),
            "beforeclearfeatures": intercept.createDelegate(this, "clearFeatures", 1),
            scope: this
        });
        
        this.drawControl = new OpenLayers.Control.DrawFeature(
            featureLayer,
            OpenLayers.Handler.Point, 
            {
                eventListeners: {
                    featureadded: function(evt) {
                        if (this.autoLoadFeatures === true) {
                            this.autoLoadedFeature = evt.feature;
                        }
                    },
                    activate: function() {
                        featureManager.showLayer(
                            this.id, this.showSelectedOnly && "selected"
                        );
                    },
                    deactivate: function() {
                        featureManager.hideLayer(this.id);
                    },
                    scope: this
                }
            }
        );
        
        // create a SelectFeature control
        // "fakeKey" will be ignord by the SelectFeature control, so only one
        // feature can be selected by clicking on the map, but allow for
        // multiple selection in the featureGrid
        this.selectControl = new OpenLayers.Control.SelectFeature(featureLayer, {
            clickout: false,
            multipleKey: "fakeKey",
            unselect: function() {
                // TODO consider a beforefeatureunselected event for
                // OpenLayers.Layer.Vector
                if (!featureManager.featureStore.getModifiedRecords().length) {
                    OpenLayers.Control.SelectFeature.prototype.unselect.apply(this, arguments);
                }
            },
            eventListeners: {
                "activate": function() {
                    if (this.autoLoadFeatures === true || featureManager.paging) {
                        /*this.target.mapPanel.map.events.register(
                            "click", this, this.noFeatureClick
                        );*/

						var features = featureManager.featureLayer.features;
			
						if(features.length > 0){						    
							var grid = Ext.getCmp("vselector");
							var record = grid.getSelectionModel().getSelected();

							if(record){
								var vehicle = record.get("vehicle");	
								
								for(var i=0; i<features.length; i++){
									var vname = features[i].attributes[this.gliderPropertyName];
									if(vname == vehicle.toLowerCase()){
										var geom = features[i].geometry;
										//alert(geom.getBounds().toBBOX());
										//var c = geom.getCentroid();
										
										var c = geom.getVertices()[0];
										
										var pixel = this.target.mapPanel.map.getLayerPxFromLonLat(new OpenLayers.LonLat(c.x, c.y));
										var evt = {
											xy: pixel,
											bbox: geom.getBounds().toBBOX()
										};									
										this.noFeatureClick(evt);
										break;
									}
								}
							}
						}
                    }
					
                    /*featureManager.showLayer(
                        this.id, this.showSelectedOnly && "selected"
                    );
                    this.selectControl.unselectAll(
                        popup && popup.editing && {except: popup.feature}
                    );*/
                },
                "deactivate": function() {
                    /*if (this.autoLoadFeatures === true || featureManager.paging) {
                        this.target.mapPanel.map.events.unregister(
                            "click", this, this.noFeatureClick
                        );
                    }*/
                    if (popup) {
                        if (popup.editing) {
                            popup.on("cancelclose", function() {
                                this.selectControl.activate();
                            }, this, {single: true});
                        }
                        popup.on("close", function() {
                            featureManager.hideLayer(this.id);
                        }, this, {single: true});
                        popup.close();
                    } else {
                        featureManager.hideLayer(this.id);
                    }
                },
                scope: this
            }
        });
        
        featureLayer.events.on({
            "beforefeatureremoved": function(evt) {
                if (this.popup && evt.feature === this.popup.feature) {
                    this.selectControl.unselect(evt.feature);
                }
            },
			"featureremoved": function(evt){
				//
				// To deselect rows and reset the editing toolbar when a feature is removed.
				//				
				var grid = Ext.getCmp("vselector");
				var storeLength = grid.getStore().getCount(); 
				grid.getSelectionModel().deselectRange(0, storeLength - 1); 
				this.selectControl.unselectAll();

				this.actions[0].disable();
				this.actions[1].disable();
			},
            "featuremodified": function(evt) {
				this.actions[0].disable();
				this.actions[1].enable();
            },
			"featureunselected": function(evt) {
                var feature = evt.feature;
                if (feature) {
                    this.fireEvent("featureeditable", this, feature, false);
                }
                if (popup && !popup.hidden) {
                    popup.close();
                }
            },
            "beforefeatureselected": function(evt) {
                //TODO decide if we want to allow feature selection while a
                // feature is being edited. If so, we have to revisit the
                // SelectFeature/ModifyFeature setup, because that would
                // require to have the SelectFeature control *always*
                // activated *after* the ModifyFeature control. Otherwise. we
                // must not configure the ModifyFeature control in standalone
                // mode, and use the SelectFeature control that comes with the
                // ModifyFeature control instead.
                if(popup) {
                    return !popup.editing;
                }
            },
            "featureselected": function(evt) {
			
			    //
				// Auto fill the AOI field 
				//
			    var grid = Ext.getCmp("vselector");
				var record = grid.getSelectionModel().getSelected();
			    
				var vehicle = record.get("vehicle");				
				var cruise = this.target.cruiseName;
				
                var feature = evt.feature;
				
				var attributes = {};
				attributes[this.gliderPropertyName] = vehicle;
				attributes[this.cruisePropertyName] = cruise; 
				
				//"2012-09-13 14:22:36" for test
				var dt = new Date();
				attributes[this.creationPropertyName] = dt.format("Y-m-d H:i:s");
           
     		    feature.attributes = attributes;
								
                if (feature) {
                    this.fireEvent("featureeditable", this, feature, true);
                }
				
                var featureStore = featureManager.featureStore;
                if(this._forcePopupForNoGeometry === true || (this.selectControl.active && feature.geometry !== null)) {
                    // deactivate select control so no other features can be
                    // selected until the popup is closed
                    if (this.readOnly === false) {
                        this.selectControl.deactivate();
                        // deactivate will hide the layer, so show it again
                        featureManager.showLayer(this.id, this.showSelectedOnly && "selected");
                    }
                    popup = this.addOutput({
                        xtype: "gxp_featureeditpopup",
                        collapsible: true,
                        feature: featureStore.getByFeature(feature),
                        vertexRenderIntent: "vertex",
                        readOnly: this.readOnly,
                        fields: this.fields,
						resizable: false,
                        excludeFields: this.excludeFields,
                        editing: feature.state === OpenLayers.State.INSERT,
                        schema: this.schema,
                        allowDelete: true,
                        width: 200,
                        height: 50,
                        listeners: {
                            "close": function() {
                                /*if (this.readOnly === false) {
                                    this.selectControl.activate();
                                }*/
                                /*if(feature.layer && feature.layer.selectedFeatures.indexOf(feature) !== -1) {
                                    this.selectControl.unselect(feature);
                                }*/
                                if (feature === this.autoLoadedFeature) {
                                    if (feature.layer) {
                                        feature.layer.removeFeatures([evt.feature]);
                                    }
                                    this.autoLoadedFeature = null;
                                }
                            },
                            "featuremodified": function(popup, feature) {
                                popup.disable();
                                featureStore.on({
                                    write: {
                                        fn: function() {
                                            if (popup && popup.isVisible()) {
                                                popup.enable();
                                            }
                                            var layer = featureManager.layerRecord;
                                            this.target.fireEvent("featureedit", featureManager, {
                                                name: layer.get("name"),
                                                source: layer.get("source")
                                            });
                                        },
                                        single: true
                                    },
                                    exception: {
                                        fn: function(proxy, type, action, options, response, records) {
                                            var msg = this.exceptionText;
                                            if (type === "remote") {
                                                // response is service exception
                                                if (response.exceptionReport) {
                                                    msg = gxp.util.getOGCExceptionText(response.exceptionReport);
                                                }
                                            } else {
                                                // non-200 response from server
                                                msg = "Status: " + response.status;
                                            }
                                            // fire an event on the feature manager
                                            featureManager.fireEvent("exception", featureManager, 
                                                response.exceptionReport || {}, msg, records);
                                            // only show dialog if there is no listener registered
                                            if (featureManager.hasListener("exception") === false && 
                                                featureStore.hasListener("exception") === false) {
                                                    Ext.Msg.show({
                                                        title: this.exceptionTitle,
                                                        msg: msg,
                                                        icon: Ext.MessageBox.ERROR,
                                                        buttons: {ok: true}
                                                    });
                                            }
                                            if (popup && popup.isVisible()) {
                                                popup.enable();
                                                popup.startEditing();
                                            }
                                        },
                                        single: true
                                    },
                                    scope: this
                                });                                
                                if(feature.state === OpenLayers.State.DELETE) {                                    
                                    /**
                                     * If the feature state is delete, we need to
                                     * remove it from the store (so it is collected
                                     * in the store.removed list.  However, it should
                                     * not be removed from the layer.  Until
                                     * http://trac.geoext.org/ticket/141 is addressed
                                     * we need to stop the store from removing the
                                     * feature from the layer.
                                     */
                                    featureStore._removing = true; // TODO: remove after http://trac.geoext.org/ticket/141
                                    featureStore.remove(featureStore.getRecordFromFeature(feature));
                                    delete featureStore._removing; // TODO: remove after http://trac.geoext.org/ticket/141
                                }
                                featureStore.save();
                            },
                            "canceledit": function(popup, feature) {
                                featureStore.commitChanges();
                            },
                            scope: this
                        }
                    });
                    this.popup = popup;
                }
            },
            "sketchcomplete": function(evt) {
                // Why not register for featuresadded directly? We only want
                // to handle features here that were just added by a
                // DrawFeature control, and we need to make sure that our
                // featuresadded handler is executed after any FeatureStore's,
                // because otherwise our selectControl.select statement inside
                // this handler would trigger a featureselected event before
                // the feature row is added to a FeatureGrid. This, again,
                // would result in the new feature not being shown as selected
                // in the grid.
                featureManager.featureLayer.events.register("featuresadded", this, function(evt) {
                    featureManager.featureLayer.events.unregister("featuresadded", this, arguments.callee);
                    this.drawControl.deactivate();
                    this.selectControl.activate();
                    this.selectControl.select(evt.features[0]);
                });
            },
            scope: this
        });

        var toggleGroup = this.toggleGroup || Ext.id();

        var actions = [];
        var commonOptions = {
            tooltip: this.createFeatureActionTip,
            menuText: this.createFeatureActionText,
            text: this.createFeatureActionText,
            iconCls: this.iconClsAdd,
            disabled: true,
            hidden: this.modifyOnly || this.readOnly,
            toggleGroup: toggleGroup,
            enableToggle: true,
            allowDepress: true,
            control: this.drawControl,
            deactivateOnDisable: true,
            map: this.target.mapPanel.map
        };
        if (this.supportAbstractGeometry === true) {
            var menuItems = [];
            if (this.supportNoGeometry === true) {
                menuItems.push(
                    new Ext.menu.CheckItem({
                        text: this.noGeometryText,
                        iconCls: "gxp-icon-event",
                        groupClass: null,
                        group: toggleGroup,
                        listeners: {
                            checkchange: function(item, checked) {
                                if (checked === true) {
                                    var feature = new OpenLayers.Feature.Vector(null);
                                    feature.state = OpenLayers.State.INSERT;
                                    featureLayer.addFeatures([feature]);
                                    this._forcePopupForNoGeometry = true;
                                    featureLayer.events.triggerEvent("featureselected", {feature: feature});
                                    delete this._forcePopupForNoGeometry;
                                }
                                if (this.actions[0].items[0] instanceof Ext.menu.CheckItem) {
                                    this.actions[0].items[0].setChecked(false);
                                } else {
                                    this.actions[0].items[0].toggle(false);
                                }
                            },
                            scope: this
                        }
                    })
                );
            }
            var checkChange = function(item, checked, Handler) {
                if (checked === true) {
                    this.setHandler(Handler, false);
                }
                if (this.actions[0].items[0] instanceof Ext.menu.CheckItem) {
                    this.actions[0].items[0].setChecked(checked);
                } else {
                    this.actions[0].items[0].toggle(checked);
                }
            };
            menuItems.push(
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.pointText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-point',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Point], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.lineText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-line',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Path], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.polygonText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-polygon',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Polygon], 2)
                    }
                })
            );

            actions.push(
                new GeoExt.Action(Ext.apply(commonOptions, {
                    menu: new Ext.menu.Menu({items: menuItems})
                }))
            );
        } else {
            actions.push(new GeoExt.Action(commonOptions));
        }
        actions.push(new GeoExt.Action({
            tooltip: this.editFeatureActionTip,
            text: this.editFeatureActionText,
            menuText: this.editFeatureActionText,
            iconCls: this.iconClsEdit,
            disabled: true,
            toggleGroup: toggleGroup,
            enableToggle: true,
            allowDepress: true,
            control: this.selectControl,
            deactivateOnDisable: true,
            map: this.target.mapPanel.map
        }));

        actions = gxp.plugins.FeatureEditor.superclass.addActions.call(this, actions);

        featureManager.on("layerchange", this.onLayerChange, this);

        var snappingAgent = this.getSnappingAgent();
        if (snappingAgent) {
            snappingAgent.registerEditor(this);
        }

        return actions;
    },
	
	/** private: method[noFeatureClick]
     *  :arg evt: ``Object``
     */
    noFeatureClick: function(evt) {
        if (!this.selectControl) {
            this.selectControl = new OpenLayers.Control.SelectFeature(
                this.target.tools[this.featureManager].featureLayer,
                this.initialConfig.controlOptions
            );
        }
        var evtLL = this.target.mapPanel.map.getLonLatFromPixel(evt.xy);
        var featureManager = this.target.tools[this.featureManager];
        var page = featureManager.page;
		
        /*if (featureManager.visible() == "all" && featureManager.paging && page && page.extent.containsLonLat(evtLL)) {
            // no need to load a different page if the clicked location is
            // inside the current page bounds and all features are visible
            return;
        }*/

        var layer = featureManager.layerRecord && featureManager.layerRecord.getLayer();
        if (!layer) {
            // if the feature manager has no layer currently set, do nothing
            return;
        }

	
        
        // construct params for GetFeatureInfo request
        // layer is not added to map, so we do this manually
        var map = this.target.mapPanel.map;
        var size = map.getSize();
        var params = Ext.applyIf({
            REQUEST: "GetFeatureInfo",
            BBOX: map.getExtent().toBBOX(), // evt.bbox,
            WIDTH: size.w,
            HEIGHT: size.h,
            X: parseInt(evt.xy.x),
            Y: parseInt(evt.xy.y),
            QUERY_LAYERS: layer.params.LAYERS,
            INFO_FORMAT: "application/vnd.ogc.gml",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            FEATURE_COUNT: 1,
			// BUFFER: 15
			BUFFER: this.featureInfoBuffer
        }, layer.params);
        if (typeof this.tolerance === "number") {
            for (var i=0, ii=this.toleranceParameters.length; i<ii; ++i) {
                params[this.toleranceParameters[i]] = this.tolerance;
            }
        }

        var projection = map.getProjectionObject();
        var layerProj = layer.projection;
        if (layerProj && layerProj.equals(projection)) {
            projection = layerProj;
        }
        if (parseFloat(layer.params.VERSION) >= 1.3) {
            params.CRS = projection.getCode();
        } else {
            params.SRS = projection.getCode();
        }
        
        var store = new GeoExt.data.FeatureStore({
            fields: {},
            proxy: new GeoExt.data.ProtocolProxy({
                protocol: new OpenLayers.Protocol.HTTP({
                    url: (typeof layer.url === "string") ? layer.url : layer.url[0],
                    params: params,
                    format: new OpenLayers.Format.WMSGetFeatureInfo()
                })
            }),
            autoLoad: true,
            listeners: {
                "load": function(store, records) {
                    if (records.length > 0) {
                        var fid = records[0].get("fid");
                        var filter = new OpenLayers.Filter.FeatureId({
                            fids: [fid] 
                        });

                        var autoLoad = function() {
                            featureManager.loadFeatures(
                                filter, function(features) {
                                    if (features.length) {
                                        this.autoLoadedFeature = features[0];
                                        this.select(features[0]);
                                    }
                                }, this
                            );
                        }.createDelegate(this);
                        
                        var feature = featureManager.featureLayer.getFeatureByFid(fid);                        
                        if (feature) {
                            this.select(feature);
                        } else if (featureManager.paging && featureManager.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
                            var lonLat = this.target.mapPanel.map.getLonLatFromPixel(evt.xy);
                            featureManager.setPage({lonLat: lonLat}, function() {
                                var feature = featureManager.featureLayer.getFeatureByFid(fid);
                                if (feature) {
                                    this.select(feature);
                                } else if (this.autoLoadFeatures === true) {
                                    autoLoad();
                                }
                            }, this);
                        } else {
                            autoLoad();
                        }
                    }
                },
                scope: this
            }
        });
    }
});

Ext.preg(gxp.plugins.NURCFeatureEditor.prototype.ptype, gxp.plugins.NURCFeatureEditor);
