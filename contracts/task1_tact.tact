import "@stdlib/deploy";

struct RecurseAns {
    foundMatch: Bool;
    matchedCell: Cell;
}

contract Task1Tact with Deployable {
    init() {}

    get fun find_branch_by_hash(hash: Int, tree: Cell): Cell {
        return self.recurseCell(tree, hash).matchedCell;
    }

    fun recurseCell(testCell: Cell, hash: Int): RecurseAns {
        let testSlice: Slice = testCell.asSlice();

        if (testCell.hash() == hash) {
            return RecurseAns{
                foundMatch: true,
                matchedCell: testCell
            };
        } else if (testSlice.refs() > 0) {
            while (!testSlice.refsEmpty()) {
                let currTry: RecurseAns = self.recurseCell(testSlice.loadRef(), hash);
                if (currTry.foundMatch) {
                    return currTry;
                }
            }
        }

        return RecurseAns{
            foundMatch: false,
            matchedCell: emptyCell()
        };
    }
}
