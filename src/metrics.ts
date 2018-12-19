import { LevelDb } from './leveldb'
import WriteStream from 'level-ws'


export class Metric {
    public timestamp: string
    public value: number

    constructor(ts: string, v: number) {
        this.timestamp = ts
        this.value = v
    }
}

export class MetricsHandler {
    public db: any

    constructor(dbPath: string) {
        this.db = LevelDb.open(dbPath)
    }
    public get(key: string, callback: (error: Error | null, result?: Metric[]) => void) {
        const rs = this.db.createReadStream(key)
        var met: Metric[] = []
        rs.on('data', function (data: any) {
            console.log(data)
            const [, keyRetrieved, timestamp] = data.key.split(":")
            if (key == keyRetrieved) {
                met.push(new Metric(timestamp, data.value))
            }
          })
          .on('error', function (err: Error) {
            callback(err, met)
          })
          .on('close', function () {
            console.log('Stream get met closed')
          })
          .on('end', function () {
            console.log('Stream get met ended')
            callback(null, met)
          })
      }


    public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
        const stream = WriteStream(this.db)
        stream.on('error', function(err : Error) {
            callback(err)
        })
        stream.on('close', callback)
        metrics.forEach((m: Metric) => {
            stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
        })
        stream.end()
    }

    public delete(key: string, timestamp: string, callback: (error: Error | null, result?: Metric[]) => void) {
        const del = this.db.createReadStream(key)
        var met: Metric[] = []
        del.on('data', (data: any) => {
            const [, keyRetrieved, timestampRetrieved] = data.key.split(":")
            if (key == keyRetrieved &&  timestamp == timestampRetrieved) {
                this.db.del(data.key)
            }
          })
          .on('error', function (err: Error) {
            callback(err, met)
          })
          .on('close', function () {
            console.log('Stream del met closed')
          })
          .on('end', function () {
            console.log('Stream del met ended')
            callback(null, met)
          })
    }
// Pour le dev
    public getAll(callback: (error: Error | null, result?: Metric[]) => void) {
        const rs = this.db.createReadStream()
        var met: Metric[] = []
        rs.on('data', function (data: any) {
            console.log(data)
            const [, keyRetrieved, timestamp] = data.key.split(":")
            met.push(new Metric(timestamp, data.value))
          })
          .on('error', function (err: Error) {
            callback(err, met)
          })
          .on('close', function () {
            console.log('Stream get met closed')
          })
          .on('end', function () {
            console.log('Stream get met ended')
            callback(null, met)
          })
      }
}
