import eel

eel.init('web')

@eel.expose
def call():
    eel.prompt_alerts('ok')

eel.start('index.html');
