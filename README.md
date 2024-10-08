## FLS (File Loader Service)
---
# Preamble
With dozens of files being loaded on a web service and a cluster of main applications trying to access and process them multiple times, very obvious efficiency problems arise. 
This application was created in order of solving some of those problems.
Let's see how.

---
# Functionality
1. This application provides a simple API that lets you store and retrieve any string of data in memory (RAM). It was designed mainly for files, but technically it can store anything.

2. The problem I had with my file management was that files had to be parsed and processed multiple times before being sent to the client, but since this processing was allways the same/similar, I came up with the idea of storing already processed files at RAM, so access would be much faster at long term, and main apps won't loose time reading again and again the same files and processing them the same way -- just once per cache restart.

3. The interface provides three methods, *POST /(vPath)*, *GET /(vPath)* and *PUT /restart*. Will be explained later.

4. Note that files are stored at RAM, so they will be uncached on each iteration of the service. 

5. Finally, note that filename can be a path and can contain something like a language or something, I used it like: 
*GET /path/to/file/filename.ext/lang*
This was very convinient since my main reason of having to process files was to static-translate them (I used JSON and nodejs/handlebars btw).

6. Remember that the sent data can be any string.

---
# How to use
**1. Methods**
*GET /(vPath)*
Used to get a previously loaded file, returns the contents of the solicited file.
**IMPORTANT!** 
The request must include the headers:
*'Content-Type' : 'application/json'*
*'Client-Token' : '(Your client token)'*

*POST /(vPath)*
Used to post or update a file and assign its content to that virtual path asociated with a client.
**IMPORTANT!** 
The body must be an stringified JSON with this structure:
{
    content : string_to_be_cached
}
And the request must include the headers:
*'Content-Type' : 'application/json'*
*'Client-Token' : '(Your client token)'*

Note that if you POST a file at /index, and then you try to POST another file at /index/subdirectory, the first file will be lost due that internally, each part of the path is a nested key. 
I strongly recommend you add the extension to distinguish files from directories like the example I provided earlier.

*PUT /restart*
This instruction is used to uncache all files asociated with a client on runtime.
**IMPORTANT!** 
The request must include the header:
*'Client-Token' : '(Your client token)'*

Note that a client token or an api token can be a string of any length, if two services share a client token, they will also share the cached files (Which can be convenient for a cluster of the same application).

**2. Before deployment**
This service is meant to run on a local enviroment, such as a LAN network or a localhost, please follow basic safety configurations (And all configurations you need).
- Configure a user dedicated to executing this service
    - Grant no privileges to anything but this service

**3. Start Up**
This service also makes use of some enviroment variables (My intention was to containerize it).
The examples givven are the default values for each env variable.

*LISTEN_PORT=3001*
The port where the app will listen.

*GET_ORIGIN=::ffff:172.17.0.1,127.0.0.1,::1*
The allowed origin IP addresses for the GET method, separated by comma ','.

*POST_ORIGIN=::ffff:172.17.0.1,127.0.0.1,::1*
The allowed origin IP addresses for the POST method, separated by comma ','.

*PUT_ORIGIN=::ffff:172.17.0.1,127.0.0.1,::1*
The allowed origin IP addresses for the PUT method, separated by comma ','.
Recomended localhost.

Note that IPv6 and IPv4 ips must be included, and that common names like localhost wont't work -- only explicit IP addresses will.

*MAX_FILE_SIZE_MB=1*
Max body size of a request that FLS accepts in megabytes, which by extension, is the max size of the data that can be stored in one space of a user (See MAX_FILE_QUEUE_LENGTH).

*MAX_FILE_QUEUE_LENGTH=30*
The maximum amount of files (data spaces) that a user can have cached at the same time, when the number of data spaces available for a user is exceded, the last file gets deleted. In a more technical manner it uses Least Recently Used (LRU) strategy for a users memory management.

Note that total memory storage for a user can be calculated like:
MAX_FILE_SIZE_MB x MAX_FILE_QUEUE_LENGTH. 

**4. Build**
*APP_VERSION=development*
Sets the *NODE_ENV* and other values. Valid values are *production* and *development*.

*NODE_VERSION=18* 
Sets the version of node to be used.

Example (values are the default): 
*docker build --build-arg APP_VERSION=production --build-arg NODE_VERSION=18 -t my-node-app .*