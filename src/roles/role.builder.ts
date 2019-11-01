
export function run(creep: Creep): void {
    if (creep.memory.working == true && creep.carry.energy == 0) {
        creep.memory.working = false;
    } else if (creep.memory.working == false && creep.carry.energy === creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working === true) {
        const construction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (construction != undefined) {
            if (creep.build(construction) == ERR_NOT_IN_RANGE) {
                creep.moveTo(construction);
            }
        }
        // else {
        //     roleUpgrader.run(creep);
        // }
    } else {

        const container = creep.room.storage;

        //console.log(`Conteiner ${container}`);
        if (container != undefined && container.store.energy > 0) {
            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        }
        const sources = creep.room.find(FIND_SOURCES);
        if (sources === undefined || sources.length == 0)
            return;
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
};
