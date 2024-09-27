/**
 * File Loader Service.
 * The objective of this app is to create a service that caches processed files and serves 
 * them efficiently to each node of the main app cluster.
 * Stores in RAM the translated files directly so they can be sent as a refference to the
 * main app, instead of being read each time someone requests it.
*/

// Setup enviroment
require('dotenv').config({ path : `.env.${process.env.NODE_ENV}` })

console.log(`Mode : ${process.env.NODE_ENV}`);

// Setup modules
const express = require('express');

// Parse app config
const config = {
    port : process.env.LISTEN_PORT || 3001,                                                       // 3001
    origin : {
        get : process.env.GET_ORIGIN?.split(',') || ['::ffff:172.17.0.1', '127.0.0.1', '::1'],    // Accepted IP address on GET
        post : process.env.POST_ORIGIN?.split(',') || ['::ffff:172.17.0.1', '127.0.0.1', '::1'],  // Accepted IP address on POST
        put : process.env.PUT_ORIGIN?.split(',') || ['::ffff:172.17.0.1', '127.0.0.1', '::1']     // Accepted IP address on PUT
    },
    files : {
        max_size : parseInt(process.env.MAX_FILE_SIZE_MB || '2'),
        max_queue : parseInt(process.env.MAX_FILE_QUEUE_LENGTH || '10')
    }
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
const api = require('./handlers/api.v2.js')(config, files);

// Create app
const app = express();

// Configure middleware
app.use(...Object.values(middleware));
app.use(express.json({ limit : `${config.files.max_size}mb` }));

// Configure paths
app.get('/*', api.serve);           // File serving handler

app.post('/*', api.cache);          // File caching handler

app.put('/restart', api.restart);   // Cache restar handler


// Start listening
app.listen(config.port, () => {
    console.log(`File Loader Service starting on port: ${config.port}`);
});