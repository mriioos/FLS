/**
 * File Loader Service.
 * The objective of this app is to create a service that caches processed files and serves 
 * them efficiently to each node of the main app cluster.
 * Stores in RAM the translated files directly so they can be sent as a refference to the
 * main app, instead of being read each time someone requests it.
*/

// Setup enviroment
require('dotenv').config({ path : `.env.${process.env.NODE_ENV}` })

// Setup modules
const express = require('express');

// Parse app config
const config = {
    port : process.env.LISTEN_PORT || 3001,                                 // 3001
    origin : {
        get : process.env.GET_ORIGIN?.split(',') || ['127.0.0.1','::1'],    // Accepted IP address on GET
        post : process.env.POST_ORIGIN?.split(',') || ['127.0.0.1','::1'],  // Accepted IP address on POST
        put : process.env.PUT_ORIGIN?.split(',') || ['127.0.0.1','::1']     // Accepted IP address on PUT
    },
    token : process.env.API_TOKEN
};

if(process.env.NODE_ENV == 'development'){
    console.log(config);
}

/**
 * Object that stores file data and metadata.
 * Needs to be generated dynamically so when new files are added they can be located.
 */
let files = {};

// Utility modules
const middleware = require('./handlers/middleware.js')(config, files);
const api = require('./handlers/api.js')(config, files);

// Create app
const app = express();

// Configure middleware
app.use(middleware.reqFilter);
app.use(middleware.clientFilter);
app.use(express.json({ limit : '2mb' }));

// Configure paths
app.get('/*', api.serve);           // File serving handler

app.post('/*', api.cache);          // File caching handler

app.put('/restart', api.restart);   // Cache restar handler


// Start listening
app.listen(config.port, () => {
    console.log(`File Loader Service starting on port: ${config.port}`);
});