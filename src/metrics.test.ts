import 'chai'
import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { User, UserHandler } from './users'
import { LevelDb } from "./leveldb"


var dbMet: MetricsHandler = new MetricsHandler('./db/test/metrics')
const dbUser: UserHandler = new UserHandler('./db/test/users')
const met = [
    new Metric(`2013-11-04`, 10)
]
const user = new User("utest", "u@mail.com", "psw")
const a: number = 0


describe('Users', function () {
    before(function () {
        LevelDb.clear('./db/test/users')
    })
    describe('#getUser', function () {
        it('should get empty array on non existing group', function () {
            dbUser.get(user.username, (err: Error | null, result?: User) => {
                expect(err).to.be.null
                expect(result).to.be.undefined
            })
        })
    })

    describe('#SaveUser', function () {
        it('should get empty array on non existing group', function () {
            dbUser.save(user, function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.empty
                expect(result).to.be.undefined
            })
        })
    })

    describe('#getUser', function () {
        it('should get an array', function () {
            dbUser.get(user.username, (err: Error | null, result?: User) => {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.not.be.null
            })
        })
    })
    after(function () {
        LevelDb.clear('./db/test/metrics')
        dbMet.db.close()
    })
})

describe('Metrics', function () {
    before(function () {
        LevelDb.clear('./db/test/metrics')
    })
    describe('#getNonExist', function () {
        it('should get empty array on non existing group', function () {
            dbMet.get("0", function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
            })
        })
    })

    describe('#delNonExist', function () {
        it('should get empty array on non existing group', function () {
            dbMet.delete("0", "0", function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
            })
        })
    })
    describe('#saveMet', function () {
        it('should get empty array on non existing group', function () {
            dbMet.save(user.username, met, function (err: Error | null, result?: Metric[]) {
                expect(result).to.be.undefined
            })
        })
    })
    describe('#saveMet', function () {
        it('should get empty array on non existing group', function () {
            dbMet.delete(user.username, '2013-11-04', function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
            })
        })
    })
    after(function () {
        LevelDb.clear('./db/test/metrics')
        dbMet.db.close()
    })
})




