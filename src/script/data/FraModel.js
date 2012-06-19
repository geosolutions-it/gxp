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
 * Composite entry for the country grid
 *
 */
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
  
  /*
1 fire_area_all_land, 
2 fire_area_forest, 
3 fire_number_all_land, 
4 fire_number_forest, 
5 forest_aboveground_biomass, 
6 forest_area2, 
7 forest_area_afforestationt, 
8 forest_area_naturalexpansion, 
9 forest_area_planted, 
10 forest_area_primary, 
11 forest_area_protectedareas, 
12 forest_area_reforestationt, 
13 forest_belowground_biomass, 
14 forest_carbon_aglb, 
15 forest_growing_stock, 
16 inland_water_area, 
17 other_land_area, 
18 other_land_with_tree_cover_area, 
19 other_wooded_land_aboveground_biomass, 
20 other_wooded_land_area, 
21 other_wooded_land_belowground_biomass, 
22 other_wooded_land_carbon_aglb, 
23 other_wooded_land_growingstock, 
24 ownership_other, 
25 ownership_private, 
26 ownership_public, 
  */
gxp.data.VisibleAttributeModel=[
			 {name: 'fire_area_all_land', label: 'fire_area_all_land'},
			 {name: 'fire_area_forest', label: 'fire_area_forest' },
			 {name: 'fire_number_all_land', label: 'fire_number_all_land'},
			 {name: 'fire_number_forest',label:'fire_number_forest'},
			 {name: 'forest_aboveground_biomass', label: 'forest_aboveground_biomass' },
			 {name: 'forest_area2', label: 'forest_area2' },
			 {name: 'forest_area_afforestationt', label: 'forest_area_afforestationt' },
			 {name: 'forest_area_naturalexpansion', label: 'forest_area_naturalexpansion' },
			 {name: 'forest_area_planted', label: 'forest_area_planted' },
			 {name: 'other_land_area', label: 'other_land_area' },
			 {name: 'other_wooded_land_aboveground_biomass', label: 'other wooded land aboveground biomass' },
			 {name: 'other_wooded_land_area', label: 'other wooded land area' },
			 {name: 'other_wooded_land_belowground_biomass', label: 'other wooded land belowground biomass' },
			 {name: 'forest_area_primary', label: 'forest_area_primary' },
			 {name: 'forest_area_protectedareas', label: 'forest_area_protectedareas' },
			 {name: 'forest_area_reforestationt', label: 'forest_area_reforestationt' },
			 {name: 'forest_belowground_biomass', label: 'forest_belowground_biomass' },
			 {name: 'forest_carbon_aglb', label: 'forest_carbon_aglb' },
			 {name: 'forest_growing_stock', label: 'forest_growing_stock' },
			 {name: 'inland_water_area', label: 'inland_water_area' },
			 {name: 'other_land_with_tree_cover_area', label: 'other_land_with_tree_cover_area' },
			 {name: 'other_wooded_land_carbon_aglb', label: 'other_wooded_land_carbon_aglb' },
			 {name: 'ownership_other', label: 'ownership_other' },
			 {name: 'ownership_private', label: 'ownership_private' },
			 {name: 'ownership_public', label: 'ownership_public' },			
			 {name: 'other_wooded_land_growingstock', label: 'other wooded land growingstock' }
];


gxp.data.fraAttributeModel = gxp.data.VisibleAttributeModel.concat([{name: 'year', label: 'Year'}, {name: 'gaulcode', label: 'gaulcode' }]);


gxp.data.fraRecord = Ext.data.Record.create(gxp.data.fraAttributeModel);
