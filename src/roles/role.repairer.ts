import * as roleBuilder from "./role.builder";

export function run(creep: Creep): void {
    if (creep.memory.working == true && creep.carry.energy == 0) {
        creep.memory.working = false;
    } else if (creep.memory.working == false && creep.carry.energy === creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working == true) {
        const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) && s.hits < s.hitsMax
        });
        if (structure != undefined) {
            if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
        } else {
            roleBuilder.run(creep);
        }
    } else {
        const container = creep.room.storage;

        //console.log(`Conteiner ${container}`);
        if (container != undefined && container.store.energy > 0) {
            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        }
    }

};
