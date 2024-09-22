// Copyright (C) Microsoft Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

interface Maper<T> {
  [key: string]: T;
}
type Listen<T> = (data: T) => void;

export class Eventer<M extends Maper<any>> {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  private lisenters = {} as { [K in keyof M]: Set<Function> };

  public on<K extends keyof M>(key: K, lisenter: Listen<M[K]>) {
    let set = this.lisenters[key];
    if (set === undefined) {
      set = new Set();
      this.lisenters[key] = set;
    }

    set.add(lisenter);
    return () => this.off(key, lisenter);
  }

  public off<K extends keyof M>(key: K, lisenter?: Listen<M[K]>) {
    const set = this.lisenters[key];
    if (set === undefined) return;
    if (lisenter === undefined) set.clear();
    else set.delete(lisenter);
  }

  public emit<K extends keyof M>(key: K, data: M[K]) {
    const set = this.lisenters[key];
    if (set === undefined) return;
    // Todo: maybe implement stoping bubble
    // biome-ignore lint/complexity/noForEach: <explanation>
    set.forEach((call) => call(data));
  }
}
