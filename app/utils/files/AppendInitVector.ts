import { Transform } from 'stream';

export class AppendInitVector extends Transform {
  constructor(
    private initVector: Buffer,
    opts = {}
  ) {
    super(opts);
    this.appended = false;
  }
  private appended: boolean;

  public _transform(chunk:any, encoding:any, cb:any) {
    if (!this.appended) {
      this.push(this.initVector);
      this.appended = true;
    }

    this.push(chunk);

    cb();
  }
}