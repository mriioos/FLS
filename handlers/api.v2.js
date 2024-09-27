const ezdn = require('ezdeepnest');

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
    const clientToken = req.headers['client-token'];

    // Check if file is loaded
    const workspace = files[clientToken];
    const file = ezdn.get(workspace.data, req.path);

    console.log(files);

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
    const clientToken = req.headers['client-token'];

    // Check if req.body.content is defined
    if (!req.body?.content) {
        res.status(400).send({ message: 'Bad Request: Content is required' });
        return;
    }

    // Convert client data to a string
    const data = typeof req.body.content === typeof {} ? JSON.stringify(req.body.content) : req.body.content;

    // Create client workspace if not exists
    files[clientToken] = files[clientToken] ? files[clientToken] : {
        queue : [],
        data : {}
    };

    // Access client workspace
    const workspace = files[clientToken];

    // Store file data
    const newMeta = ezdn.set(workspace.data, req.path, data);

    // Remove old records of this file (If exists)
    workspace.queue = workspace.queue.filter((storedMeta) => !equalMeta(storedMeta, newMeta));
    
    // Renew file priority on the file queue
    workspace.queue.push(newMeta);

    // Remove less used file (if queue > 10)
    if(workspace.queue.length > config.files.max_queue) workspace.queue.shift();
    
    // Log this user's files
    console.log(files);

    // Send a response confirming the save
    res.send({ message: 'File saved successfully', path : req.path });
}

function equalMeta(storedMeta, newMeta){

    const storedValues = Object.values(storedMeta);
    const newValues = Object.values(newMeta);

    if(storedValues.length !== newValues.length) return false;

    for(let iVal = 0; iVal < storedValues.length; iVal++){
        if(storedValues[iVal] !== newValues[iVal]) return false;
    }

    return true;
}

function restart(req, res){ 

    // Get client token 
    const clientToken = req.headers['client-token'];

    // Uncache all files for that client and metadata
    delete files[clientToken];

    // Acknowledge restart request
    res.status(200).send({ message : 'File cache cleared.'}); 
}

module.exports = init;