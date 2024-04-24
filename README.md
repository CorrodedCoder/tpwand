# tpwand

## Description

tpwand is a Minecraft Bedrock add-on for multi-player games or Bedrock servers to make player teleporting more convenient.

It can be used as part of the normal Minecraft Bedrock client or as part of the Minecraft Bedrock Dedicated Server.

## Demonstration

A demonstration of the features can be seen at https://youtu.be/bM5eFTiljy4

## Features

A user interface allowing you to:

1. Teleport to another players location by selecting their name.
2. Teleport to locations previously created by yourself.
3. Teleport to well known locations as previously created by an admin.
4. Teleport to the current world spawn point.
5. User UI for in game configuration of named locations.
6. Admin only UI for in game configuration of well known locations.

See [instructions](docs/Instructions.md) for further details of how to install and use the add-on.

## Pre-requisites to build the add-on

[Install Node](https://nodejs.org/en)

## Building the add-on

From a command prompt/terminal browse to the repository and run:

1. `npm install`
2. `npm run mcaddon`

The add-on should be generated as dist/packages/tpwand.mcaddon

Note: On Windows, you might need to run the following command under PowerShell in the repository directory before the NPM steps:
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

## Developer convenience

The infrastructure to build/deploy this add-on was taken from Microsoft's minecraft-scripting-samples and so the [instructions for it](https://github.com/microsoft/minecraft-scripting-samples/blob/main/ts-starter/README.md) may be used here as well.

Specifically you can also run the following command to on Windows to have the add-on build and deliver to your Minecraft client:
`npm run local-deploy`

This is a better option than creating and installing the mcaddon file directly if you plan to be developing with it as it will update the add-on. If you're going to do this and have already installed the add-on using the mcaddon file then you may want to remove that from your Minecraft client first before using the local deploy.
