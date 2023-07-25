import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin";

async function main () {
    /**
     * Returns true if the block tree is empty
     */
    async function walk(block: BlockEntity) {
        if (!block.children) {
            // not loaded
            return false;
        }

        const blocks: Array<{
            block: BlockEntity;
            result: boolean
        }> = [];

        for (const subBlock of block.children) {
            blocks.push({
                block: <BlockEntity> subBlock,
                result: await walk(<BlockEntity> subBlock)
            })
        }

        if (blocks.every(x => x.result) && block.content === '') {
            return true; // need caller to remove
        }
        else {
            for (const subBlock of blocks.filter(x => x.result).map(x => x.block)) {
                await logseq.Editor.removeBlock(subBlock.uuid);
            }
            return false;
        }
    }

    logseq.beforeunload(
        logseq.Editor.registerBlockContextMenuItem('Remove empty blocks', async (e) => {
            const block = await logseq.Editor.getBlock(e.uuid, { includeChildren: true });
            if (block) {
                await walk(block);
            }
        }) as any
    );
}

if (typeof logseq !== 'undefined') {
    logseq.ready(main).catch(console.error);
}
