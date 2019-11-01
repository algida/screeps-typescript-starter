import * as roleBuilder from "./role.builder";
export function run(creep: Creep): void {

    if (creep.memory.working == true && creep.carry.energy == 0) {
        creep.memory.working = false;
    } else if (creep.memory.working == false && creep.carry.energy === creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working === true) {
        const controller = creep.room.controller;

        if (controller != null) {
            if (controller.ticksToDowngrade > 5000) {
                const constSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: s => s.progress < s.progressTotal
                });
                if (constSites !== undefined && constSites.length != 0) {
                    roleBuilder.run(creep);
                    return;
                }

            }

            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
    } else {
        const container = creep.room.storage;

        //console.log(`Conteiner ${container}`);
        if (container != undefined && container.store.energy > 0) {
            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        } else {
            const containers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store.energy > 0)
            });
            if (containers !== undefined && containers.length > 0) {

                if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(containers[0]);
            }
        }
    }

};
