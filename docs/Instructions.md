# tpwand 1.0.0

## Installing on a Bedrock client

To install you should just be able to unpack the zip file and double click on "tpwand.mcaddon". This should launch Minecraft and install the add-on.

Then either create a new world and enable this behaviour pack add-on or just enable it in an existing world. It shouldn't cause any trouble, but I could not swear to it.

## Using the addon

Create a stick and using an anvil name it "tpwand". Right clicking on it will cause the UI to pop up allowing you to:

1) Teleport to the world spawn point.
2) Teleport to the location of other players in your multiplayer world.
3) Teleport to a well known location (previously created by an admin).

## Testing the admin functionality

Create a command block and using an anvil name it "tpwandadmin". Right clicking on it will cause the UI to pop up allowing you to:

1) Add a well known location (it will default to your current location but you may change this).
2) Remove a well known location.

Once a well known location has been added a user with a tpwand stick will be able to teleport to any of the well known locations.

## Installing on a Bedrock server

To install this on a Bedrock server takes a little more work, but roughly:

1) Using some unzip tool extract the contents of "tpwand.mcaddon", this will produce the file "tpwand.bp.mcpack".
2) Using some unzip tool extract the contents of "tpwand.bp.mcpack".
3) In your bedrock server under "development_behavior_packs" create a subdirectory called "tpwand" and copy the extracted contents there such that your layout looks like:
    development_behavior_packs\tpwand\manifest.json
    development_behavior_packs\tpwand\pack_icon.png
    development_behavior_packs\tpwand\scripts
    development_behavior_packs\tpwand\scripts\main.js
4) Run your server and after it has started shut it down.
5) Open "valid_known_packs.json" in the root of your server directory and you should now see an entry at the top for tpwand. Make a note of the uuid and version.
6) Under your "worlds\Bedrock level" directory (you might have renamed "Bedrock level" or have more than one world there) you should create or edit a file called "world_behavior_packs.json". It should include the following:
        [
            {
                "pack_id" : "65a00286-c671-4970-bee0-5199df8d34d4",
                "version" : [ 1, 0, 0 ]
            }
        ]
    The `pack_id` should match the uuid you noted earlier and the version should also match. At the time of typing, the above is correct.

7) Restart your server. If all went well you should see the following in your server log:

        [Scripting] tpwand enabled...
