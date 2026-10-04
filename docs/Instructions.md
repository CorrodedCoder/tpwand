# tpwand 1.1.0

tpwand is a behavior-pack add-on for Minecraft Bedrock that makes teleporting around a shared world easier.

## Install on a Bedrock client

1. Open `tpwand.mcaddon` to import the add-on into Minecraft.
2. Create a world, or edit an existing one, and enable the tpwand behavior pack.

## Use tpwand

On your first join, tpwand is added to the last hotbar slot. If that slot is occupied, its item is moved to an empty inventory slot when possible. Use the stick named `tpwand` to open the menu.

From the menu, you can:

- Teleport to another player, a personal location, a well-known location, or the world spawn point.
- Add or remove your personal locations.
- Choose buttons or a dropdown for teleport destinations in **Display options**.
- Enable or disable automatic hotbar addition in **Display options**. It is enabled by default.

### Configure well-known locations

Players with operator permissions can choose **Configure well-known locations** from the tpwand menu. Alternatively, use the legacy command-block method:

1. Rename a command block `tpwandadmin` using an anvil.
2. Use the renamed command block to open the configuration menu.

The menu lets you add locations (starting at your current position) and remove existing ones. Players can then teleport to these locations from their own tpwand menu.

## Install on a Bedrock server

1. Extract `tpwand.mcaddon`. This produces `tpwand_bp.mcpack`.
2. Extract `tpwand_bp.mcpack`.
3. Copy the extracted behavior pack into a `tpwand` directory under `development_behavior_packs`. The resulting structure should include:

   ```text
   development_behavior_packs/tpwand/manifest.json
   development_behavior_packs/tpwand/pack_icon.png
   development_behavior_packs/tpwand/scripts/main.js
   ```

4. In the directory for your world (usually `worlds/Bedrock level`), create or update `world_behavior_packs.json`. Use the `uuid` and `version` from the behavior pack's `header` in `manifest.json`. This example is for tpwand 1.1.0:

   ```json
   [
     {
       "pack_id": "65a00286-c671-4970-bee0-5199df8d34d4",
       "version": [1, 1, 0]
     }
   ]
   ```

5. Restart the server. A successful load includes this message in the server log:

   ```text
   [Scripting] tpwand enabled...
   ```
