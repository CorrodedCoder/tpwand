import {
  world,
  system,
  Player,
  Vector3,
  ItemUseOnBeforeEvent,
  ItemUseOnAfterEvent,
  ItemUseBeforeEvent,
  ItemUseAfterEvent,
} from "@minecraft/server";
import { ModalFormData, ActionFormData, ActionFormResponse, MessageFormData } from "@minecraft/server-ui";

const tpWandDynamicPropertyName = "tpwand_locations";

const alphaSorter = (a: string, b: string) => {
  // This is not very pretty, but when I tried it every other way it
  // just kept sorting based on case.
  return a.toLowerCase().localeCompare(b.toLowerCase());
};

function displayOptionsGet(player: Player) {
  const displayOptionsProperty = player.getDynamicProperty("tpwand_options") as string;
  return displayOptionsProperty
    ? JSON.parse(displayOptionsProperty)
    : { player_use_dropdown: false, personal_use_dropdown: false, global_use_dropdown: false };
}

function displayOptionsSet(player: Player, displayOptions: any) {
  player.setDynamicProperty("tpwand_options", JSON.stringify(displayOptions));
}

function displayOptionsUI(player: Player) {
  let displayOptions = displayOptionsGet(player);
  let form = new ModalFormData()
    .title("tpwand display options")
    .toggle("Player teleport use dropdown", displayOptions.player_use_dropdown)
    .toggle("Personal locations use dropdown", displayOptions.personal_use_dropdown)
    .toggle("Well known locations use dropdown", displayOptions.global_use_dropdown);
  form.show(player).then((r) => {
    if (r.canceled) {
      return;
    }
    if (r.formValues) {
      displayOptions.player_use_dropdown = r.formValues[0] as boolean;
      displayOptions.personal_use_dropdown = r.formValues[1] as boolean;
      displayOptions.global_use_dropdown = r.formValues[2] as boolean;
      displayOptionsSet(player, displayOptions);
    }
  });
}

function formButtonsOrDropdown(
  player: Player,
  options: string[],
  useDropdown: boolean,
  titleText: string,
  descriptionText: string,
  emptyText: string,
  action: (index: number) => void
) {
  if (options.length === 0) {
    new ActionFormData().title(titleText).body(emptyText).button("Okay").show(player);
    return;
  }
  if (useDropdown) {
    const form = new ModalFormData().title(titleText).dropdown(descriptionText, options);
    form
      .show(player)
      .then((r) => {
        if (r.canceled) {
          return;
        }
        if (r.formValues) {
          action(r.formValues[0] as number);
        }
      })
      .catch((e) => {
        console.error(e, e.stack);
      });
  } else {
    const form = new ActionFormData().title(titleText).body(descriptionText);
    for (const name of options) {
      form.button(name);
    }
    form.show(player).then((response: ActionFormResponse) => {
      if (response.selection !== undefined) {
        action(response.selection);
      }
    });
  }
}

class LocationRegistry {
  locationData!: { [key: string]: any };

  constructor(serializedData: string) {
    this.locationData = serializedData ? JSON.parse(serializedData) : { locations: [] };
  }

  names(): string[] {
    let names: string[] = [];
    for (const location of this.locationData.locations) {
      names.push(`${location.name} (${location.x}, ${location.y}, ${location.z})`);
    }
    return names;
  }

  add(name: string, x: number, y: number, z: number) {
    this.locationData.locations.push({ name: name, x: x, y: y, z: z });
    this.locationData.locations.sort((a: any, b: any) => {
      return alphaSorter(a.name, b.name);
    });
  }

  remove(index: number) {
    this.locationData.locations.splice(index, 1);
  }

  get(index: number): Vector3 {
    const location = this.locationData.locations[index];
    return { x: location.x, y: location.y, z: location.z };
  }

  serialize(): string {
    return JSON.stringify(this.locationData);
  }

  count(): number {
    return this.locationData.locations.length;
  }
}

interface SerializedLocationRegistry extends LocationRegistry {
  save(): void;
}

class WellKnownLocationRegistry extends LocationRegistry implements SerializedLocationRegistry {
  propertyName!: string;
  constructor(propertyName: string) {
    super(world.getDynamicProperty(propertyName) as string);
    this.propertyName = propertyName;
  }

  save(): void {
    world.setDynamicProperty(this.propertyName, this.serialize());
  }
}

class PersonalLocationRegistry extends LocationRegistry implements SerializedLocationRegistry {
  player!: Player;
  propertyName!: string;
  constructor(player: Player, propertyName: string) {
    super(player.getDynamicProperty(propertyName) as string);
    this.player = player;
    this.propertyName = propertyName;
  }

  save(): void {
    this.player.setDynamicProperty(this.propertyName, this.serialize());
  }
}

function locationRegistryUIAdd(locations: SerializedLocationRegistry, player: Player) {
  let form = new ModalFormData()
    .title("tpwand add location")
    .textField("name", "")
    .textField("x", player.location.x.toFixed(1), player.location.x.toFixed(1))
    .textField("y", player.location.y.toFixed(1), player.location.y.toFixed(1))
    .textField("z", player.location.z.toFixed(1), player.location.z.toFixed(1));
  form
    .show(player)
    .then((r) => {
      if (r.canceled) {
        return;
      }
      if (r.formValues) {
        const x = Number(r.formValues[1]);
        const y = Number(r.formValues[2]);
        const z = Number(r.formValues[3]);
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          new ActionFormData().title("tpwand").body("Invalid number format specified!").button("Okay").show(player);
          return;
        }
        locations.add(r.formValues[0] as string, x, y, z);
        locations.save();
      }
    })
    .catch((e) => {
      console.error(e, e.stack);
    });
}

function locationRegistryUIRemove(locations: SerializedLocationRegistry, player: Player) {
  let form = new ModalFormData().title("tpwand remove location").dropdown("Location to remove:", locations.names());
  form
    .show(player)
    .then((r) => {
      if (r.canceled) {
        return;
      }
      if (r.formValues) {
        locations.remove(r.formValues[0] as number);
        locations.save();
      }
    })
    .catch((e) => {
      console.error(e, e.stack);
    });
}

function locationRegistryUI(player: Player, locations: SerializedLocationRegistry) {
  const form = new ActionFormData()
    .title("tpwand manage locations")
    .body("Select action")
    .button("Add well known location");
  if (locations.count() !== 0) {
    form.button("Remove well known location");
  }
  form.show(player).then((response: ActionFormResponse) => {
    switch (response.selection) {
      case undefined: {
        break;
      }
      case 0: {
        locationRegistryUIAdd(locations, player);
        break;
      }
      case 1: {
        locationRegistryUIRemove(locations, player);
        break;
      }
    }
  });
}

function teleportToWorldSpawnLocationUI(player: Player) {
  const loc = world.getDefaultSpawnLocation();
  // If Y is this value then there is no default world spawn location set.
  if (loc.y === 32767) {
    new ActionFormData()
      .title("tpwand")
      .body("Default world spawn location has not yet been set!")
      .button("Okay")
      .show(player);
    return;
  }
  player.sendMessage("Your wish is my command...");
  player.teleport(world.getDefaultSpawnLocation());
}

function teleportToPlayerUI(player: Player, useDropdown: boolean) {
  const otherPlayers: Player[] = world.getAllPlayers();
  let playerNames: string[] = [];
  for (const other of otherPlayers) {
    if (other.name !== player.name) {
      playerNames.push(other.name);
    }
  }
  playerNames.sort(alphaSorter);
  formButtonsOrDropdown(
    player,
    playerNames,
    useDropdown,
    "tpwand",
    "Teleport to player",
    "No other players available!",
    (index: number) => {
      const targetPlayerName = playerNames[index];
      const other = otherPlayers.find((op: Player) => {
        return op.name === targetPlayerName;
      });
      if (other) {
        player.sendMessage("Your wish is my command...");
        player.teleport(other.location);
      }
    }
  );
}

function teleportToWellKnownLocationUI(player: Player, locations: LocationRegistry, useDropdown: boolean) {
  formButtonsOrDropdown(
    player,
    locations.names(),
    useDropdown,
    "tpwand",
    "Teleport to location",
    "No locations available!",
    (index: number) => {
      player.sendMessage("Your wish is my command...");
      player.teleport(locations.get(index));
    }
  );
}

function teleportUI(player: Player) {
  const form = new ActionFormData()
    .title("tpwand")
    .body("Choose teleport action")
    .button("Teleport to player")
    .button("Teleport to personal known location")
    .button("Teleport to well known location")
    .button("Teleport to world spawn point")
    .button("Configure personal known locations")
    .button("Display options");
  form.show(player).then((response: ActionFormResponse) => {
    switch (response.selection) {
      case undefined: {
        break;
      }
      case 0: {
        teleportToPlayerUI(player, displayOptionsGet(player).player_use_dropdown);
        break;
      }
      case 1: {
        teleportToWellKnownLocationUI(
          player,
          new PersonalLocationRegistry(player, tpWandDynamicPropertyName),
          displayOptionsGet(player).personal_use_dropdown
        );
        break;
      }
      case 2: {
        teleportToWellKnownLocationUI(
          player,
          new WellKnownLocationRegistry(tpWandDynamicPropertyName),
          displayOptionsGet(player).global_use_dropdown
        );
        break;
      }
      case 3: {
        teleportToWorldSpawnLocationUI(player);
        break;
      }
      case 4: {
        locationRegistryUI(player, new PersonalLocationRegistry(player, tpWandDynamicPropertyName));
        break;
      }
      case 5: {
        displayOptionsUI(player);
        break;
      }
    }
  });
}

function isTpWandAdminEvent(event: ItemUseAfterEvent | ItemUseOnAfterEvent): boolean {
  if (event.itemStack.typeId === "minecraft:command_block" && event.itemStack.nameTag === "tpwandadmin") {
    return true;
  }
  return false;
}

function isTpWandEvent(event: ItemUseAfterEvent): boolean {
  if (event.itemStack.typeId === "minecraft:stick" && event.itemStack.nameTag === "tpwand") {
    return true;
  }
  return false;
}

function registerTpWandEvents() {
  world.beforeEvents.itemUse.subscribe((event: ItemUseBeforeEvent) => {
    if (isTpWandAdminEvent(event)) {
      event.cancel = true;
      system.run(() => locationRegistryUI(event.source, new WellKnownLocationRegistry(tpWandDynamicPropertyName)));
    }
  });

  world.beforeEvents.itemUseOn.subscribe((event: ItemUseOnBeforeEvent) => {
    if (isTpWandAdminEvent(event)) {
      event.cancel = true;
    }
  });

  world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
    if (isTpWandEvent(event)) {
      teleportUI(event.source);
    }
  });
}

registerTpWandEvents();

console.log("tpwand enabled...");
