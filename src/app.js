const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const swagger = require('feathers-swagger');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const mongodb = require('./mongodb');

const app = express(feathers());

// Load app configuration
app.configure(configuration());



app.configure(swagger({
  openApiVersion: 3,
  docsPath: '/api/v1',
  prefix: '/api/v1',
  uiIndex:true,
  specs: {
    info: {
      title: 'chomys.api.gateway',
      description: 'chomys services',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BasicAuth: {
          type: 'http',
          scheme: 'basic'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    },
    security: [
      { BearerAuth: [] }
    ]
  },
  //paths: ['api/v1/users']
}));
 



// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(mongodb);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
