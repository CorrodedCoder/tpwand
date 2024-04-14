import { world, system, Player, Vector3, ItemUseOnBeforeEvent, ItemUseOnAfterEvent, ItemUseBeforeEvent, ItemUseAfterEvent } from "@minecraft/server";
import { ModalFormData, ActionFormData, ActionFormResponse, MessageFormData } from "@minecraft/server-ui";

class wellKnownLocations {
  locationData!: { [ key: string ]: any};

  constructor(serializedData: string){
    this.locationData = serializedData ? JSON.parse(serializedData) : {"location": []};
  }

  names(): string[] {
    let names: string[] = [];
    for(const location of this.locationData.locations){
      names.push(`${location.name} (${location.x}, ${location.y}, ${location.z})`);
    }
    return names;
  }

  add(name: string, x: number, y: number, z: number) {
    this.locationData.locations.push({"name": name, "x": x, "y": y, "z": z});
  }

  remove(index: number) {
    this.locationData.locations.splice(index, 1);
  }

  get(index: number): Vector3 {
    const location = this.locationData.locations[index];
    return {x: location.x, y: location.y, z: location.z};
  }

  serialize() : string {
    return JSON.stringify(this.locationData);
  }

  count(): number {
    return this.locationData.locations.length;
  }
}

function wellKnownLocationUIAdd(locations: wellKnownLocations, player: Player){
  let form = new ModalFormData()
    .title("tpwand add well known location")
    .textField("name", "")
    .textField("x", player.location.x.toFixed(1), player.location.x.toFixed(1))
    .textField("y", player.location.y.toFixed(1), player.location.y.toFixed(1))
    .textField("z", player.location.z.toFixed(1), player.location.z.toFixed(1));
  form.show(player).then(r => {
    if(r.canceled) {
      return;
    }
    if(r.formValues){
      locations.add(r.formValues[0] as string, parseFloat(r.formValues[1] as string), parseFloat(r.formValues[2] as string), parseFloat(r.formValues[3] as string));
      world.setDynamicProperty('tpwand_locations', locations.serialize());
    }
  }).catch((e) => {
    console.error(e, e.stack);
  });
}

function wellKnownLocationUIRemove(locations: wellKnownLocations, player: Player){
  let form = new ModalFormData()
    .title("tpwand remove well known location")
    .dropdown('Location to remove:', locations.names());
  form.show(player).then(r => {
    if(r.canceled) {
      return;
    }
    if(r.formValues){
      locations.remove(r.formValues[0] as number);
      world.setDynamicProperty('tpwand_locations', locations.serialize());
    }
  }).catch((e) => {
    console.error(e, e.stack);
  });
}

function wellKnownLocationUI(player: Player) {
  let locations = new wellKnownLocations(world.getDynamicProperty('tpwand_locations') as string);
  const form = new ActionFormData()
    .title('tpwand admin')
    .body('Select action')
    .button('Add well known location');
  if(locations.count() !== 0){
    form.button('Remove well known location');
  }
  form.show(player).then((response: ActionFormResponse) => {
    switch(response.selection){
      case undefined: {
        break;
      }
      case 0: {
        wellKnownLocationUIAdd(locations, player);
        break;
      }
      case 1: {
        wellKnownLocationUIRemove(locations, player);
        break;
      }
    }
  });
}

function teleportToWorldSpawnLocationUI(player: Player) {
  const loc = world.getDefaultSpawnLocation();
  // If Y is this value then there is no default world spawn location set.
  if( loc.y === 32767){
      new ActionFormData().title("tpwand").body("Default world spawn location has not yet been set!").button("Okay").show(player);
      return;
  }
  player.sendMessage("Your wish is my command...");
  player.teleport(world.getDefaultSpawnLocation());
}

function teleportToPlayerUI(player: Player){
  const otherPlayers: Player[] = world.getAllPlayers();
  if(otherPlayers.length === 1){
    new ActionFormData().title("tpwand").body("No other players available!").button("Okay").show(player);
    return;
  }
  let playerNames: string[] = [];
  for(const other of otherPlayers){
    if( other.name !== player.name ) {
      playerNames.push(other.name);
    }
  }
  let form = new ModalFormData()
    .title("tpwand")
    .dropdown('Teleport to player', playerNames);
  form.show(player).then(r => {
    if(r.canceled) {
      return;
    }
    if(r.formValues){
      const targetPlayerName = playerNames[r.formValues[0] as number];
      const other = otherPlayers.find((op: Player) => {
        return op.name === targetPlayerName;
      });
      if(other){
        player.sendMessage("Your wish is my command...");
        player.teleport(other.location);
      }
    }
  }).catch((e) => {
    console.error(e, e.stack);
  });  
}


function teleportToWellKnownLocationUI(player: Player){
  const locations = new wellKnownLocations(world.getDynamicProperty('tpwand_locations') as string);
  if(locations.count() === 0){
    new ActionFormData().title("tpwand").body("No locations available!").button("Okay").show(player);
    return;
  }
  let form = new ModalFormData()
    .title("tpwand")
    .dropdown('Teleport to location', locations.names());
  form.show(player).then(r => {
    if(r.canceled) {
      return;
    }
    if(r.formValues){
      player.sendMessage("Your wish is my command...");
      player.teleport(locations.get(r.formValues[0] as number));
    }
  }).catch((e) => {
    console.error(e, e.stack);
  });
}

function teleportUI(player: Player) {
  const form = new ActionFormData()
    .title('tpwand')
    .body('Choose teleport action')
    .button('Teleport to world spawn point')
    .button('Teleport to player')
    .button('Teleport to well known location');
  form.show(player).then((response: ActionFormResponse) => {
    switch(response.selection){
      case undefined:{
        break;
      }
      case 0:{
        teleportToWorldSpawnLocationUI(player);
        break;
      }
      case 1:{
        teleportToPlayerUI(player);
        break;
      }
      case 2:{
        teleportToWellKnownLocationUI(player);
        break;
      }
    }
  });
}

function isTpWandAdminEvent(event: ItemUseAfterEvent|ItemUseOnAfterEvent): boolean {
  if(
    (event.itemStack.typeId === "minecraft:command_block")
    &&
    (event.itemStack.nameTag === "tpwandadmin")
  ){
    return true;
  }
  return false;
}

function isTpWandEvent(event: ItemUseAfterEvent): boolean {
  if(
    (event.itemStack.typeId === "minecraft:stick")
    &&
    (event.itemStack.nameTag === "tpwand")
  ){
    return true;
  }
  return false;
}

function registerTpWandEvents(){
  world.beforeEvents.itemUse.subscribe((event: ItemUseBeforeEvent) => {
    if(isTpWandAdminEvent(event)) {
      event.cancel = true;
      system.run(() => wellKnownLocationUI(event.source));
    }
  });
  
  world.beforeEvents.itemUseOn.subscribe((event: ItemUseOnBeforeEvent) => {
    if (isTpWandAdminEvent(event)){
        event.cancel = true;
    }
  });
  
  world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
    if (isTpWandEvent(event)){
      teleportUI(event.source);
    }
  });
}

registerTpWandEvents();

console.log("tpwand enabled...");
