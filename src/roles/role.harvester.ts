import * as roleBuilder from "./role.builder";
export function run(creep: Creep): void {
    //console.log(` Test globalni promenne : ${ColorEnum.GREEN}`);
    if (creep.memory.working == true && creep.carry.energy == 0) {
        creep.memory.working = false;
    } else if (creep.memory.working == false && creep.carry.energy === creep.carryCapacity) {
        creep.memory.working = true;
    }

    if (creep.memory.working === true) {
        const structure: OwnedStructure | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                s.structureType == STRUCTURE_EXTENSION ||
                s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity
        });
        if (structure === null) {
            const storage: StructureStorage | undefined = creep.room.storage;
            if (storage !== undefined) {
                if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                }
            } else {
                roleBuilder.run(creep);
            }

            return;
        } else {
            if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
            return;
        }


    } else {
        var mrtvoly = creep.room.find(FIND_TOMBSTONES, {
            filter: (d) => d.store.energy >= 10
        });
        let pickupMrtvola;
        if (mrtvoly.length) {
            pickupMrtvola = creep.withdraw(mrtvoly[0], RESOURCE_ENERGY);
            //console.log(`Zkusime zvednout energy z mrtvoly ret code : ${pickupMrtvola}`);


            if (mrtvoly.length > 0 && (pickupMrtvola == ERR_NOT_IN_RANGE)) {
                creep.moveTo(mrtvoly[0]);
                return;
            }
            return;
        }

        var dropenergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (d) => d.resourceType == RESOURCE_ENERGY && d.amount >= 10
        });
        let pickupDropped;
        if (dropenergy.length > 0) {
            pickupDropped = creep.pickup(dropenergy[0]);
            console.log(`Zkusime zvednout energy ret code : ${pickupDropped}`);

            if (pickupDropped == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropenergy[0]);
                return;
            }
            return;
        }


        const containers: StructureContainer[] | null = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store.energy > 0)
        }).map(x => x as StructureContainer);
        if (containers !== undefined && containers.length > 0) {
            let moreSources: StructureContainer = containers[0];
            let lastEnergy: number = 0;
            for (const cont of containers) {

                if (lastEnergy > cont.store.energy) {
                    moreSources = cont;
                    lastEnergy = moreSources.store.energy;
                }
            }
            if (creep.withdraw(moreSources, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                creep.moveTo(moreSources);
        }
        const sources = creep.room.find(FIND_SOURCES);
        if (sources.length > 0) {
            let gSource: Source = sources[0];
            for (const source of sources) {
                if (gSource.energy > source.energy) {
                    continue;
                }
                gSource = source;
            }
            if (creep.harvest(gSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(gSource);
            }
        }
    }
};
