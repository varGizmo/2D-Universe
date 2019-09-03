# Descriptions

`area.ts`  
Functions to add or remove mobs from areas

`character.ts`  
Function to get health info

`checkpoint.ts`  
Create the checkpoint of your player

`chest.ts`  
Functions to generate chest content

`chestarea.ts`  
Put chests on specific areas

`databasehandler.ts`  
sets redis-server information as well as other facts to store in the
database

`entity.ts`  
creates mobs in the world

`format.ts`  
sets if a function is either a string or a number (is chest open? 0 or
1 (number). what weapon are you wielding sword2 (string))

`formulas.ts`  
formulas for weapon damage and defense damage

`guild.ts`  
Functions how the guild works - guild invite, how many members are
online etc

`item.ts`  
Handles how items on the ground starts blinking and then despawns if
left untouched

lib/
libraries used by the server

`main.ts`  
Main file, for starting up. Starts database connection, world server etc

`map.ts`  
Initializes the map (as in the world you play in, not a mini-map)

`message.ts`  
Dictates which messages are sent to the client

`metrics.ts`  
Shows some statistics about players in-game. Really poor at the moment.

`mob.ts`  
Functions to have a mob generate hate for a player, drop items or return
to his spawn position

`mobarea.ts`  
Creates the area where the mob spawns, where it roams etc

`npc.ts`  
Functions to have NPCs standing on location x y.

`player.ts`  
Functions to get information about the players character (items etc)

`properties.ts`  
Contains properties of creatures (how much hp and what they drop)

`utils.ts`  
Functions for calculations (distance to something, randomization etc)

`worldserver.ts`  
This loads up things such as mobs, chests, pushes info to client etc

`ws.ts`  
This is the websocket
