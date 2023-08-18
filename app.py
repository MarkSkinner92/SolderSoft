import eel
import random
from datetime import datetime

eel.init('web')

@eel.expose
def call():
    eel.prompt_alerts('ok')

eel.start('index.html');
