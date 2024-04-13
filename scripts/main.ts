import { world, system, Player, Vector3, ItemUseOnBeforeEvent, ItemUseBeforeEvent, ItemUseAfterEvent } from "@minecraft/server";
import { ModalFormData, ActionFormData, ActionFormResponse, MessageFormData } from "@minecraft/server-ui";

world.beforeEvents.itemUse.subscribe((event: ItemUseBeforeEvent) => {
  if (event.itemStack.typeId === "minecraft:command_block"){
    if(event.itemStack.nameTag === "tpwandadmin" ) {
      event.cancel = true;
      system.run(() => {
        const wellKnownLocationsProperty: string = world.getDynamicProperty('tpwand_locations') as string;
        let wellKnownLocations = wellKnownLocationsProperty ? JSON.parse(wellKnownLocationsProperty) : {"locations": []};
        let locationNames: string[] = [];
        for(const wellKnownLocation of wellKnownLocations.locations){
          locationNames.push(`${wellKnownLocation.name} (${wellKnownLocation.x}, ${wellKnownLocation.y}, ${wellKnownLocation.z})`);
        }
        const player: Player = event.source;
        const initForm = new ActionFormData()
          .title('tpwand admin')
          .body('Select action')
          .button('Add well known location');
        if(wellKnownLocations.locations.length !== 0){
          initForm.button('Remove well known location');
        }
        initForm.show(player).then((response: ActionFormResponse) => {
          switch(response.selection){
            case undefined: {
              break;
            }
            case 0: {
              let form = new ModalFormData()
                .title("tpwand add well known location")
                .textField("name", "")
                .textField("x", player.location.x.toFixed(1), player.location.x.toFixed(1))
                .textField("y", player.location.y.toFixed(1), player.location.y.toFixed(1))
                .textField("z", player.location.z.toFixed(1), player.location.z.toFixed(1));
              form.show(event.source).then(r => {
                if(r.canceled) {
                  return;
                }
                if(r.formValues){
                  wellKnownLocations.locations.push({"name": r.formValues[0], "x": Number(r.formValues[1]), "y": Number(r.formValues[2]), "z": Number(r.formValues[3])});
                  world.setDynamicProperty('tpwand_locations', JSON.stringify(wellKnownLocations));
                }
              }).catch((e) => {
                console.error(e, e.stack);
              });
              break;
            }
            case 1: {
              let form = new ModalFormData()
                .title("tpwand remove well known location")
                form.dropdown('Location to remove:', locationNames);
              form.show(event.source).then(r => {
                if(r.canceled) {
                  return;
                }
                if(r.formValues){
                  const index = Number(r.formValues[0]);
                  wellKnownLocations.locations.splice(index, 1);
                  world.setDynamicProperty('tpwand_locations', JSON.stringify(wellKnownLocations));
                }
              }).catch((e) => {
                console.error(e, e.stack);
              });
              break;
            }
          }
        });
      });
    }
  }
});

world.beforeEvents.itemUseOn.subscribe((event: ItemUseOnBeforeEvent) => {
  if (event.itemStack.typeId === "minecraft:command_block"){
    if(event.itemStack.nameTag === "tpwandadmin" ) {
      event.cancel = true;
    }
  }
});

world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
  if (event.itemStack.typeId === "minecraft:stick"){
    if(event.itemStack.nameTag === "tpwand" ) {
      const player: Player = event.source;
      const initForm = new ActionFormData()
        .title('tpwand')
        .body('Choose the player you would like to teleport to')
        .button('Teleport to world spawn point')
        .button('Teleport to another players location')
        .button('Teleport to well known location');
      initForm.show(player).then((response: ActionFormResponse) => {
        switch(response.selection){
          case undefined:{
            break;
          }
          case 0:{
            const loc = world.getDefaultSpawnLocation();
            // If Y is this value then there is no default world spawn location set.
            if( loc.y !== 32767){
              player.sendMessage("Your wish is my command...");
              player.teleport(world.getDefaultSpawnLocation());
            }
            break;
          }
          case 1:{
            const other_players: Player[] = world.getAllPlayers();
            if(other_players.length === 1){
              new ActionFormData().title("tpwand").body("No other players available!").button("Okay").show(player);
              return;
            }
            let form = new ModalFormData()
              .title("tpwand");
            let player_names: string[] = [];
            for(const other of other_players){
              if( other.name !== player.name ) {
                player_names.push(other.name);
              }
            }
            form.dropdown('Teleport to player', player_names);
            form.show(event.source).then(r => {
              if(r.canceled) {
                return;
              }
              if(r.formValues){
                const index = Number(r.formValues[0]);
                const other = other_players.find((op: Player) => {
                  return op.name === player_names[index];
                });
                if(other){
                  player.sendMessage("Your wish is my command...");
                  player.teleport(other.location);
                }
              }
            }).catch((e) => {
              console.error(e, e.stack);
            });
            break;
          }
          case 2:{
            const wellKnownLocationsProperty: string = world.getDynamicProperty('tpwand_locations') as string;
            const wellKnownLocations = wellKnownLocationsProperty ? JSON.parse(wellKnownLocationsProperty) : {"locations": []};
            if(wellKnownLocations.locations.length === 0){
              new ActionFormData().title("tpwand").body("No locations available!").button("Okay").show(player);
              return;
            }
            let locationNames: string[] = [];
            for(const wellKnownLocation of wellKnownLocations.locations){
              locationNames.push(`${wellKnownLocation.name} (${wellKnownLocation.x}, ${wellKnownLocation.y}, ${wellKnownLocation.z})`);
            }
            let form = new ModalFormData()
              .title("tpwand")
              .dropdown('Teleport to location', locationNames);
            form.show(event.source).then(r => {
              if(r.canceled) {
                return;
              }
              if(r.formValues){
                const index = Number(r.formValues[0]);
                const wellKnownLocation = wellKnownLocations.locations[index];
                const location: Vector3 = {x: wellKnownLocation.x, y: wellKnownLocation.y, z: wellKnownLocation.z};
                player.sendMessage("Your wish is my command...");
                player.teleport(location);
              }
            }).catch((e) => {
              console.error(e, e.stack);
            });
            break;
          }
        }
      });        
    }
  }
});

console.log("tpwand enabled...");
