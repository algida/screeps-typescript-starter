import * as roleUpgrader from "./role.upgrader";
export function run(creep: Creep): void {
    if (creep.memory.working == true && creep.carry.energy == 0) {
        creep.memory.working = false;
    } else if (creep.memory.working == false && creep.carry.energy === creep.carryCapacity) {
        creep.memory.working = true;
    }

    if (creep.memory.working === true) {
        let structures;
        let repWallHp = 0;

        const filterFunc = function (s: Structure) {
            let lookingForHits = i * 100;
            const ret = ((s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < lookingForHits);
            return ret;
        };

        for (var i = 1; i < 120; i++) {
            structures = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => filterFunc(s)
            });

            if (structures == undefined || structures.length == 0) {
                continue;
            } else {

                repWallHp = i * 100;
                break;
            }
        }
        let repTarget: Structure;
        if (structures != undefined && structures.length > 0) {
            repTarget = creep.pos.findClosestByRange(structures) as Structure;

            if (repTarget !== undefined) {
                const repairStatus = creep.repair(repTarget);
                if (repairStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repTarget);
                } else {
                    Memory.lastWallRepairedWithHP = repWallHp;
                }
            }
        } else {
            roleUpgrader.run(creep);
        }
    } else {
        const container = creep.room.storage;

        //console.log(`Conteiner ${container}`);
        if (container !== undefined && container.store.energy > 0) {
            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        }
    }
};
