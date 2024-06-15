// This program is responsable for making adjustments to the HTML
// based on the environment

env = eel.guid();

if(env == 'web'){
    setupForWeb();
}else{
    setupForPython();
}

function setupForWeb(){
    console.log('setting up environment for web');
    Array.from(document.getElementsByClassName('pythonOnly')).forEach(element => {
        element.style.display = 'none';
    });
    
    // Hide the connect button until a port has been chosen
    document.getElementById('serialActionButton').style.display = 'none';
}
function setupForPython(){
    console.log('setting up environment for python');
    Array.from(document.getElementsByClassName('webOnly')).forEach(element => {
        element.style.display = 'none';
    });
}