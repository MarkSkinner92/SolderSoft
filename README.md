## SolderSoft

A GUI designed to operate a through-hole soldering machine (based on the MKS Gen L V1.0 hardware)

#### Install
You must install Python3.8 https://www.python.org/downloads/release/python-380/
Then install the dependancies using `pip3.8 install wxPython eel pyserial`

#### Run
Before running, ensure your MKS board is plugged in via USB.
Launch the terminal, cd into the repository, and run `python3.8 app.py`
A window will show up with the GUI

#### Usage Guide
Once the program has been launched, select the apropriate device from the drop down. Ensure your baud rate is correct, then press "Connect".  You will see the Status indicator change to "connected" If it does not change, or hangs on connecting, you may have selected the wrong baud rate or device.

**The left most panel** is a tree view of all the pins and connectors. A connector is essentially just a group of pins. You may also adjust the Board Setup here.

Next to that is the **inspector panel**. It contains information about the particular pin, or connector. Here, you have the option to edit the Solder Profile of a pin.

The **Solder Profile Editor** contains the G-code instructions necessary to solder pins. On the left you will see a list of different profiles. Each profile can have different G-code instructions to accomodate different types of pins. On the right, you will see the G-code editor. Normal G-code is used here, but with the addition of special variables (to be used only within curley brackets) the two built in variables are pinX and pinY. The first line of G-code usually looks something like `G0 X{pinX} Y{pinY}`. During runtime, the actual pin positions will be subsituted. If you want to make your own variables, you can do so in the middle pannel. this is very useful if you need to adjust a couple parameters between pins but don't want to make an entirely new solder profile, or if you want to tune things without opening the profile editor every time. The G-code name is what the variable will be called inside the G-code box. You can also do math operations on those variables, using any valid javascript within the curley brackets. For example, `{height*2+5}` or `{Math.sin(rotation)*5}`

The Soldering Tip menu is experimental, and not fully developed.

**Adding a Connector** will open two menus. On the left, you can create your own connector from scratch. On the right, you can choose a connector from the connector library. This library is saved externally, and not saved automatically. If you modify it, you must click "Save Library" for those changes to persist. If you wish to save a connector to the library, select that connector in the tree menu, and click "save to library."

**Visualization** can be panned with the mouse, and zoomed with the scroll wheel. The red line indicates the order of the pins. (set by the pin's position in the tree)

The **Config tab** is super important, and contains several spots for G-code snippets specific to your machine, which will be be run at their appropriate times.

*More documentation coming soon*

#### Technical Details
A python script (app.py) is responsible for managing the serial port, and creating the wx window. However, the vast majority of the functionality is done in a web-like way with javascript, with HTML providing the UI structure. I chose to use javascript because I'm framiliar with it's syntax. It's easiest for me to develop, and it works very well with UI oriented applications, while still being able to handle the syncronus requirements just fine.

I am considering switching this whole project to a web applicaiton, based on the widely supported USB API, and hosting it with Github Pages. The downside would be needing an internet conenction to launch, and a downgraded connector library, but the benifits would be no download/instalation, platform independance, and live updates. It would probably attract more community support too if it's open source like this and available as a web tool! How cool would that be.