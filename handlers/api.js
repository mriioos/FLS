
let config;
let files;
function init(appConfig, filesObject){
    config = appConfig;
    files = filesObject;
    return {
        serve,
        cache,
        restart
    }
}

function serve(req, res){
    res.status(200);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    
    // Get client token
    const clientToken = req.headers['Client-Token'];

    // Check if file is loaded
    const clientFiles = files[clientToken];
    const file = getDeeplyNestedProperty(clientFiles, req.path);

    if(file){
        res.write(file);
        res.end();
    }
    else{
        res.status(404);
        res.end();
    }
}

function cache(req, res){
    res.status(201);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    
    // Get client token
    const clientToken = req.headers['Client-Token'];

    // Check if req.body.content is defined
    if (!req.body?.content) {
        res.status(400).send({ message: 'Bad Request: Content is required' });
        return;
    }
    
    // Save file
    const clientFiles = files[clientToken];
    setDeeplyNestedProperty(clientFiles, req.path, req.body.content);

    // Send a response confirming the save
    res.send({ message: 'File saved successfully', path : req.path });
}

function restart(req, res){ 

    // Get client token 
    const clientToken = req.headers['Client-Token'];

    // Uncache all files for that client
    delete files[clientToken];

    // Acknowledge restart request
    res.status(200).send({ message : 'File cache cleared.'}); 
}

/**
 * Function to set a deeply nested property (deeply nested = parents may not exist).
 * @param {object} obj Root object.
 * @param {string} vPath To deeply nested property.
 * @example /vitrual/path/to/deeply/nested/property/file.js/lang
 * @param {*} value To be set to deeply nested property.
 */
function setDeeplyNestedProperty(obj, vPath, value){

    // Check that object is valid
    if(!obj) return;
    
    // Get key names ordered by deepness (less to most)
    const pathParts = vPath.split('/').filter((part) => part);
    const keys = pathParts.length ? pathParts : [''];

    // Create eack key or access it if exist
    let aux = obj;
    for(let iKey = 0; iKey < keys.length - 1; iKey++){ // Leave last element as the key to the value
        
        // Extract key
        const key = keys[iKey];

        // Create if not exists
        aux[key] = typeof aux[key] === typeof {} ? aux[key] : {};

        // Access
        aux = aux[key];
    }

    // Store value at last key
    const last = keys[keys.length - 1];
    aux[last] = value;
}

/**
 * Function to get a deeply nested property givven its path.
 * @param {object} obj Root object.
 * @param {string} vPath To deeply nested property.
 * @example /vitrual/path/to/deeply/nested/property/file.js/lang
 * @returns {*} Value stored at that property
 */
function getDeeplyNestedProperty(obj, vPath){
    
    // Check that object is valid
    if(!obj) return;

    // Get key names ordered by deepness (less to most)
    const pathParts = vPath.split('/').filter((part) => part);
    const keys = pathParts.length ? pathParts : [''];

    // Access each key if exist
    let aux = obj;
    for(let iKey = 0; iKey < keys.length; iKey++){
        
        // Extract key
        const key = keys[iKey];

        // Access key
        aux = aux[key];

        // Check if aux is still a value
        if(!aux){
            return;
        }
    }

    return aux;
}

module.exports = init;