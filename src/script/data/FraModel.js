
/**
  * Generic OpenLayer GetFeatureInfo Result Object
  */
gxp.data.WMSFeatureMemberRecord = Ext.data.Record.create([ 
    {name: 'attributes' },
	{name: 'bounds'		},
	{name: 'data'	 	},
	{name: 'fid'	 	},
	{name: 'geometry'	},
	{name: 'gml'		},
	{name: 'id'		 	},
	{name: 'layer'	 	},
	{name: 'state'	 	},
	{name: 'style'	 	}
]);

gxp.data.GBoundariesModel =[
	{name: 'ADM0NAME' },
	{name: 'ADM0_CODE' },
	{name: 'CONTINENT_' },
	{name: 'COUNT' },
	{name: 'EXPIRY_Y' },
	{name: 'LAST_UPD' },
	{name: 'REGION_' }
];

/**
  * GBoundariesRecord
  */
gxp.data.GBoundariesRecord = Ext.data.Record.create([
	{name: 'ADM0NAME' },
	{name: 'ADM0_CODE' },
	{name: 'CONTINENT_' },
	{name: 'COUNT' },
	{name: 'EXPIRY_Y' },
	{name: 'LAST_UPD' },
	{name: 'REGION_' }
]);

gxp.data.FraDataEntry = Ext.data.Record.create([
{name: 'ADM0NAME' },
	{name: 'ADM0_CODE' },
	{name: 'CONTINENT_' },
	{name: 'COUNT' },
	{name: 'EXPIRY_Y' },
	{name: 'LAST_UPD' },
	{name: 'REGION_' },
	{name: 'data' }

])

/**
  * Fra Visible attributes
  */
  
gxp.data.VisibleAttributeModel=[
			 {name: 'forest_aboveground_biomass',label:'Forest Aboveground Biomass' },
			 {name: 'forest_area2', label: 'forest_area2'},
			 {name: 'forest_area_planted', label: 'forest_area_planted' },
			 {name: 'forest_area_primary', label: 'forest_area_primary' },
			 {name: 'forest_area_protectedareas', label: 'forest_area_protectedareas' },
			 {name: 'forest_belowground_biomass', label: 'forest_belowground_biomass' },
			 {name: 'forest_carbon_aglb', label: 'forest_carbon_aglb' },
			 {name: 'forest_growing_stock', label: 'forest_growing_stock' },
			
			 {name: 'inland_water_area', label: 'inland_water_area' },
			 {name: 'other_land_area', label: 'other_land_area' },
			 {name: 'other_wooded_land_aboveground_biomass', label: 'other_wooded_land_aboveground_biomass' },
			 {name: 'other_wooded_land_area', label: 'other_wooded_land_area' },
			 {name: 'other_wooded_land_belowground_biomass', label: 'other_wooded_land_belowground_biomass' },
			 {name: 'other_wooded_land_carbon_aglb', label: 'other_wooded_land_carbon_aglb' },
			 {name: 'other_wooded_land_growingstock', label: 'other_wooded_land_growingstock' },
];


gxp.data.fraAttributeModel = gxp.data.VisibleAttributeModel.concat([{name: 'year', label: 'Year'}, {name: 'gaulcode', label: 'gaulcode' }]);


gxp.data.fraRecord = Ext.data.Record.create(gxp.data.fraAttributeModel);
