# tpwand

## Description

tpwand is a Minecraft Bedrock add-on for multi-player games or Bedrock servers to make player teleporting more convenient.

It can be used as part of the normal Minecraft Bedrock client or as part of the Minecraft Bedrock Dedicated Server.

## Demonstration

A demonstration of the features can be seen at https://youtu.be/TatywdgBI-8

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

## Building and development

This project uses a lightweight `esbuild`-based build script instead of the older Microsoft scripting starter workflow.

For local development, use:

- `npm install`
- `npm run build` to generate the bundled script in `dist/scripts`
- `npm run dev` to watch for source changes and rebuild automatically
- `npm run mcaddon` to produce the final Bedrock package at `dist/packages/tpwand.mcaddon`

For end users wanting to experiment in a single player world, import the generated `.mcaddon` file from `dist/packages/tpwand.mcaddon`.
