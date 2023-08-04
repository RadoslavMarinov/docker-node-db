export class Utils {
  static async getBody():Promise<{msg:string, date:string}>{
    return Promise.resolve({date: new Date().toISOString(), msg: 'Hello Riko'})
  }
}

export function isNodeVersion(version:number){
  const testPattern = new RegExp(`^v${version}.*`,'i')
  return testPattern.test(process.version)
}