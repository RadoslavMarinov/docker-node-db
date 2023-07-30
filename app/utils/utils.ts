export class Utils {
  static async getBody():Promise<{msg:string, date:string}>{
    return Promise.resolve({date: new Date().toISOString(), msg: 'Hello Riko'})
  }
}