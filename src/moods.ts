import { Mode } from './send';
interface Options {
  fade?: number;
  toMax?: number;
  factor?: number;
}
export default class {
  private moods: { [mood: string]: number } = {
    A_Cheering: 0,
    A_Booing: 0,
    A_BuildUp: 0,
    A_LetDown: 0,
    A_Clapping: 0,
    B_Cheering: 0,
    B_Booing: 0,
    B_BuildUp: 0,
    B_LetDown: 0,
    B_Clapping: 0
  };
  private lastUpdated = Date.now();
  private fade: number;
  private toMax: number;
  private factor: number;
  constructor (args: Options = {}) {
    this.fade = args.fade || 4000;
    this.toMax = args.toMax || 5;
    this.factor = args.factor || .5;
  }
  cheer(button: Mode) {
    this.moods[button] = (this.moods[button] || 0) + 1 / this.toMax;
    let total = 0;
    for (let mood in this.moods) {
      this.moods[mood] = this.getValue(mood as Mode);
      total += this.moods[mood];
    }
    this.lastUpdated = Date.now();
    if (total <= 1) return;
    for (let mood in this.moods) {
      this.moods[mood] = this.moods[mood] / total;
    }
  }
  getMoods(base: any = {}) {
    const ret = {};
    let total = 0;
    for (let mood in this.moods) {
      ret[mood] = this.getValue(mood as Mode) * this.factor;
      total += ret[mood];
    }
    for (let mood in base) {
      const baseMood = base[mood] || 0;
      ret[mood] = (ret[mood] || 0) + baseMood;
      total += baseMood;
    }
    // if (total > 1) {
    //   for (let mood in ret) {
    //     ret[mood] = ret[mood] / total;
    //   }
    // }
    let leftOver = 1;
    for (let mood in ret) {
      leftOver -= ret[mood];
    }
    // console.log(ret);
    if (!('Neutral' in ret)) ret['Neutral'] = Math.max(0, leftOver);
    return ret;
  }
  getValue(button: Mode) {
    return Math.max(0, this.moods[button] - (Date.now() - this.lastUpdated) / this.fade);
  }
}