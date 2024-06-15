// This class has methods for all the methods called using the python eel library, but for web
// the goal here is to make the front end behave the same, regardless of whether it's being run by Python, or on a website
class BackendAbstractionLayer{

    constructor() {
        this.usingBackendAbstraction = true;
        this.serialPort = null;
        this.encoder = new TextEncoder();
    }

    guid(){
        return 'web'
    }

    fetchConnectorLibrary(){
        let backendManager = this;
        return function(){
            return new Promise((resolve, reject) => {
                (async function(){
                    let fileHandle;
                    [fileHandle] = await window.showOpenFilePicker();
                    const file = await fileHandle.getFile();
                    const contents = await file.text();
                    console.log(contents);
                    backendManager.connectorLibraryHandle = fileHandle;
                    let jdata = JSON.parse(contents);
                    console.log('connector library fetched');
                    resolve(jdata);
                })();
            });
        }
    }

    // eel.updateConnectorLibrary(this.package());
    updateConnectorLibrary(connectorLibraryData){
        let backendManager = this;
        (async function(){
            if(!backendManager.connectorLibraryHandle){
                const options = {
                    types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            "application/json": [".json"]
                        },
                    },
                    ],
                };
                const handle = await window.showSaveFilePicker(options);
                backendManager.connectorLibraryHandle = handle;
            }

            const writable = await backendManager.connectorLibraryHandle.createWritable({ keepExistingData: false });
            // Write the contents of the file to the stream.
            await writable.write(JSON.stringify(connectorLibraryData, null, 2));
            // Close the file and write the contents to disk.
            await writable.close();
            console.log('connector library updated');
        })();
    }

    //.savePackage(filejson)(status=>{});
    savePackage(filejson) {
        let fileHandle = this.mainFile;
        return async function(callback) {
            try{
                const writable = await fileHandle.createWritable({ keepExistingData: false });
                // Write the contents of the file to the stream.
                await writable.write(JSON.stringify(filejson, null, 2));
                // Close the file and write the contents to disk.
                await writable.close();
                callback('success');
            }
            catch{
                callback('failed');
            }
            
        }
    }

    //.savePackageAs(filejson)(status=>{});
    savePackageAs(filejson) {
        let backendManager = this;
        return async function(callback) {
            try{
                const options = {
                    types: [
                        {
                            description: 'SolderSoft file',
                            accept: {
                                "custom/type": [".ss"]
                            },
                        },
                    ],
                };
                const handle = await window.showSaveFilePicker(options);
                backendManager.fileHandle = handle;

                const writable = await handle.createWritable({ keepExistingData: false });
                // Write the contents of the file to the stream.
                await writable.write(JSON.stringify(filejson, null, 2));
                // Close the file and write the contents to disk.
                await writable.close();

                let info = {status:'success', path:handle.name}; // Example status
                callback(info);
            }
            catch(e){
                if (e.name === 'AbortError') {
                    console.log('User aborted the request.');
                    callback({status:'cancel', path:''});
                }else{
                    console.error(e);
                    callback({status:'failed', path:''});
                }
            }
        }
    }

    // await openJSONfile()(); using the FileSystem API
    openJSONfile(){
        let backendManager = this;
        return async function(){
            let fileHandle;
            const options = {
                types: [
                    {
                        description: 'SolderSoft file',
                        accept: {
                            "custom/type": [".ss"]
                        },
                    },
                ],
            };
            [fileHandle] = await window.showOpenFilePicker(options);
            const file = await fileHandle.getFile();
            const contents = await file.text();
            console.log(contents);
            backendManager.mainFile = fileHandle;
            let jdata = JSON.parse(contents);
            jdata['path'] = fileHandle.name;
            return jdata
        }
    }


    // await eel.connect(port,baudRate)();
    connect(port, baudRate){
        let serialPort = this.serialPort;
        let backendManager = this;
        this.reading = true;
        return async function(){
            await serialPort.open({ baudRate: baudRate });

            let line = "";

            backendManager.reader = serialPort.readable.getReader();
            
            try {
                while (backendManager.reading) {
                    const { value } = await backendManager.reader.read();
                    if (value) {
                        value.forEach(byte => {
                            if(byte == 10){
                                console.log(line);
                                backendManager.recieveSerialLine(line);
                                line = '';
                            }
                            else line += String.fromCharCode(byte);
                        });
                    }
                }
            } catch (error) {
                console.log('serial read encountered an error. Disconnecting...')
                if(serial) serial.disconnect();
            }
        }
    }

    // await eel.disconnect()();
    disconnect(){
        let serialPort = this.serialPort;
        this.reading = false;
        this.reader.releaseLock();
        return async function(){
            await serialPort.close();
            console.log("disconnected");
        }
    }

    //let ports = await eel.fetchUSBPorts()();
    fetchUSBPorts(){
        return async function(){
            return ['port handled through web API']
        }
    }

    // Sends unaltered gcode right out serial port
    sendGcode(code){
        let data = this.encoder.encode(code);
        console.log("sending out serial port: ",code);
        const writer = this.serialPort.writable.getWriter();
        writer.write(data);
        writer.releaseLock();
    }

    // Allows us to call this function: this.recieveSerialLine(line)
    expose(functionToExpose){
        this[functionToExpose.name] = functionToExpose;
    }

    // ---------- WEB ENV SPECIFIC METHODS

    chooseSerialDevice (){
        navigator.serial
        .requestPort()
        .then((port) => {
            // Connect to `port` or add it to the list of available ports.
            console.log(port);
            this.serialPort = port;
            document.getElementById('serialActionButton').style.display = 'unset'
        })
        .catch((e) => {
            // The user didn't select a port.
        });
    }


}

let eel = new BackendAbstractionLayer();