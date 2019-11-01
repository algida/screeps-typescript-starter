export function run(creep: Creep): void {
    if (creep.memory.working == false) {
        if (creep.memory.containerId === "") {
            //Musime se presunout na prazdny container
            let structures = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
            });

            for (const structure of structures) {

                if (structure !== undefined) {
                    const creeps = creep.room.find(FIND_MY_CREEPS, { filter: s => s.memory.role == "Miner" && s.memory.containerId == structure.id })
                    // const creeps = structure.pos.findInRange(FIND_MY_CREEPS, 1, {
                    //     filter: s => s.memory.role === "Miner" && s.memory.containerId == structure.id
                    // });

                    if (creeps.length == 0) {
                        creep.memory.containerId = structure.id;
                        creep.moveTo(structure.pos.x, structure.pos.y);
                        break;
                    }
                }
            }
        } else {
            const container = Game.getObjectById(creep.memory.containerId) as StructureContainer;

            if (creep.pos.x !== container.pos.x || creep.pos.y !== container.pos.y) {

                creep.moveTo(container.pos.x, container.pos.y);
            } else {
                creep.memory.working = true;
            }

        }

    } else {
        if (creep.memory.sourceId === "") {
            const source = creep.pos.findClosestByRange(FIND_SOURCES) as Source;
            if (source === undefined)
                return;
            //Sme na kontejneru, tak budeme kopat
            creep.memory.sourceId = source.id;
        }
        if (creep.memory.sourceId !== "") {
            const sc = Game.getObjectById(creep.memory.sourceId) as Source;
            creep.harvest(sc);

        }
    }

};
