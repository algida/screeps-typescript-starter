import { ErrorMapper } from "lib/ErrorMapper";
import { log } from "lib/logger/log";
import * as roleHarvester from "./roles/role.harvester";
import * as roleUpgrader from "./roles/role.upgrader";
import * as roleBuilder from "./roles/role.builder";
import * as roleRepairer from "./roles/role.repairer";
import * as roleWallRepairer from "./roles/role.wallRepair";
import * as roleMiner from "./roles/role.miner";
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  log.debug(`Current game tick is ${Game.time}`);
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
  for (const i in Game.creeps) {
    const creep = Game.creeps[i];

    if (creep.memory.role == undefined)
      continue;

    //console.log(`Creep ${creep.name} ${creep.memory.role}`);
    switch (creep.memory.role) {
      case 'Harvester':
        roleHarvester.run(creep);
        break;
      case 'Upgrader':
        roleUpgrader.run(creep);
        break;
      case 'Builder':
        roleBuilder.run(creep);
        break;
      case 'Repairer':
        roleRepairer.run(creep);
        break;
      case 'WallRepairer':
        roleWallRepairer.run(creep);
        break;
      case 'Miner':
        roleMiner.run(creep);
        break;
      default:
        break;
    }
  }

  const towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType == STRUCTURE_TOWER
  }).map(s => s as StructureTower);
  for (let tower of towers) {
    const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target != undefined) {
      tower.attack(target);
    }
    const myTarget = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: s => s.hits < s.hitsMax
    });
    if (myTarget != undefined) {
      console.log(`Healing ${myTarget.name}`);
      tower.heal(myTarget);
    }
  }

  const minHarvesters = 2;
  const minUpgraders = 3;
  const minBuilders = 0;
  const minRepairers = 1;
  const minWallRepairers = 1;
  const minMiners = 2;

  const numHarvesters = _.sum(Game.creeps, (c) => c.memory.role === 'Harvester' ? 1 : 0);
  const numBuilders = _.sum(Game.creeps, (c) => c.memory.role === 'Builder' ? 1 : 0);
  const numUpgraders = _.sum(Game.creeps, (c) => c.memory.role === 'Upgrader' ? 1 : 0);
  const numRepairesrs = _.sum(Game.creeps, (c) => c.memory.role === 'Repairer' ? 1 : 0);
  const numWallRepairesrs = _.sum(Game.creeps, (c) => c.memory.role === 'WallRepairer' ? 1 : 0);
  const numMiners = _.sum(Game.creeps, (c) => c.memory.role === 'Miner' ? 1 : 0);

  let createRole;
  let energy = 1300;
  const spawn = Game.spawns.Spawn1;
  let energyInStore: number = 0;
  if (spawn != null) {
    const storage = spawn.room.storage;
    if (storage != null)
      energyInStore = storage.store.energy;
  }
  log.debug(`Mame uskladneno ${energyInStore} ve skladu`);
  if (numHarvesters == 0) {
    createRole = 'Harvester';
    energy = Game.spawns.Spawn1.room.energyAvailable;
  } else if (numMiners < minMiners) {
    createRole = 'Miner';
  } else if (numHarvesters < minHarvesters) {
    createRole = 'Harvester';
  } else if (numUpgraders < minUpgraders) {
    createRole = 'Upgrader';
  } else if ( /*energyInStore > 10000 &&*/ numRepairesrs < minRepairers) {
    createRole = 'Repairer';
  } else if ( /*energyInStore > 10000 &&*/ numWallRepairesrs < minWallRepairers) {
    createRole = 'WallRepairer';
  } else if (numBuilders < minBuilders) {
    createRole = 'Builder';
  }

  if (createRole != undefined) {
    let ret = spawnCustomCreep(Game.spawns.Spawn1, energy, createRole);
    if (ret == OK) {
      console.log(`Harvesteru ${numHarvesters} `);
      console.log(`Mineru ${numMiners} `);
      console.log(`Builderu ${numBuilders} `);
      console.log(`Upgraderu ${numUpgraders} `);
      console.log(`Reapireru ${numRepairesrs} `);
      console.log(`WallReapireru ${numWallRepairesrs} `);
    }
  }

  function spawnCustomCreep(spawn: StructureSpawn, energy: number, roleName: string) {
    let body: BodyPartConstant[] = [];
    if (roleName === "Miner") {
      body = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE];
    } else if (roleName === "Harvester") {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    } else {
      let numOfParts = Math.floor(energy / 200);

      for (let i = 0; i < numOfParts; i++) {
        body.push(WORK);
      }
      for (let i = 0; i < numOfParts; i++) {
        body.push(CARRY);
      }
      for (let i = 0; i < numOfParts; i++) {
        body.push(MOVE);
      }
    }

    let name = `${roleName}_${Game.time.toString()}`;
    let ret = spawn.spawnCreep(body, name, {
      memory: { working: false, role: roleName, room: spawn.room.name, containerId: "", sourceId: "" }
    });
    if (ret == OK) {
      console.log(`Spawning ${name}`);
    }
    return ret;
  };

});
