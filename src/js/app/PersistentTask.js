// @flow

import AppStateHandler from '~/app/AppStateHandler';

class PersistentTask {
  task: () => Promise<any>;
  unsubscribe: () => void;

  doTask: () => Promise<any>;
  finish: () => void;

  constructor(task: () => Promise<any>) {
    this.task = task;
    this.unsubscribe = AppStateHandler.subscribe({
      onActive: this.doTask
    });
    this.doTask();
  }

  async doTask() {
    if (this.task) {
      await this.task();
      this.finish();
    }
  }

  finish() {
    if (this.unsubscribe)
      this.unsubscribe();
  }
}

export default PersistentTask;
