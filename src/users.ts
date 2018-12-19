import { LevelDb } from "./leveldb"
var bcrypt = require('bcrypt');
import WriteStream from 'level-ws'

export class User {
    public username: string
    public email: string
    private password: string = ""
  
    constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
      this.username = username
      this.email = email
  
      if (!passwordHashed) {
        this.setPassword(password)
      } else this.password = password
    }

    public fromDb(data: any): User {
        console.log("dans le fromDb")
        const [password, email] = data.value.split(":")
        const [,username] = data.key.split(":")
        return new User(username, email, password, true)
      }
    
      public setPassword(toSet: string): void {
        var hash = bcrypt.hashSync(toSet, 10);
        this.password = hash
      }
    
      public getPassword(): string {
        return this.password
      }
    
      public validatePassword(toValidate: String): boolean {
        return bcrypt.compareSync(toValidate, this.password);
      }
    }

export class UserHandler {
    public db: any

    constructor(path: string) {
      this.db = LevelDb.open(path)
  }
    
    public get(username: string, callback: (err: Error | null, result?: User) => void) {
    const rs = this.db.createReadStream()
    var user = new User("","","")
    console.log(username)

    rs
      .on("data", (data: any) => {
        console.log(data)
        const [, usernameRetrieved] = data.key.split(":")
        if (username == usernameRetrieved) {
          user = user.fromDb(data)
          callback(null, user)
        }
      })
      .on("error", (err: Error) => {
        console.log("error")
        callback(err)
      })
      .on('close', () => {
        console.log("close")
        if(user.username == "") callback(null, undefined)
      })
      .on("end", () => {
        console.log("end")
      })
      
  }
    
    public save(user: User, callback: (err: Error | null) => void) {
        this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
        callback(err)
        })
    }
    
    public delete(username: string, callback: (err: Error | null) => void) {
        this.db.del(`user:${username}`, function (err: Error, data: any) {
          if (err) callback(err)
        })
    }
// Pour le dev
    public getAll(callback: (err: Error | null, result?: User) => void) {
      const rs = this.db.createReadStream()
      var user = new User("","","")
  
      rs
        .on("data", (data: any) => {
            user = user.fromDb(data)
            callback(null, user)
        })
        .on("error", (err: Error) => {
          console.log("error")
          callback(err)
        })
        .on('close', () => {
          console.log("close")
        })
        .on("end", () => {
          console.log("end")
        })
        
    }
    
    }