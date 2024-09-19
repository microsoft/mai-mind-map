import { Observable, mutable } from './observable';
import { $InvDoc } from './ot-doc/document';

export type DocumentEngine<Cp, Op> = {
  model: Observable<Cp>;
  apply: (updater: (cp: Cp) => Op | undefined) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export const documentEngine = <Cp, Op>(
  { initial, compose, invert, identity }: $InvDoc<Cp, Op>,
  initialCp?: Cp,
): DocumentEngine<Cp, Op> => {
  const undoStack: Op[] = [];
  const redoStack: Op[] = [];
  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  const {} = documentEngine;
  const { update, ...observable } = mutable(initialCp ?? initial());
  const apply_ = (updater: (cp: Cp) => Op): void => {
    update((cp) => {
      const op = updater(cp);
      const mCp = compose(op)(cp);
      if (mCp.$ === 'Nothing') return cp;
      return mCp.v;
    });
  };

  return {
    model: observable,
    apply: (updater) =>
      apply_((cp) => {
        const op = updater(cp);
        if (!op) return identity();
        undoStack.push(op);
        redoStack.splice(0, redoStack.length);
        return op;
      }),
    undo: () =>
      apply_(() => {
        const op = undoStack.pop();
        if (!op) return identity();
        redoStack.push(op);
        return invert(op);
      }),
    redo: () =>
      apply_(() => {
        const op = redoStack.pop();
        if (!op) return identity();
        undoStack.push(op);
        return op;
      }),
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
  };
};
