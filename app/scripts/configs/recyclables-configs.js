// configs
var journeyConfigs = {};
journeyConfigs.meta = {
  name: 'Recyclables',
  slug: 'recyclables',
  id: 1
};
journeyConfigs.firstPanelId = 'panel-0-1';
// journeyConfigs.visSteps = [
//   {
//     step: 1,
//     name: 'Collection',
//     id: '1-1'
//   },
// ];
journeyConfigs.mapEl = {
  visy: {
    id: '1-3'
  }
  // ,
  // recyExport: {
    // id: '3-4'
  // }
};
journeyConfigs.mapDataPath = 'data/recyclables.geojson';
journeyConfigs.mapConfigs = {};
