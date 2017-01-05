module.exports = class Swagger {
  constructor(swaggerJSON) {
    this.swagger = swaggerJSON;
    this.entities = {};
  }

  collectEntities() {
    Object.keys(this.swagger.paths).forEach(path => {
      Object.keys(this.swagger.paths[path]).forEach(method => {
        const entity = this.swagger.paths[path][method].tags[0];
        const match = new RegExp(`${entity}\:(.*)`);
        const definitions = Object.keys(this.swagger.definitions).filter(element => match.test(element));
        (definitions.length ? definitions : [entity]).forEach(bundle => {

          const bundleData = this.swagger.definitions[bundle].hasOwnProperty('allOf') ?
            this.swagger.definitions[bundle].allOf[1] :
            this.swagger.definitions[bundle];

          if (this.swagger.definitions[bundle].hasOwnProperty('allOf')) {
            bundleData.properties = Object.assign(
              bundleData.properties,
              this.swagger.definitions[this.swagger.definitions[bundle].allOf[0].$ref.split('/').pop()].properties
            );
          }

          // Only create an Object if we don't have one previously.
          if (!this.entities.hasOwnProperty(bundle)) {
            this.entities[bundle] = {};
          }

          // Create the methods key if this is the first time.
          this.entities[bundle].methods = this.entities[bundle].methods ? this.entities[bundle].methods : {};
          // Setup method information.
          this.entities[bundle].methods[method] = {
            path: path,
            parameters: this.swagger.paths[path][method].parameters
          };

          // Setup bundle properties.
          this.entities[bundle].properties = this.entities[bundle].properties ?
            this.entities[bundle].properties :
            bundleData.properties;

          // Setup required fields.
          this.entities[bundle].requiredFields = this.entities[bundle].requiredFields ?
            this.entities[bundle].requiredFields :
            bundleData.required;

        });
      });
    });

    return this.entities;
  }
};
