{
  "path": "tannerbot.ss",
  "solderProfileWindow": {
    "profiles": [
      {
        "id": "sp_default",
        "name": "Default",
        "variables": [
          {
            "id": "v-54c420",
            "uiname": "Prime Position",
            "gcodename": "primepos",
            "defaultvalue": "32"
          },
          {
            "id": "v-0d0b40",
            "uiname": "Prime Amount",
            "gcodename": "primeamt",
            "defaultvalue": "0.4"
          },
          {
            "id": "v-148a82",
            "uiname": "Solder Amount",
            "gcodename": "solderamt",
            "defaultvalue": "0.2"
          },
          {
            "id": "v-8ba607",
            "uiname": "Time On Pad (ms)",
            "gcodename": "timeonpad",
            "defaultvalue": "1500"
          },
          {
            "id": "v-4996cf",
            "uiname": "Extrusion Speed",
            "gcodename": "exspeed",
            "defaultvalue": "10"
          },
          {
            "id": "v-e7b3a9",
            "uiname": "Afterburn",
            "gcodename": "afterburn",
            "defaultvalue": "200"
          }
        ],
        "gcode": "G90\nM280 P1 S90\nG0 X{pinX} Y{pinY} Z{pinZ+4} F400; Go 4mm above pin\nM400\n\n; Prime the tip\nG91\nM280 P0 S{primepos}; Extend iron to prime position\nG4 P20;\nG1 E{primeamt} F20; Put some solder out\nM400\nG1 E-0.05 F20; Retract solder\nM400\nM280 P0 S25; Retract iron before we go down\nG4 P20;\n\n; Move down to pin\nG90\nG0 Z{pinZ-0.4} F400;\nM400\n\n; Push iron onto pin\nM280 P0 S35\nG4 P20\n\n; Heat up the pin and pad\nG4 P{timeonpad}\n\n; Extrude some solder (SOLDER)\nG91\nG0 E{solderamt} F{exspeed}\nM400\nG4 P100; DELAY FOR SOLDERING\nG4 P{afterburn}\nM280 P0 S10; Quickly retract iron after soldering\nG0 E-0.2 F20; pull back solder a bit\nM400;\nG4 P10;\n\nG90\nG0 Z{pinZ+4} F800",
        "solderingTipId": "st_default",
        "color": "#84009c",
        "tipCleanInterval": 10
      },
      {
        "id": "sp_1f227d",
        "name": "Hover",
        "gcode": "G90\nM280 P1 S90\nG0 X{pinX} Y{pinY} Z9 F400; move to the pin's center position\nM400\n\n(put something here to move the Z up)\n(to avoid collisions as it moves to the next pin)",
        "solderingTipId": "st_default",
        "color": "#0ed600",
        "tipCleanInterval": 10
      }
    ],
    "activeProfileId": "sp_1f227d",
    "defaultProfileId": "sp_default",
    "selectedTipId": "st_default",
    "selectedVariableId": false,
    "tips": [
      {
        "id": "st_default",
        "name": "Default"
      }
    ]
  },
  "tree": {
    "packagedElements": [
      {
        "id": "c-2998a1",
        "type": "connector",
        "name": "tool-4",
        "enabled": true,
        "position": {
          "x": 0,
          "y": 0
        },
        "rotation": 0,
        "pinIds": [
          "p-a7fe49",
          "p-d9667c",
          "p-c0687b",
          "p-dfe9ff",
          "p-2fb730",
          "p-f762ac",
          "p-721ecb",
          "p-b61ea2",
          "p-cea1e4",
          "p-8e4029",
          "p-0c58fe",
          "p-4c3557",
          "p-df45f9",
          "p-dfed22",
          "p-81ecfb",
          "p-6cb662",
          "p-186523",
          "p-de60bf",
          "p-fe9b82",
          "p-def13d",
          "p-70be06",
          "p-e9d50c",
          "p-cbf0c6",
          "p-f98761",
          "p-87e4ad",
          "p-224d7c",
          "p-08eeb3",
          "p-f7f41f",
          "p-1544f1",
          "p-c0012a",
          "p-695f43",
          "p-df8ff0",
          "p-1271db",
          "p-4edc9f",
          "p-04595a",
          "p-63ba14",
          "p-f1bab9",
          "p-3b9e53",
          "p-b094ae",
          "p-c49f38",
          "p-86d0fd",
          "p-ac8cb5",
          "p-438404",
          "p-9e0a68",
          "p-d6e8cc",
          "p-886715",
          "p-a903e5",
          "p-d8ceb8",
          "p-08870c",
          "p-e7b526",
          "p-0aa265",
          "p-c39e30",
          "p-8a1d44",
          "p-751606",
          "p-22c3c7",
          "p-6d7f76",
          "p-13c7dc",
          "p-afef1d",
          "p-0b0637",
          "p-e0baf0",
          "p-ce038c",
          "p-9d1e07",
          "p-935e11",
          "p-625bb4",
          "p-1be6cd",
          "p-6d659c",
          "p-c1abb9",
          "p-be744a",
          "p-8d710d",
          "p-cb0f9f",
          "p-509d04",
          "p-98b942",
          "p-8b9bac",
          "p-5aaf84",
          "p-5507fb",
          "p-cab509",
          "p-a6538c",
          "p-79dd6a",
          "p-e434ac",
          "p-34f0c5",
          "p-7517a3",
          "p-011fa0",
          "p-610efa",
          "p-3720be",
          "p-590dc8",
          "p-e59ce7",
          "p-fd5332",
          "p-f349e9",
          "p-f773cb",
          "p-dd933f",
          "p-90c74f",
          "p-5c2c1c",
          "p-1d8f9f",
          "p-bf3365",
          "p-bac220",
          "p-2879c8",
          "p-226e53",
          "p-939fa7",
          "p-ff7930",
          "p-493c1a",
          "p-f6f06c",
          "p-b69b06",
          "p-2e2e7a",
          "p-365187",
          "p-1b1bea",
          "p-559c94",
          "p-bad117",
          "p-50a3d3",
          "p-93588c",
          "p-edfaa0",
          "p-808b47",
          "p-fbd0fd",
          "p-dcc587",
          "p-864145",
          "p-614a70",
          "p-4d6851",
          "p-f847bd",
          "p-475689",
          "p-fca4ba",
          "p-8030be",
          "p-49678a",
          "p-9ec3a8",
          "p-9376b8",
          "p-2b3afe",
          "p-b10326",
          "p-9a7e3e",
          "p-85ccff",
          "p-dbf4e1",
          "p-a575cf",
          "p-60307c",
          "p-0c3591",
          "p-8ae96f",
          "p-c86ba0",
          "p-d7687b",
          "p-bec493",
          "p-014a78",
          "p-31ff8d",
          "p-dc9a27"
        ],
        "expanded": false
      },
      {
        "id": "p-a7fe49",
        "type": "pin",
        "name": "S1",
        "enabled": true,
        "position": {
          "x": 53.46,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-d9667c",
        "type": "pin",
        "name": "S2",
        "enabled": true,
        "position": {
          "x": 50.92,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c0687b",
        "type": "pin",
        "name": "S3",
        "enabled": true,
        "position": {
          "x": 48.379999999999995,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dfe9ff",
        "type": "pin",
        "name": "S4",
        "enabled": true,
        "position": {
          "x": 45.84,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-2fb730",
        "type": "pin",
        "name": "S5",
        "enabled": true,
        "position": {
          "x": 43.3,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f762ac",
        "type": "pin",
        "name": "S6",
        "enabled": true,
        "position": {
          "x": 40.760000000000005,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-721ecb",
        "type": "pin",
        "name": "S7",
        "enabled": true,
        "position": {
          "x": 38.22,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-b61ea2",
        "type": "pin",
        "name": "S8",
        "enabled": true,
        "position": {
          "x": 35.68,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-cea1e4",
        "type": "pin",
        "name": "S9",
        "enabled": true,
        "position": {
          "x": 30.6,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8e4029",
        "type": "pin",
        "name": "S10",
        "enabled": true,
        "position": {
          "x": 28.060000000000002,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-0c58fe",
        "type": "pin",
        "name": "S11",
        "enabled": true,
        "position": {
          "x": 25.520000000000003,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-4c3557",
        "type": "pin",
        "name": "S12",
        "enabled": true,
        "position": {
          "x": 22.979999999999997,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-df45f9",
        "type": "pin",
        "name": "S13",
        "enabled": true,
        "position": {
          "x": 20.439999999999998,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dfed22",
        "type": "pin",
        "name": "S14",
        "enabled": true,
        "position": {
          "x": 17.9,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-81ecfb",
        "type": "pin",
        "name": "S15",
        "enabled": true,
        "position": {
          "x": 15.36,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-6cb662",
        "type": "pin",
        "name": "S16",
        "enabled": true,
        "position": {
          "x": 12.82,
          "y": 1.695
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-186523",
        "type": "pin",
        "name": "S17",
        "enabled": true,
        "position": {
          "x": 12.82,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-de60bf",
        "type": "pin",
        "name": "S18",
        "enabled": true,
        "position": {
          "x": 15.36,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-fe9b82",
        "type": "pin",
        "name": "S19",
        "enabled": true,
        "position": {
          "x": 17.9,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-def13d",
        "type": "pin",
        "name": "S20",
        "enabled": true,
        "position": {
          "x": 20.439999999999998,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-70be06",
        "type": "pin",
        "name": "S21",
        "enabled": true,
        "position": {
          "x": 20.439999999999998,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-e9d50c",
        "type": "pin",
        "name": "S22",
        "enabled": true,
        "position": {
          "x": 17.9,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-cbf0c6",
        "type": "pin",
        "name": "S23",
        "enabled": true,
        "position": {
          "x": 15.36,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f98761",
        "type": "pin",
        "name": "S24",
        "enabled": true,
        "position": {
          "x": 12.82,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-87e4ad",
        "type": "pin",
        "name": "S25",
        "enabled": true,
        "position": {
          "x": 22.979999999999997,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-224d7c",
        "type": "pin",
        "name": "S26",
        "enabled": true,
        "position": {
          "x": 25.520000000000003,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-08eeb3",
        "type": "pin",
        "name": "S27",
        "enabled": true,
        "position": {
          "x": 28.060000000000002,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f7f41f",
        "type": "pin",
        "name": "S28",
        "enabled": true,
        "position": {
          "x": 28.060000000000002,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-1544f1",
        "type": "pin",
        "name": "S29",
        "enabled": true,
        "position": {
          "x": 30.6,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c0012a",
        "type": "pin",
        "name": "S30",
        "enabled": true,
        "position": {
          "x": 30.6,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-695f43",
        "type": "pin",
        "name": "S31",
        "enabled": true,
        "position": {
          "x": 25.520000000000003,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-df8ff0",
        "type": "pin",
        "name": "S32",
        "enabled": true,
        "position": {
          "x": 22.979999999999997,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-1271db",
        "type": "pin",
        "name": "S33",
        "enabled": true,
        "position": {
          "x": 23.61,
          "y": 26.46
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-4edc9f",
        "type": "pin",
        "name": "S34",
        "enabled": true,
        "position": {
          "x": 26.15,
          "y": 26.46
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-04595a",
        "type": "pin",
        "name": "S35",
        "enabled": true,
        "position": {
          "x": 28.689999999999998,
          "y": 26.46
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-63ba14",
        "type": "pin",
        "name": "S36",
        "enabled": true,
        "position": {
          "x": 31.229999999999997,
          "y": 26.46
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f1bab9",
        "type": "pin",
        "name": "S37",
        "enabled": true,
        "position": {
          "x": 33.77,
          "y": 26.46
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-3b9e53",
        "type": "pin",
        "name": "S38",
        "enabled": true,
        "position": {
          "x": 33.77,
          "y": 29
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-b094ae",
        "type": "pin",
        "name": "S39",
        "enabled": true,
        "position": {
          "x": 33.77,
          "y": 31.54
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c49f38",
        "type": "pin",
        "name": "S40",
        "enabled": true,
        "position": {
          "x": 31.229999999999997,
          "y": 31.54
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-86d0fd",
        "type": "pin",
        "name": "S41",
        "enabled": true,
        "position": {
          "x": 31.229999999999997,
          "y": 29
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-ac8cb5",
        "type": "pin",
        "name": "S42",
        "enabled": true,
        "position": {
          "x": 28.689999999999998,
          "y": 29
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-438404",
        "type": "pin",
        "name": "S43",
        "enabled": true,
        "position": {
          "x": 28.689999999999998,
          "y": 31.54
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-9e0a68",
        "type": "pin",
        "name": "S44",
        "enabled": true,
        "position": {
          "x": 26.15,
          "y": 31.54
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-d6e8cc",
        "type": "pin",
        "name": "S45",
        "enabled": true,
        "position": {
          "x": 26.15,
          "y": 29
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-886715",
        "type": "pin",
        "name": "S46",
        "enabled": true,
        "position": {
          "x": 23.61,
          "y": 29
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-a903e5",
        "type": "pin",
        "name": "S47",
        "enabled": true,
        "position": {
          "x": 23.61,
          "y": 31.54
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-d8ceb8",
        "type": "pin",
        "name": "S48",
        "enabled": true,
        "position": {
          "x": 39.307,
          "y": 38.421
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-08870c",
        "type": "pin",
        "name": "S49",
        "enabled": true,
        "position": {
          "x": 39.307,
          "y": 40.961
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-e7b526",
        "type": "pin",
        "name": "S50",
        "enabled": true,
        "position": {
          "x": 41.847,
          "y": 40.961
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-0aa265",
        "type": "pin",
        "name": "S51",
        "enabled": true,
        "position": {
          "x": 41.847,
          "y": 38.421
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c39e30",
        "type": "pin",
        "name": "S52",
        "enabled": true,
        "position": {
          "x": 40.760000000000005,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8a1d44",
        "type": "pin",
        "name": "S53",
        "enabled": true,
        "position": {
          "x": 43.3,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-751606",
        "type": "pin",
        "name": "S54",
        "enabled": true,
        "position": {
          "x": 45.84,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-22c3c7",
        "type": "pin",
        "name": "S55",
        "enabled": true,
        "position": {
          "x": 48.379999999999995,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-6d7f76",
        "type": "pin",
        "name": "S56",
        "enabled": true,
        "position": {
          "x": 48.379999999999995,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-13c7dc",
        "type": "pin",
        "name": "S57",
        "enabled": true,
        "position": {
          "x": 50.92,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-afef1d",
        "type": "pin",
        "name": "S58",
        "enabled": true,
        "position": {
          "x": 50.92,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-0b0637",
        "type": "pin",
        "name": "S59",
        "enabled": true,
        "position": {
          "x": 53.46,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-e0baf0",
        "type": "pin",
        "name": "S60",
        "enabled": true,
        "position": {
          "x": 53.46,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-ce038c",
        "type": "pin",
        "name": "S61",
        "enabled": true,
        "position": {
          "x": 45.84,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-9d1e07",
        "type": "pin",
        "name": "S62",
        "enabled": true,
        "position": {
          "x": 43.3,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-935e11",
        "type": "pin",
        "name": "S63",
        "enabled": true,
        "position": {
          "x": 40.760000000000005,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-625bb4",
        "type": "pin",
        "name": "S64",
        "enabled": true,
        "position": {
          "x": 38.22,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-1be6cd",
        "type": "pin",
        "name": "S65",
        "enabled": true,
        "position": {
          "x": 38.22,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-6d659c",
        "type": "pin",
        "name": "S66",
        "enabled": true,
        "position": {
          "x": 35.68,
          "y": 6.775
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c1abb9",
        "type": "pin",
        "name": "S67",
        "enabled": true,
        "position": {
          "x": 35.68,
          "y": 4.235
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-be744a",
        "type": "pin",
        "name": "S68",
        "enabled": true,
        "position": {
          "x": 39.307,
          "y": 43.501
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8d710d",
        "type": "pin",
        "name": "S69",
        "enabled": true,
        "position": {
          "x": 41.847,
          "y": 43.501
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-cb0f9f",
        "type": "pin",
        "name": "S70",
        "enabled": false,
        "position": {
          "x": 41.39,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-509d04",
        "type": "pin",
        "name": "S71",
        "enabled": false,
        "position": {
          "x": 43.93,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-98b942",
        "type": "pin",
        "name": "S72",
        "enabled": false,
        "position": {
          "x": 46.47,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8b9bac",
        "type": "pin",
        "name": "S73",
        "enabled": false,
        "position": {
          "x": 49.010000000000005,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-5aaf84",
        "type": "pin",
        "name": "S74",
        "enabled": false,
        "position": {
          "x": 51.55,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-5507fb",
        "type": "pin",
        "name": "S75",
        "enabled": false,
        "position": {
          "x": 54.09,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-cab509",
        "type": "pin",
        "name": "S76",
        "enabled": false,
        "position": {
          "x": 56.63,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-a6538c",
        "type": "pin",
        "name": "S77",
        "enabled": false,
        "position": {
          "x": 56.63,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-79dd6a",
        "type": "pin",
        "name": "S78",
        "enabled": false,
        "position": {
          "x": 54.09,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-e434ac",
        "type": "pin",
        "name": "S79",
        "enabled": false,
        "position": {
          "x": 51.55,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-34f0c5",
        "type": "pin",
        "name": "S80",
        "enabled": false,
        "position": {
          "x": 49.010000000000005,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-7517a3",
        "type": "pin",
        "name": "S81",
        "enabled": false,
        "position": {
          "x": 46.47,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-011fa0",
        "type": "pin",
        "name": "S82",
        "enabled": false,
        "position": {
          "x": 43.93,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-610efa",
        "type": "pin",
        "name": "S83",
        "enabled": false,
        "position": {
          "x": 41.39,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-3720be",
        "type": "pin",
        "name": "S84",
        "enabled": false,
        "position": {
          "x": 38.85,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-590dc8",
        "type": "pin",
        "name": "S85",
        "enabled": false,
        "position": {
          "x": 38.85,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-e59ce7",
        "type": "pin",
        "name": "S86",
        "enabled": false,
        "position": {
          "x": 36.31,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-fd5332",
        "type": "pin",
        "name": "S87",
        "enabled": false,
        "position": {
          "x": 36.31,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f349e9",
        "type": "pin",
        "name": "S88",
        "enabled": false,
        "position": {
          "x": 33.77,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f773cb",
        "type": "pin",
        "name": "S89",
        "enabled": false,
        "position": {
          "x": 33.77,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dd933f",
        "type": "pin",
        "name": "S90",
        "enabled": false,
        "position": {
          "x": 31.229999999999997,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-90c74f",
        "type": "pin",
        "name": "S91",
        "enabled": false,
        "position": {
          "x": 31.229999999999997,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-5c2c1c",
        "type": "pin",
        "name": "S92",
        "enabled": false,
        "position": {
          "x": 28.689999999999998,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-1d8f9f",
        "type": "pin",
        "name": "S93",
        "enabled": false,
        "position": {
          "x": 28.689999999999998,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-bf3365",
        "type": "pin",
        "name": "S94",
        "enabled": false,
        "position": {
          "x": 26.15,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-bac220",
        "type": "pin",
        "name": "S95",
        "enabled": false,
        "position": {
          "x": 26.15,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-2879c8",
        "type": "pin",
        "name": "S96",
        "enabled": false,
        "position": {
          "x": 23.61,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-226e53",
        "type": "pin",
        "name": "S97",
        "enabled": false,
        "position": {
          "x": 23.61,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-939fa7",
        "type": "pin",
        "name": "S98",
        "enabled": false,
        "position": {
          "x": 21.07,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-ff7930",
        "type": "pin",
        "name": "S99",
        "enabled": false,
        "position": {
          "x": 21.07,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-493c1a",
        "type": "pin",
        "name": "S100",
        "enabled": false,
        "position": {
          "x": 18.53,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f6f06c",
        "type": "pin",
        "name": "S101",
        "enabled": false,
        "position": {
          "x": 18.53,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-b69b06",
        "type": "pin",
        "name": "S102",
        "enabled": false,
        "position": {
          "x": 15.990000000000002,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-2e2e7a",
        "type": "pin",
        "name": "S103",
        "enabled": false,
        "position": {
          "x": 13.450000000000003,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-365187",
        "type": "pin",
        "name": "S104",
        "enabled": false,
        "position": {
          "x": 10.909999999999997,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-1b1bea",
        "type": "pin",
        "name": "S105",
        "enabled": false,
        "position": {
          "x": 8.369999999999997,
          "y": 61.23
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-559c94",
        "type": "pin",
        "name": "S106",
        "enabled": false,
        "position": {
          "x": 8.369999999999997,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-bad117",
        "type": "pin",
        "name": "S107",
        "enabled": false,
        "position": {
          "x": 10.909999999999997,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-50a3d3",
        "type": "pin",
        "name": "S108",
        "enabled": false,
        "position": {
          "x": 13.450000000000003,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-93588c",
        "type": "pin",
        "name": "S109",
        "enabled": false,
        "position": {
          "x": 15.990000000000002,
          "y": 63.77
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-edfaa0",
        "type": "pin",
        "name": "S110",
        "enabled": true,
        "position": {
          "x": 15.990000000000002,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-808b47",
        "type": "pin",
        "name": "S111",
        "enabled": true,
        "position": {
          "x": 13.450000000000003,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-fbd0fd",
        "type": "pin",
        "name": "S112",
        "enabled": true,
        "position": {
          "x": 10.909999999999997,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dcc587",
        "type": "pin",
        "name": "S113",
        "enabled": true,
        "position": {
          "x": 8.369999999999997,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-864145",
        "type": "pin",
        "name": "S114",
        "enabled": true,
        "position": {
          "x": 5.829999999999998,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-614a70",
        "type": "pin",
        "name": "S115",
        "enabled": true,
        "position": {
          "x": 5.829999999999998,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-4d6851",
        "type": "pin",
        "name": "S116",
        "enabled": true,
        "position": {
          "x": 5.829999999999998,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-f847bd",
        "type": "pin",
        "name": "S117",
        "enabled": true,
        "position": {
          "x": 8.369999999999997,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-475689",
        "type": "pin",
        "name": "S118",
        "enabled": true,
        "position": {
          "x": 8.369999999999997,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-fca4ba",
        "type": "pin",
        "name": "S119",
        "enabled": true,
        "position": {
          "x": 10.909999999999997,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8030be",
        "type": "pin",
        "name": "S120",
        "enabled": true,
        "position": {
          "x": 10.909999999999997,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-49678a",
        "type": "pin",
        "name": "S121",
        "enabled": true,
        "position": {
          "x": 13.450000000000003,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-9ec3a8",
        "type": "pin",
        "name": "S122",
        "enabled": true,
        "position": {
          "x": 13.450000000000003,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-9376b8",
        "type": "pin",
        "name": "S123",
        "enabled": true,
        "position": {
          "x": 15.990000000000002,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-2b3afe",
        "type": "pin",
        "name": "S124",
        "enabled": true,
        "position": {
          "x": 15.990000000000002,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-b10326",
        "type": "pin",
        "name": "S125",
        "enabled": true,
        "position": {
          "x": 20.435000000000002,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-9a7e3e",
        "type": "pin",
        "name": "S126",
        "enabled": true,
        "position": {
          "x": 20.435000000000002,
          "y": 74.72
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-85ccff",
        "type": "pin",
        "name": "S127",
        "enabled": true,
        "position": {
          "x": 24.244999999999997,
          "y": 74.72
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dbf4e1",
        "type": "pin",
        "name": "S128",
        "enabled": true,
        "position": {
          "x": 24.244999999999997,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-a575cf",
        "type": "pin",
        "name": "S129",
        "enabled": true,
        "position": {
          "x": 24.244999999999997,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-60307c",
        "type": "pin",
        "name": "S130",
        "enabled": true,
        "position": {
          "x": 24.244999999999997,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-0c3591",
        "type": "pin",
        "name": "S131",
        "enabled": true,
        "position": {
          "x": 20.435000000000002,
          "y": 67.1
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-8ae96f",
        "type": "pin",
        "name": "S132",
        "enabled": true,
        "position": {
          "x": 20.435000000000002,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-c86ba0",
        "type": "pin",
        "name": "S133",
        "enabled": true,
        "position": {
          "x": 29.325000000000003,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-d7687b",
        "type": "pin",
        "name": "S134",
        "enabled": true,
        "position": {
          "x": 31.865000000000002,
          "y": 69.64
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-bec493",
        "type": "pin",
        "name": "S135",
        "enabled": true,
        "position": {
          "x": 31.865000000000002,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-014a78",
        "type": "pin",
        "name": "S136",
        "enabled": true,
        "position": {
          "x": 29.325000000000003,
          "y": 72.18
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-31ff8d",
        "type": "pin",
        "name": "S137",
        "enabled": true,
        "position": {
          "x": 29.325000000000003,
          "y": 74.72
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      },
      {
        "id": "p-dc9a27",
        "type": "pin",
        "name": "S138",
        "enabled": true,
        "position": {
          "x": 31.865000000000002,
          "y": 74.72
        },
        "solderProfileId": "sp_1f227d",
        "parentConnectorId": "c-2998a1",
        "solderProfileVariables": {
          "pinX": 0,
          "pinY": 0,
          "pinZ": 0,
          "primepos": "32",
          "primeamt": "0.4",
          "solderamt": "0.2",
          "timeonpad": "1500",
          "exspeed": "10",
          "afterburn": "200"
        }
      }
    ]
  },
  "config": {
    "configGcodes": {
      "startJob": "G28\nM302 S0; enable cold ex\nG90\nM114",
      "endJob": "M114",
      "ironOn": "",
      "ironOff": "",
      "tipChange": "G0 Z20\nM400\nG0 X0 Y0\nM400",
      "enableMotors": "M17 (enable steppers)",
      "disableMotors": "M18 (disable steppers)",
      "enableServo": "M280 P0 (read servo)\nM280 P1 (read servo)",
      "disableServo": "M282 P0 (detach servo)\nM282 P1 (detach servo)",
      "homeX": "G28 X",
      "homeY": "G28 Y",
      "homeZ": "G28 Z",
      "clean": "G90\nG0 Z23.1 F500\nM280 P1 S180; rotate head to the left\nG4 P10\nG0 X264.5 Y65.58 F900\nG4 P10\nM280 P0 S125; extend iron to 125 degrees\nM106 S100\nG0 Y41.58 F400\nM400\nM107\nG4 P10\nM280 P0 S68; retract iron to 70 deg\nG4 P10\nG0 Y1.58 F700\nM400\nM280 P0 S20\nG4 P10",
      "sandbox": ";extrude solder\n;G91\n;G0 E0.3 F20\n;G0 E-0.1\n;M400\n\n; Move just above pin\nG90\nG0 X10 Y10 Z18 F800;\nM400\n\n; Prime the tip\nG91\nM280 P0 S40; Extend\nG1 E0.2; Put some solder out (may need to tweak)\nM400\nG1 E-0.05; Retract a bit\nM400\n\n; Move down to pin\nG90\nG0 Z-3; Move down\n\nG91\nG0 Z3\nM400"
    },
    "homeToOrigin": {
      "x": 4.5,
      "y": 1.3,
      "z": 3.9
    },
    "homeLocation": {
      "x": 0,
      "y": 0,
      "z": 40
    },
    "referencePosition": {
      "x": 0,
      "y": 0,
      "z": 0
    }
  },
  "board": {
    "position": {
      "x": 0,
      "y": 0
    },
    "size": {
      "x": 67,
      "y": 80.5,
      "z": 0
    }
  }
}