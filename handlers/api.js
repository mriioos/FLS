
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
    
    // Check if file is loaded
    const file = files?.[req.path];

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

    // Check if req.body.content is defined
    if (!req.body || !req.body.content) {
        res.status(400).send({ message: 'Bad Request: Content is required' });
        return;
    }
    
    // Save file
    files[req.path] = req.body.content;

    // Send a response confirming the save
    res.send({ message: 'File saved successfully', path : req.path });
}

function restart(req, res){ 
    Object.keys(files).forEach(vPath => delete files[vPath]); 
    res.status(200).send({ message : 'File cache cleared.'}); // Acknowledge restart request
}